import { ArrowDownToLine, Clock3, IndianRupee } from "lucide-react";
import { fmtUsdtNumber } from "@/components/app/UsdtMark";
import { fmtINR } from "@/lib/store";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const INSIGHT_ICONS = {
  rate: ArrowDownToLine,
  value: IndianRupee,
  pending: Clock3,
} as const;

function InsightCard({
  label,
  value,
  hint,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint: string;
  icon: keyof typeof INSIGHT_ICONS;
  accent?: "primary" | "accent" | "amber";
}) {
  const Icon = INSIGHT_ICONS[icon];
  const accentClass =
    accent === "accent"
      ? "from-accent/25 to-accent/5 border-accent/25 text-accent"
      : accent === "amber"
        ? "from-amber-500/20 to-amber-500/5 border-amber-500/25 text-amber-400"
        : "from-primary/25 to-primary/5 border-primary/25 text-accent";

  return (
    <div className="dashboard-insight-card group">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
          accentClass,
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg sm:text-xl font-bold tracking-tight tabular-nums truncate">{value}</p>
        <p className="mt-0.5 text-[11px] text-secondary truncate">{hint}</p>
      </div>
    </div>
  );
}

export function DashboardInsights({
  rate,
  balanceUsdt,
  balanceInr,
  pendingCount,
  hidden,
}: {
  rate: number;
  balanceUsdt: number;
  balanceInr: number;
  pendingCount: number;
  hidden: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <InsightCard
        label="Buy rate"
        value={`₹${rate.toFixed(2)}`}
        hint="Per USDT · updates live"
        icon="rate"
        accent="primary"
      />
      <InsightCard
        label="Portfolio"
        value={hidden ? "••••••" : fmtINR(balanceInr)}
        hint={
          hidden
            ? `${site.coinName} balance hidden`
            : `${fmtUsdtNumber(balanceUsdt)} USDT in wallet`
        }
        icon="value"
        accent="accent"
      />
      <InsightCard
        label="Pending"
        value={String(pendingCount)}
        hint={pendingCount === 1 ? "Order awaiting approval" : "Orders awaiting approval"}
        icon="pending"
        accent={pendingCount > 0 ? "amber" : "primary"}
      />
    </div>
  );
}
