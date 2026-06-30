import { Sparkles } from "lucide-react";
import { UsdtWord } from "@/components/app/UsdtMark";
import { cn } from "@/lib/utils";

export function FlowRateHighlight({
  variant,
  rate,
  extra,
  className,
}: {
  variant: "buy" | "sell";
  rate: number;
  extra?: React.ReactNode;
  className?: string;
}) {
  const label = variant === "buy" ? "Buy rate" : "Sell rate";

  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full min-w-0">
        <span
          className="live-rate-halo-bg pointer-events-none absolute inset-0 -z-10 rounded-xl blur-lg animate-live-rate-halo opacity-80"
          aria-hidden
        />
        <div
          className={cn(
            "relative flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-primary/30",
            "bg-gradient-to-r from-primary/15 via-surface/80 to-accent/10 px-3 py-2 sm:px-3.5 sm:py-2.5",
            "animate-sell-price-glow text-sm shadow-[0_0_18px_-10px] shadow-primary/35",
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">{label}</span>
          </span>

          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm sm:text-[15px]">
            <span className="inline-flex items-baseline gap-1 font-bold tabular-nums leading-none">
              <span className="gradient-text">₹{rate.toFixed(2)}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                / <UsdtWord size="2xs" className="font-semibold text-muted-foreground" />
              </span>
            </span>
            {extra ? (
              <>
                <span className="text-muted-foreground/70">·</span>
                <span className="text-xs font-medium text-secondary sm:text-sm">{extra}</span>
              </>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}
