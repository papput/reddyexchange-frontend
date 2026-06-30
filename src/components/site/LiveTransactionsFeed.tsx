import { useEffect, useRef, useState } from "react";
import { Activity, Globe2 } from "lucide-react";
import { UsdtMark } from "@/components/app/UsdtMark";
import { useLiveFeed } from "@/hooks/use-live-feed";
import type { LiveFeedEntry } from "@/lib/api";
import {
  formatLiveInr,
  formatLiveUsdt,
  formatSecsAgo,
  secsAgoFromAppearedAt,
  type LiveTxStatus,
} from "@/lib/fakeLiveTransactions";
import { cn } from "@/lib/utils";

function statusStyles(status: LiveTxStatus) {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_12px_-4px_rgba(0,192,135,0.5)]";
    case "Processing":
      return "bg-primary/15 text-primary-foreground/90 border-primary/35 shadow-[0_0_12px_-4px_rgba(108,76,255,0.45)]";
    default:
      return "bg-amber-500/12 text-amber-200 border-amber-500/35 shadow-[0_0_12px_-4px_rgba(245,158,11,0.4)] animate-live-tx-pending";
  }
}

function LiveIndicator() {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        "border border-red-500/30 bg-red-500/[0.08]",
        "shadow-[0_0_20px_-6px_rgba(239,68,68,0.55)]",
        "animate-live-badge-glow",
      )}
      aria-label="Live feed"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.75)]" />
      </span>
      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-red-200">
        Live
      </span>
    </span>
  );
}

function LiveRow({
  row,
  isNew,
  nowMs,
}: {
  row: LiveFeedEntry;
  isNew: boolean;
  nowMs: number;
}) {
  const secsAgo = secsAgoFromAppearedAt(row.appearedAt, nowMs);

  return (
    <div
      className={cn(
        "live-tx-row group relative overflow-hidden",
        "rounded-xl border border-border/50 bg-gradient-to-r from-background/55 via-surface/40 to-background/55",
        "px-3 py-3 sm:px-4 sm:py-3.5",
        "backdrop-blur-md transition-[border-color,box-shadow,background] duration-500",
        "hover:border-primary/35 hover:shadow-[0_0_28px_-8px_rgba(108,76,255,0.4)]",
        isNew && "animate-live-tx-enter border-primary/40",
      )}
    >
      {isNew ? (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent animate-shimmer opacity-60"
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          "absolute left-0 top-2 bottom-2 w-0.5 rounded-full gradient-primary opacity-0 transition-opacity",
          isNew ? "opacity-100 animate-live-tx-accent" : "group-hover:opacity-70",
        )}
        aria-hidden
      />

      <div className="sm:hidden space-y-2.5 pl-1 relative">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <p className="font-semibold text-base text-foreground truncate">{row.name}</p>
          <p className="text-xs text-muted-foreground tabular-nums shrink-0">{formatSecsAgo(secsAgo)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground tabular-nums">{formatLiveInr(row.inr)}</p>
          <p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5 tabular-nums">
            <UsdtMark size="xs" className="shrink-0" />
            <span>{formatLiveUsdt(row.usdt).replace(" USDT", "")}</span>
          </p>
        </div>
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            statusStyles(row.status),
          )}
        >
          {row.status}
        </span>
      </div>

      <div className="hidden sm:grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-3 items-center pl-1 relative">
        <p className="font-semibold text-base text-foreground truncate">{row.name}</p>
        <p className="text-sm font-medium text-foreground/95 tabular-nums truncate">
          {formatLiveInr(row.inr)}
        </p>
        <p className="text-sm font-medium text-foreground inline-flex items-center gap-1.5 tabular-nums">
          <UsdtMark size="xs" className="shrink-0" />
          <span>{formatLiveUsdt(row.usdt).replace(" USDT", "")}</span>
          <span className="text-muted-foreground font-normal">USDT</span>
        </p>
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
            statusStyles(row.status),
          )}
        >
          {row.status}
        </span>
        <p className="text-xs text-muted-foreground tabular-nums text-right whitespace-nowrap">
          {formatSecsAgo(secsAgo)}
        </p>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-2.5 p-3 sm:p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-[4.5rem] sm:h-14 rounded-xl border border-border/30 bg-surface/40 animate-pulse"
        />
      ))}
    </div>
  );
}

export function LiveTransactionsFeed() {
  const { data, isLoading, isError } = useLiveFeed();
  const [tick, setTick] = useState(0);
  const [newTopId, setNewTopId] = useState<string | null>(null);
  const prevTopIndex = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const serverOffset = data ? data.serverTime - Date.now() : 0;
  const nowMs = Date.now() + serverOffset;

  useEffect(() => {
    if (data?.latestGlobalIndex == null || data.latestGlobalIndex < 0) return;
    const idx = data.latestGlobalIndex;
    if (prevTopIndex.current !== null && idx > prevTopIndex.current) {
      const top = data.entries[0];
      if (top) {
        setNewTopId(top.id);
        const t = setTimeout(() => setNewTopId(null), 900);
        prevTopIndex.current = idx;
        return () => clearTimeout(t);
      }
    }
    prevTopIndex.current = idx;
  }, [data?.latestGlobalIndex, data?.entries]);

  const displayRows = data?.entries ?? [];
  const poolSize = data?.poolSize ?? 2000;
  const pendingCount = data?.pendingCount ?? 0;

  return (
    <section className="relative pt-6 sm:pt-8 pb-6 sm:pb-8 isolate">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100%,56rem)] h-80 rounded-full blur-3xl opacity-30 gradient-primary animate-pulse-glow" />
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>

      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/25 text-xs font-bold uppercase tracking-widest text-accent mb-4 animate-sell-price-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(0,212,255,0.6)]" />
            </span>
            Live activity
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Real-time <span className="gradient-text">exchanges</span> across India
          </h2>
          <p className="text-secondary mt-3 text-sm sm:text-base">
            {poolSize.toLocaleString("en-IN")}+ orders — synced globally from our servers.
          </p>
        </div>

        <div
          className={cn(
            "card-glow-frame relative rounded-[1.35rem] p-[1px] max-w-5xl mx-auto animate-scale-in live-feed-frame",
            "bg-gradient-to-br from-primary/60 via-accent/30 to-primary/50",
            "shadow-[0_0_56px_-8px_rgba(108,76,255,0.55),0_0_48px_-12px_rgba(0,212,255,0.3)]",
          )}
        >
          <div className="card-glow-surface rounded-[1.3rem] glass-strong border border-white/[0.08]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border/50 bg-surface/70">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center shadow-[0_0_24px_-4px_rgba(108,76,255,0.65)] animate-live-rate-bounce">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">Live USDT Orders</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border border-border/50 rounded-full px-2.5 py-1">
                  <Globe2 className="h-3 w-3 text-accent" />
                  Globally synced
                </span>
                <LiveIndicator />
              </div>
            </div>

            {isLoading ? (
              <FeedSkeleton />
            ) : isError ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Live feed unavailable — refresh to retry.
              </div>
            ) : (
              <div className="relative p-3 sm:p-4 space-y-2 sm:space-y-2.5 max-h-[min(52rem,82vh)] overflow-y-auto no-scrollbar">
                {displayRows.map((row) => (
                  <LiveRow
                    key={row.id}
                    row={row}
                    isNew={row.id === newTopId}
                    nowMs={nowMs}
                  />
                ))}
              </div>
            )}

            <div className="px-4 sm:px-6 py-3 border-t border-border/50 bg-background/30 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-live-pulse-dot" />
                {pendingCount.toLocaleString("en-IN")} pending in queue
              </span>
              <span className="tabular-nums shimmer px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-border/40">
                Pool: {poolSize.toLocaleString("en-IN")} entries
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
