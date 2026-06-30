import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff, Wallet } from "lucide-react";
import { fmtUsdtNumber, UsdtMark } from "@/components/app/UsdtMark";
import { fmtINR } from "@/lib/store";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    to: "/app/buy",
    label: "Buy",
    icon: ArrowDownToLine,
    variant: "primary" as const,
  },
  {
    to: "/app/sell",
    label: "Sell",
    icon: ArrowUpFromLine,
    variant: "glass" as const,
  },
  {
    to: "/app/withdraw",
    label: "Withdraw",
    icon: Wallet,
    variant: "glass" as const,
  },
] as const;

export function WalletBalanceCard({
  balanceUsdt,
  rate,
  hidden,
  onToggleHidden,
}: {
  balanceUsdt: number;
  rate: number;
  hidden: boolean;
  onToggleHidden: () => void;
}) {
  return (
    <div className="wallet-card-frame">
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.7rem] opacity-70 blur-xl wallet-card-halo"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.1] wallet-card-surface shadow-[0_32px_64px_-24px_rgba(0,0,0,0.55)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,color-mix(in_oklab,var(--brand-violet)_35%,transparent),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_100%,color-mix(in_oklab,var(--brand-blue)_28%,transparent),transparent_50%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/[0.07] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  {site.coinName} balance
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleHidden}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.08] text-white/80 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.14] hover:text-white"
              aria-label={hidden ? "Show balance" : "Hide balance"}
            >
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-5 sm:mt-6">
            <div className="text-[2.65rem] sm:text-[3.25rem] lg:text-[3.5rem] font-bold leading-none tracking-tight text-white tabular-nums">
              {hidden ? (
                <span className="text-white/90">••••••</span>
              ) : (
                <span className="inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="drop-shadow-[0_2px_24px_rgba(255,255,255,0.12)]">
                    {fmtUsdtNumber(balanceUsdt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[1.65rem] sm:text-[2rem] lg:text-[2.15rem] font-semibold text-white/95">
                    <UsdtMark size="lg" className="sm:h-7 sm:w-7" />
                    USDT
                  </span>
                </span>
              )}
            </div>

            <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-medium text-white/45">≈</span>
              <span className="text-sm font-semibold tabular-nums text-white/85">
                {hidden ? "••••••" : fmtINR(balanceUsdt * rate)}
              </span>
            </div>
          </div>

          <div className="mt-7 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            {ACTIONS.map(({ to, label, icon: Icon, variant }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3.5 sm:py-4 text-sm font-semibold transition-all duration-300",
                  "hover:-translate-y-0.5 active:translate-y-0",
                  variant === "primary"
                    ? "border border-white/20 bg-white text-primary shadow-[0_8px_32px_-8px_rgba(255,255,255,0.35)] hover:bg-white/95 hover:shadow-[0_12px_40px_-8px_rgba(255,255,255,0.45)]"
                    : "border border-white/[0.12] bg-white/[0.07] text-white backdrop-blur-md hover:border-white/22 hover:bg-white/[0.12]",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    variant === "primary"
                      ? "bg-primary/10 group-hover:bg-primary/15"
                      : "bg-white/[0.08] group-hover:bg-white/[0.12]",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
