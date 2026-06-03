import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthFooterLink, AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { Input } from "@/components/ui/input";
import { apiRegister, getApiErrorMessage } from "@/lib/api";
import { normalizeApiUser, setAuth } from "@/lib/store";
import { Clock, Lock, Mail, Phone, UserRound } from "lucide-react";
import { site } from "@/config/site";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: `Create account — ${site.siteName}` },
      { name: "description", content: `Create your free ${site.siteName} account.` },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Invalid email").max(120),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile"),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function RegisterPage() {
  const nav = useNavigate();
  const [data, setData] = useState({ fullName: "", email: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof typeof data>(k: K, v: string) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(data);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { data: body } = await apiRegister({
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        mobile: data.mobile.replace(/\D/g, "").slice(-10),
        password: data.password,
      });
      if (!body?.token || !body?.data?.user) throw new Error("Invalid server response");
      setAuth(body.token, normalizeApiUser(body.data.user));
      toast.success("Account created");
      nav({ to: "/app" });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="register"
      title="Create your account"
      subtitle={`Start trading on ${site.siteName} in under a minute. Email, mobile, and password — no OTP to sign up.`}
      footer={
        <>
          Already have an account? <AuthFooterLink to="/login">Sign in</AuthFooterLink>
          <span className="mx-2 text-muted-foreground/50">·</span>
          <AuthFooterLink to="/forgot-password">Forgot password</AuthFooterLink>
        </>
      }
    >
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/15 text-[11px] font-medium text-foreground/90">
          <Clock className="h-3 w-3 text-accent" />
          ~1 min signup
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success/10 border border-success/20 text-[11px] font-medium text-foreground/90">
          No OTP required
        </span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <AuthField label="Full name" icon={UserRound} className="sm:col-span-1">
            <Input
              value={data.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </AuthField>
          <AuthField label="Email" icon={Mail} className="sm:col-span-1">
            <Input
              type="email"
              value={data.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </AuthField>
        </div>
        <AuthField label="Mobile number" icon={Phone} hint="10 digits">
          <Input
            value={data.mobile}
            onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="98xxxxxxxx"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
          />
        </AuthField>
        <AuthField label="Password" icon={Lock} hint="Min. 6 characters">
          <Input
            type="password"
            value={data.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
        </AuthField>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed px-0.5">
          By continuing you agree to our <AuthFooterLink to="/terms">Terms</AuthFooterLink> and{" "}
          <AuthFooterLink to="/privacy">Privacy Policy</AuthFooterLink>.
        </p>
        <AuthSubmitButton loading={loading}>Create account</AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
