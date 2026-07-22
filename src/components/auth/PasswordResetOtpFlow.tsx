import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  apiResendResetOtp,
  apiResetPasswordWithOtp,
  apiSendPasswordResetOtp,
  getApiErrorMessage,
} from "@/lib/api";

const RESEND_COOLDOWN_SEC = 60;
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

function normalizeMobileInput(raw: string) {
  return raw.replace(/\D/g, "").slice(-10);
}

type Phase = "request" | "reset";

type Props = {
  /** Pre-filled 10-digit mobile (e.g. logged-in user). */
  presetIdentifier?: string;
  /** Hide the identifier field — only use `presetIdentifier` (profile flow). */
  hideIdentifierField?: boolean;
  /** Forgot-password page: mobile number input only. */
  mobileOnly?: boolean;
  submitLabel?: string;
  onSuccess?: () => void;
};

export function PasswordResetOtpFlow({
  presetIdentifier = "",
  hideIdentifierField = false,
  mobileOnly = false,
  submitLabel = "Update password",
  onSuccess,
}: Props) {
  const [identifier, setIdentifier] = useState(presetIdentifier);
  const [phase, setPhase] = useState<Phase>("request");
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSec, setResendSec] = useState(0);

  useEffect(() => {
    setIdentifier(presetIdentifier);
  }, [presetIdentifier]);

  useEffect(() => {
    if (resendSec <= 0) return;
    const t = window.setInterval(() => setResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendSec]);

  const normalizedMobile = normalizeMobileInput(
    hideIdentifierField ? presetIdentifier : identifier,
  );
  const effectiveRequestId = hideIdentifierField ? normalizeMobileInput(presetIdentifier) : normalizedMobile;
  const mobileValid = INDIAN_MOBILE_RE.test(effectiveRequestId);

  const sendOtp = async () => {
    if (!effectiveRequestId) {
      toast.error(mobileOnly || hideIdentifierField ? "Enter your mobile number" : "Enter your email or mobile");
      return;
    }
    if ((mobileOnly || hideIdentifierField) && !mobileValid) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiSendPasswordResetOtp(effectiveRequestId);
      if (!data.success) throw new Error(data.message || "Failed to send OTP");
      setMaskedPhone(data.data?.maskedPhone ?? null);
      setPhase("reset");
      setResendSec(RESEND_COOLDOWN_SEC);
      toast.success(data.message || "OTP sent to your mobile");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!effectiveRequestId || !mobileValid) {
      toast.error("Cannot resend — start again");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiResendResetOtp(effectiveRequestId);
      if (!data.success) throw new Error(data.message || "Resend failed");
      setResendSec(RESEND_COOLDOWN_SEC);
      toast.success(data.message || "OTP resent");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    const o = otp.replace(/\D/g, "");
    if (o.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiResetPasswordWithOtp({
        identifier: effectiveRequestId,
        otp: o,
        newPassword,
      });
      if (!data.success) throw new Error(data.message || "Reset failed");
      toast.success(data.message || "Password updated");
      onSuccess?.();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {phase === "request" ? (
        <>
          {!hideIdentifierField ? (
            <div className="space-y-1.5">
              <Label className="text-xs text-secondary uppercase tracking-wide">
                {mobileOnly ? "Mobile number" : "Email or mobile"}
              </Label>
              <div className="rounded-xl bg-surface border border-border ring-focus">
                <Input
                  value={identifier}
                  onChange={(e) =>
                    setIdentifier(
                      mobileOnly
                        ? e.target.value.replace(/\D/g, "").slice(0, 10)
                        : e.target.value,
                    )
                  }
                  placeholder={mobileOnly ? "98xxxxxxxx" : "you@email.com or 98xxxxxxxx"}
                  type={mobileOnly ? "tel" : "text"}
                  inputMode={mobileOnly ? "numeric" : undefined}
                  autoComplete={mobileOnly ? "tel-national" : "username"}
                  className="border-0 bg-transparent h-11"
                />
              </div>
              {mobileOnly ? (
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send a 6-digit OTP via SMS to this registered number.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-secondary">
              We&apos;ll send a 6-digit OTP to your registered mobile
              {maskedPhone ? (
                <>
                  {" "}
                  (<span className="font-mono text-foreground">{maskedPhone}</span>)
                </>
              ) : presetIdentifier ? (
                <> (••••••••{presetIdentifier.replace(/\D/g, "").slice(-2)})</>
              ) : null}
              .
            </p>
          )}
          <div className="cta-shadow-zone">
            <Button
              type="button"
              disabled={loading || !effectiveRequestId || (mobileOnly && !mobileValid)}
              onClick={sendOtp}
              className="w-full h-11 gradient-primary border-0 hover-glow"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
            </Button>
          </div>
        </>
      ) : (
        <>
          {maskedPhone ? (
            <p className="text-xs text-muted-foreground">
              Code sent to <span className="font-mono text-foreground">{maskedPhone}</span>
            </p>
          ) : null}
          <div className="space-y-1.5">
            <Label className="text-xs text-secondary uppercase tracking-wide">OTP</Label>
            <div className="rounded-xl bg-surface border border-border ring-focus">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="border-0 bg-transparent h-11 font-mono tracking-widest"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-secondary uppercase tracking-wide">New password</Label>
            <div className="rounded-xl bg-surface border border-border ring-focus">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className="border-0 bg-transparent h-11"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-secondary uppercase tracking-wide">
              Confirm password
            </Label>
            <div className="rounded-xl bg-surface border border-border ring-focus">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                className="border-0 bg-transparent h-11"
              />
            </div>
          </div>
          <div className="cta-shadow-zone">
            <Button
              type="button"
              disabled={loading}
              onClick={submitReset}
              className="w-full h-11 gradient-primary border-0 hover-glow"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-between items-center text-sm">
            <button
              type="button"
              className="text-accent hover:underline disabled:opacity-50"
              disabled={loading || resendSec > 0}
              onClick={resend}
            >
              {resendSec > 0 ? `Resend OTP in ${resendSec}s` : "Resend OTP"}
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setPhase("request");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setMaskedPhone(null);
              }}
            >
              Start over
            </button>
          </div>
        </>
      )}
    </div>
  );
}
