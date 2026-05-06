import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, logout } from "@/lib/store";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PasswordResetOtpFlow } from "@/components/auth/PasswordResetOtpFlow";
import { site } from "@/config/site";
import { FormattedUsdt, UsdtWord } from "@/components/app/UsdtMark";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: `Profile — ${site.siteName}` }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const auth = useAuth();
  const nav = useNavigate();
  const [changePwdOpen, setChangePwdOpen] = useState(false);
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
      </div>

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
