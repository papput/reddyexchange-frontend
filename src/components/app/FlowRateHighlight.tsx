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
          className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-primary/15 blur-lg opacity-60"
          aria-hidden
        />
        <div
          className={cn(
            "relative flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary/25",
            "sm:flex-row sm:items-center sm:justify-between sm:gap-3",
            "bg-white/[0.05] px-3.5 py-2.5 backdrop-blur-md",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_-12px_rgba(45,212,191,0.35)]",
          )}
        >
          <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
            <span className="inline-flex shrink-0 items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                {label}
              </span>
            </span>

            <span className="inline-flex shrink-0 items-baseline gap-1 whitespace-nowrap font-bold tabular-nums leading-none text-base sm:text-[15px]">
              <span className="gradient-text">₹{rate.toFixed(2)}</span>
              <span className="inline-flex items-baseline gap-1 text-xs font-semibold text-muted-foreground">
                / <UsdtWord size="2xs" className="font-semibold text-muted-foreground" />
              </span>
            </span>
          </div>

          {extra ? (
            <span className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2 text-xs font-medium text-secondary sm:border-t-0 sm:pt-0 sm:text-sm">
              <span className="text-muted-foreground sm:hidden">Limit</span>
              <span className="whitespace-nowrap tabular-nums">{extra}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
