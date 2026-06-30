import { Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  ChevronRight,
  Eye,
  EyeOff,
  Receipt,
  Settings,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { fmtUsdtNumber, UsdtMark, UsdtWord } from "@/components/app/UsdtMark";
import { TxnRow } from "@/components/app/TxnRow";
import { fmtINR } from "@/lib/store";
import type { Txn } from "@/lib/store";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const BALANCE_LABEL = `${site.siteName} USDT balance`;

const QUICK_ACTIONS = [
  {
    to: "/app/buy",
    title: "Buy USDT",
    description: "Purchase with UPI, bank transfer, or card.",
    icon: ArrowDownToLine,
    glow: "dashboard-action-glow-buy",
    iconWrap: "border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-transparent shadow-[0_0_24px_-8px_rgba(52,211,153,0.35)]",
    iconClass: "text-emerald-300",
  },
  {
    to: "/app/sell",
    title: "Sell USDT",
    description: "Convert to INR with fast settlement.",
    icon: ArrowUpFromLine,
    glow: "dashboard-action-glow-sell",
    iconWrap: "border-primary/35 bg-gradient-to-br from-primary/30 via-accent/10 to-transparent shadow-[0_0_24px_-8px_rgba(139,92,246,0.35)]",
    iconClass: "text-accent",
  },
  {
    to: "/app/withdraw",
    title: "Withdraw USDT",
    description: "Send to TRC20, ERC20, or BEP20 wallets.",
    icon: Wallet,
    glow: "dashboard-action-glow-withdraw",
    iconWrap: "border-violet-400/30 bg-gradient-to-br from-violet-500/28 via-violet-500/10 to-transparent shadow-[0_0_24px_-8px_rgba(167,139,250,0.3)]",
    iconClass: "text-violet-300",
  },
] as const;

function truncateEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, 12);
  if (local.length <= 6) return `${local}@${domain.slice(0, 4)}…`;
  return `${local.slice(0, 6)}…@${domain.slice(0, 4)}…`;
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function SplitUsdtBalance({ value, hidden }: { value: number; hidden: boolean }) {
  if (hidden) {
    return <span className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground">••••••</span>;
  }

  const formatted = fmtUsdtNumber(value);
  const [whole, fraction = "00"] = formatted.split(".");

  return (
    <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
      <span className="inline-flex items-baseline font-black tracking-tight text-foreground">
        <span className="text-5xl sm:text-6xl lg:text-[4.25rem] leading-none">{whole}</span>
        <span className="text-2xl sm:text-3xl lg:text-4xl text-foreground/75">.{fraction}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-foreground/90 pb-1">
        <UsdtMark size="lg" className="sm:h-7 sm:w-7" />
        USDT
      </span>
    </span>
  );
}

function DashboardBalanceLiveRate({ rate, hidden }: { rate: number; hidden: boolean }) {
  return (
    <div className="mx-auto mt-4 w-full max-w-[17rem] sm:max-w-[18rem]">
      <div className="relative w-full min-w-0">
        <span
          className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-primary/15 blur-lg opacity-60"
          aria-hidden
        />
        <div
          className={cn(
            "relative flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl",
            "border border-primary/25 bg-white/[0.05] px-3 py-2 backdrop-blur-md",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_-12px_rgba(139,92,246,0.45)]",
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Sparkles className="h-3 w-3 shrink-0 text-accent" />
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-accent">Live rate</span>
          </span>
          <span className="shrink-0 text-xs font-bold tabular-nums">
            {hidden ? (
              <span className="text-foreground/70">•••</span>
            ) : (
              <span className="inline-flex items-center gap-0.5">
                <span className="gradient-text">₹{rate.toFixed(2)}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">/</span>
                <UsdtWord size="2xs" className="text-[10px] font-semibold text-foreground" />
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function DashboardActionCard({
  to,
  title,
  description,
  icon: Icon,
  glow,
  iconWrap,
  iconClass,
}: (typeof QUICK_ACTIONS)[number]) {
  return (
    <Link
      to={to}
      className={cn(
        "dashboard-action-card group relative block overflow-hidden rounded-[1.25rem] border border-white/[0.09]",
        "bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-4 sm:p-[1.125rem]",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16]",
        glow,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />

      <div className="relative flex items-center gap-3.5 sm:gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-sm sm:h-[3.25rem] sm:w-[3.25rem]",
            iconWrap,
          )}
        >
          <Icon className={cn("h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]", iconClass)} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-base font-bold tracking-tight text-foreground sm:text-[1.05rem]">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-secondary sm:text-[13px]">{description}</p>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-muted-foreground transition group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-accent">
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function DashboardTxnSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 animate-pulse"
        >
          <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded-md bg-white/[0.06]" />
            <div className="h-3 w-24 rounded-md bg-white/[0.04]" />
          </div>
          <div className="h-8 w-16 rounded-lg bg-white/[0.05]" />
        </div>
      ))}
    </div>
  );
}

function DashboardEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-5 py-8 text-center sm:py-10">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
        <Receipt className="h-5 w-5 text-accent" />
      </span>
      <p className="text-sm font-semibold text-foreground">No activity yet</p>
      <p className="mt-1 text-xs text-secondary">Your buys, sells, and withdrawals will show up here.</p>
      <Link
        to="/app/buy"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
      >
        Make your first purchase
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function DashboardActivitySection({
  txns,
  isLoading,
}: {
  txns: Txn[];
  isLoading: boolean;
}) {
  const recent = txns.slice(0, 5);

  return (
    <section className="dashboard-activity-panel relative mx-4 overflow-hidden rounded-[1.65rem] border border-white/[0.08] px-4 py-5 sm:mx-0 sm:px-6 sm:py-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,color-mix(in_oklab,var(--brand-blue)_14%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />

      <div className="relative mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
            <Receipt className="h-4.5 w-4.5 text-accent" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Activity</p>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Recent transactions</h2>
          </div>
        </div>
        <Link
          to="/app/transactions"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-accent transition hover:border-accent/30 hover:bg-accent/10"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative">
        {isLoading ? (
          <DashboardTxnSkeleton />
        ) : recent.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="space-y-2">
            {recent.map((t) => (
              <TxnRow key={`${t.type}-${t.documentId}`} txn={t} variant="dashboard" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function DashboardHome({
  firstName,
  fullName,
  email,
  balanceUsdt,
  rate,
  txns,
  isLoading,
}: {
  firstName: string;
  fullName: string;
  email: string;
  balanceUsdt: number;
  rate: number;
  txns: Txn[];
  isLoading: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const portfolioInr = balanceUsdt * rate;

  return (
    <div className="dashboard-ref -mx-4 -mt-6 space-y-4 sm:mx-0 sm:mt-0 sm:space-y-5 lg:space-y-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-5 xl:gap-6">
        <section className="dashboard-hero relative overflow-hidden px-5 pb-10 pt-4 sm:rounded-[2rem] sm:px-8 sm:pb-12 sm:pt-6 lg:sticky lg:top-24 lg:px-8 lg:pb-12 lg:pt-6 xl:px-10">
          <div className="pointer-events-none absolute inset-0 dashboard-hero-mesh" aria-hidden />
          <div
            className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-bold text-foreground backdrop-blur-md">
                {initials(fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
                  {firstName}
                </p>
                <p className="truncate text-xs text-secondary sm:text-sm">{truncateEmail(email)}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHidden((h) => !h)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-foreground/80 backdrop-blur-md transition hover:bg-white/15"
                aria-label={hidden ? "Show balance" : "Hide balance"}
              >
                {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <Link
                to="/app/profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-foreground/80 backdrop-blur-md transition hover:bg-white/15"
                aria-label="Profile settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mt-10 text-center sm:mt-12 lg:mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary">
              {BALANCE_LABEL}
            </p>
            <div className="mt-3 sm:mt-4">
              <SplitUsdtBalance value={balanceUsdt} hidden={hidden} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-3.5 py-1.5 text-sm font-medium text-secondary backdrop-blur-sm">
                <span className="text-white/45">≈</span>
                <span className="font-semibold tabular-nums text-foreground/90">
                  {hidden ? "••••••" : fmtINR(portfolioInr)}
                </span>
              </span>
            </div>
            <DashboardBalanceLiveRate rate={rate} hidden={hidden} />
          </div>
        </section>

        <section className="dashboard-dark-sheet relative px-4 py-5 sm:mt-0 sm:rounded-[2rem] sm:px-6 sm:py-6 lg:px-7 lg:py-7 xl:px-8">
          <div className="relative mb-4 sm:mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Trade</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">Quick actions</h2>
          </div>
          <div className="relative space-y-3">
            {QUICK_ACTIONS.map((action) => (
              <DashboardActionCard key={action.to} {...action} />
            ))}
          </div>
        </section>
      </div>

      <DashboardActivitySection txns={txns} isLoading={isLoading} />
    </div>
  );
}
