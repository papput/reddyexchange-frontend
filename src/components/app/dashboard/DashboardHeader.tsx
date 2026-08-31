import { Sparkles, TrendingUp } from "lucide-react";
import { InrPerUsdtRate } from "@/components/app/UsdtMark";
import { cn } from "@/lib/utils";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({
  firstName,
  rate,
  className,
}: {
  firstName: string;
  rate: number;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 sm:gap-5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/90">
            Dashboard
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-[1.75rem] lg:text-[2rem] font-bold tracking-tight leading-tight">
            {getGreeting()},{" "}
            <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="mt-2 text-sm text-secondary leading-relaxed max-w-md">
            Your portfolio at a glance — buy, sell, or withdraw in seconds.
          </p>
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[220px] shrink-0">
          <span
            className="live-rate-halo-bg pointer-events-none absolute inset-0 -z-10 rounded-2xl blur-xl animate-live-rate-halo"
            aria-hidden
          />
          <div className="relative flex items-center justify-between sm:justify-center gap-+2.5 gap-2.5 rounded-2xl glass border border-white/[0.08] px-4 py-3 animate-sell-price-glow">
            <span className="inline-flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 text-accent shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Live rate</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-sm tabular-nums">
              <InrPerUsdtRate inr={rate} size="xs" />
              <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
