import { Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  PieChart,
  Receipt,
  Settings,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { fmtUsdtNumber, InrPerUsdtRate, UsdtMark } from "@/components/app/UsdtMark";
import { TxnRow } from "@/components/app/TxnRow";
import { fmtINR } from "@/lib/store";
import type { Txn } from "@/lib/store";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

type RowAccent = "buy" | "sell" | "withdraw" | "rate" | "portfolio" | "pending";

const ROW_ACCENT: Record<RowAccent, { iconWrap: string; icon: string }> = {
  buy: {
    iconWrap: "border-emerald-500/25 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
    icon: "text-emerald-400",
  },
  sell: {
    iconWrap: "border-primary/25 bg-gradient-to-br from-primary/25 to-primary/5",
    icon: "text-accent",
  },
  withdraw: {
    iconWrap: "border-violet-500/25 bg-gradient-to-br from-violet-500/25 to-violet-500/5",
    icon: "text-violet-300",
  },
  rate: {
    iconWrap: "border-sky-500/25 bg-gradient-to-br from-sky-500/20 to-sky-500/5",
    icon: "text-sky-300",
  },
  portfolio: {
    iconWrap: "border-amber-500/25 bg-gradient-to-br from-amber-500/20 to-amber-500/5",
    icon: "text-amber-300",
  },
  pending: {
    iconWrap: "border-orange-500/25 bg-gradient-to-br from-orange-500/20 to-orange-500/5",
    icon: "text-orange-300",
  },
};

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

function DashboardSheetRow({
  to,
  title,
  description,
  icon: Icon,
  accent,
  trailing,
  onClick,
}: {
  to?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: RowAccent;
  trailing?: React.ReactNode;
  onClick?: () => void;
}) {
  const tone = ROW_ACCENT[accent];

  const inner = (
    <>
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          tone.iconWrap,
        )}
      >
        <Icon className={cn("h-5 w-5", tone.icon)} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-secondary leading-relaxed">{description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 pl-2">
        {trailing}
        {to ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition group-hover:border-white/15 group-hover:bg-white/[0.08]">
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </>
  );

  const className =
    "group flex w-full items-center gap-4 border-b border-white/[0.07] py-4 sm:py-5 text-left transition-colors hover:bg-white/[0.025]";

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}

function DashboardTxnSkeleton() {
  return (
    <div className="divide-y divide-white/[0.06]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-4 animate-pulse">
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
    <div className="py-8 sm:py-10 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04]">
        <Receipt className="h-5 w-5 text-accent" />
      </span>
      <p className="text-base font-semibold text-foreground">No activity yet</p>
      <p className="mt-1.5 text-sm text-secondary">Your buys, sells, and withdrawals will show up here.</p>
      <Link
        to="/app/buy"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
      >
        Make your first purchase
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
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

  const pendingCount = useMemo(
    () => txns.filter((t) => t.status === "pending").length,
    [txns],
  );

  const recent = txns.slice(0, 5);
  const portfolioInr = balanceUsdt * rate;

  return (
    <div className="dashboard-ref -mx-4 -mt-6 sm:mx-0 sm:mt-0 lg:max-w-none lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-5 xl:gap-6">
      <section className="dashboard-hero relative overflow-hidden px-5 pb-10 pt-4 sm:px-8 sm:pb-12 sm:pt-6 lg:sticky lg:top-24 lg:rounded-[2rem] lg:px-8 lg:pb-12 lg:pt-6 xl:px-10">
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
            {site.coinName} balance
          </p>
          <div className="mt-3 sm:mt-4">
            <SplitUsdtBalance value={balanceUsdt} hidden={hidden} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-secondary">
              ≈ {hidden ? "••••••" : fmtINR(portfolioInr)}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {hidden ? "•••" : <InrPerUsdtRate inr={rate} size="xs" className="text-emerald-400" />}
            </span>
          </div>
        </div>
      </section>

      <section className="dashboard-dark-sheet relative mt-0 px-4 pb-8 pt-1 sm:mt-3 sm:rounded-[2rem] sm:px-6 sm:pb-10 lg:mt-0 lg:min-h-[32rem] lg:px-7 lg:pb-10 xl:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <DashboardSheetRow
            to="/app/buy"
            title="Buy"
            description="Purchase USDT with UPI, bank transfer, or card."
            icon={ArrowDownToLine}
            accent="buy"
          />
          <DashboardSheetRow
            to="/app/sell"
            title="Sell"
            description="Convert USDT to INR with fast settlement."
            icon={ArrowUpFromLine}
            accent="sell"
          />
          <DashboardSheetRow
            to="/app/withdraw"
            title="Withdraw"
            description="Send USDT to TRC20, ERC20, or BEP20 wallets."
            icon={Wallet}
            accent="withdraw"
          />

          <DashboardSheetRow
            title="Live rate"
            description="Updated in real time across the platform."
            icon={TrendingUp}
            accent="rate"
            trailing={
              <p className="text-base sm:text-lg font-bold tabular-nums text-foreground">
                {hidden ? "•••" : <InrPerUsdtRate inr={rate} size="sm" />}
              </p>
            }
          />

          <DashboardSheetRow
            title="Portfolio"
            description={
              hidden ? "Balance hidden" : `${balanceUsdt.toFixed(2)} USDT in your wallet`
            }
            icon={PieChart}
            accent="portfolio"
            trailing={
              <p className="text-base sm:text-lg font-bold tabular-nums text-foreground">
                {hidden ? "••••••" : fmtINR(portfolioInr)}
              </p>
            }
          />

          <DashboardSheetRow
            to="/app/transactions"
            title="Pending orders"
            description={
              pendingCount > 0
                ? `${pendingCount} order${pendingCount === 1 ? "" : "s"} awaiting confirmation.`
                : "All caught up — no pending orders."
            }
            icon={Clock}
            accent="pending"
            trailing={
              <span
                className={cn(
                  "inline-flex min-w-[2rem] items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                  pendingCount > 0
                    ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                    : "bg-white/[0.06] text-secondary ring-1 ring-white/[0.06]",
                )}
              >
                {pendingCount}
              </span>
            }
          />

          <div className="pt-5 sm:pt-7">
            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 to-accent/10">
                <Receipt className="h-5 w-5 text-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Recent activity</h2>
                <p className="text-sm text-secondary">Latest buys, sells & withdrawals</p>
              </div>
              <Link
                to="/app/transactions"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-accent transition hover:border-primary/30 hover:bg-primary/10"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <DashboardTxnSkeleton />
            ) : recent.length === 0 ? (
              <DashboardEmptyState />
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {recent.map((t) => (
                  <TxnRow key={`${t.type}-${t.documentId}`} txn={t} variant="dashboard-dark" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
