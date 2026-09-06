import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth, logout, updateAuthUser, normalizeApiUser } from "@/lib/store";
import {
  Mail,
  Phone,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Wallet,
  Receipt,
  ChevronRight,
  KeyRound,
  RefreshCcw,
  MessageCircle,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PasswordResetOtpFlow } from "@/components/auth/PasswordResetOtpFlow";
import { site } from "@/config/site";
import { FormattedUsdt, UsdtWord } from "@/components/app/UsdtMark";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { apiUpdateProfile, getApiErrorMessage } from "@/lib/api";
import {
  SupportChannelIcons,
  useSupportContactAction,
} from "@/components/site/SupportContact";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: `Profile — ${site.siteName}` }] }),
  component: ProfilePage,
});

function formatTelegramDisplay(raw?: string) {
  const t = String(raw || "").trim();
  if (!t) return "Not set";
  if (/^\d+$/.test(t)) return t;
  return t.startsWith("@") ? t : `@${t}`;
}

function ProfilePage() {
  const auth = useAuth();
  const nav = useNavigate();
  const { data: settings } = usePublicSettings();
  const { channels, action, trigger, chooser, label } = useSupportContactAction(settings);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [telegramDraft, setTelegramDraft] = useState("");
  const [telegramSaving, setTelegramSaving] = useState(false);
  if (!auth) return null;
  const u = auth.user;
  const initials = u.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const memberSince = new Date(u.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" });

  const bal = u.primeExchUsdtBalance ?? 0;

  const openTelegramEditor = () => {
    const current = String(u.telegramId || "").trim();
    setTelegramDraft(
      current && !/^\d+$/.test(current) && !current.startsWith("@") ? `@${current}` : current,
    );
    setTelegramOpen(true);
  };

  const saveTelegramId = async () => {
    const raw = telegramDraft.trim();
    if (raw) {
      const t = raw.startsWith("@") ? raw.slice(1) : raw;
      if (!/^\d{5,15}$/.test(t) && !/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(t)) {
        toast.error("Enter a valid Telegram username or ID (e.g. @username)");
        return;
      }
    }
    setTelegramSaving(true);
    try {
      const cleaned = raw ? raw.replace(/^@/, "") : "";
      const { data } = await apiUpdateProfile({ telegramId: cleaned });
      if (data?.data) {
        updateAuthUser(normalizeApiUser(data.data));
      } else {
        updateAuthUser({ telegramId: cleaned });
      }
      toast.success("Telegram ID updated");
      setTelegramOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setTelegramSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl gradient-primary grid place-items-center text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <div className="font-semibold text-lg truncate">{u.fullName}</div>
            <div className="text-xs text-secondary flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-success" /> Verified account
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <Wallet className="h-4 w-4 text-accent shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {site.coinName}
              </div>
              <div className="text-base font-bold tabular-nums inline-flex items-center gap-1">
                <FormattedUsdt value={bal} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <Info icon={UserIcon} label="Member since" value={memberSince} />
        <Info icon={Mail} label="Email" value={u.email} />
        <Info icon={Phone} label="Mobile" value={`+91 ${u.mobile}`} />
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-surface grid place-items-center shrink-0">
            <MessageCircle className="h-4 w-4 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Telegram ID</div>
            <div className="text-sm font-medium break-all">{formatTelegramDisplay(u.telegramId)}</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 h-8 px-2"
            onClick={openTelegramEditor}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      <Dialog open={telegramOpen} onOpenChange={setTelegramOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Telegram ID</DialogTitle>
            <DialogDescription>
              No OTP needed. Use your Telegram username (e.g. @username) or numeric ID.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={telegramDraft}
            onChange={(e) => setTelegramDraft(e.target.value)}
            placeholder="@yourusername"
            maxLength={64}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTelegramOpen(false)}
              disabled={telegramSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveTelegramId}
              disabled={telegramSaving}
              className="gradient-primary border-0"
            >
              {telegramSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changePwdOpen} onOpenChange={setChangePwdOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-surface/60 transition border border-border/50 text-left"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 grid place-items-center shrink-0">
              <KeyRound className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Change password</div>
              <div className="text-xs text-muted-foreground">
                OTP to your registered mobile, then set a new password
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              We send a 6-digit code to the mobile number on your account. Then choose a new
              password.
            </DialogDescription>
          </DialogHeader>
          {changePwdOpen ? (
            <PasswordResetOtpFlow
              presetIdentifier={u.mobile}
              hideIdentifierField
              submitLabel="Save new password"
              onSuccess={() => setChangePwdOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Link
        to="/app/withdraw"
        className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-surface/60 transition border border-border/50"
      >
        <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center shrink-0">
          <Wallet className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm inline-flex items-center gap-1">
            Withdraw to on-chain <UsdtWord size="xs" />
          </div>
          <div className="text-xs text-muted-foreground">TRC20, ERC20, or BEP20</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>

      <Link
        to="/app/transactions"
        className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-surface/60 transition border border-border/50"
      >
        <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center shrink-0">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Transactions</div>
          <div className="text-xs text-muted-foreground">View buys, sells, and withdrawals</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>

      <Link
        to="/app/refunds"
        className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-surface/60 transition border border-border/50"
      >
        <div className="h-10 w-10 rounded-xl bg-rose-500/15 grid place-items-center shrink-0">
          <RefreshCcw className="h-5 w-5 text-rose-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Refunds</div>
          <div className="text-xs text-muted-foreground">Request refund for your buys</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-secondary px-1">Support</h2>
        <div className="glass rounded-2xl divide-y divide-border/60 overflow-hidden border border-border/50">
          {action !== "none" ? (
            <button
              type="button"
              onClick={trigger}
              className="w-full flex items-center gap-3 p-4 hover:bg-surface/60 transition text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 grid place-items-center shrink-0">
                <SupportChannelIcons channels={channels} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{label} support</div>
                <div className="text-xs text-muted-foreground">
                  {action === "chooser"
                    ? "Choose WhatsApp or Telegram"
                    : action === "telegram"
                      ? "Chat with us on Telegram"
                      : "Chat with us on WhatsApp"}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ) : null}
          <Link
            to="/contact"
            className="flex items-center gap-3 p-4 hover:bg-surface/60 transition"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center shrink-0">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Contact us</div>
              <div className="text-xs text-muted-foreground">Help, feedback & enquiries</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        </div>
      </div>

      {chooser}

      <Button
        variant="outline"
        className="w-full glass border-border/60 h-11 text-destructive hover:text-destructive"
        onClick={() => {
          logout();
          nav({ to: "/" });
        }}
      >
        <LogOut className="h-4 w-4 mr-2" /> Logout
      </Button>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-surface grid place-items-center">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
