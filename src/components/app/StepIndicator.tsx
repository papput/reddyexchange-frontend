import type { ReactNode } from "react";
import { Check } from "lucide-react";

/** Single-line animated progress (no step numbers). */
export function BuyFlowProgressBar({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: ReactNode;
}) {
  const denom = Math.max(1, total - 1);
  const pct = Math.min(100, Math.max(0, ((step - 1) / denom) * 100));
  return (
    <div className="mb-6">
      <div className="h-2.5 w-full rounded-full bg-border/80 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/70 transition-[width] duration-500 ease-out relative overflow-hidden min-w-0"
          style={{ width: `${pct}%` }}
        >
          <span className="absolute inset-0 opacity-50 shimmer" aria-hidden />
        </div>
      </div>
      <p className="mt-2.5 text-sm text-secondary">
        <span className="text-foreground font-medium">{label}</span>
      </p>
    </div>
  );
}

export function StepIndicator({
  step,
  total,
  labels,
  dense,
}: {
  step: number;
  total: number;
  labels: ReactNode[];
  /** Tighter layout for flows that should fit one viewport */
  dense?: boolean;
}) {
  const dot = dense ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  const icon = dense ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className={dense ? "mb-3" : "mb-6"}>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={i} className="flex-1 flex items-center gap-1">
              <div
                className={`${dot} rounded-full grid place-items-center font-semibold transition-all shrink-0 ${done ? "bg-success text-success-foreground" : active ? "gradient-primary text-white shadow-[0_0_12px_-2px_var(--primary)]" : "bg-surface text-muted-foreground border border-border"}`}
              >
                {done ? <Check className={icon} /> : n}
              </div>
              {i < total - 1 && <div className={`flex-1 h-0.5 rounded-full min-w-[2px] ${done ? "bg-success" : "bg-border"} transition-all`} />}
            </div>
          );
        })}
      </div>
      <div className={`mt-1.5 text-secondary ${dense ? "text-xs" : "text-sm"}`}>
        Step {step} of {total} · <span className="text-foreground">{labels[step - 1]}</span>
      </div>
    </div>
  );
}
