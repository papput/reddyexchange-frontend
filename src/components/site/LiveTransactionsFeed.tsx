import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck, Clock, User } from "lucide-react";
import { IconBsc, IconEth, IconTron } from "@/components/app/NetworkTokenPicker";
import { BankImpsMark, UpiMark } from "@/components/app/ExchangeMark";
import { useLiveFeed } from "@/hooks/use-live-feed";
import type { LiveFeedEntry } from "@/lib/api";
import {
  deriveLiveFeedRoute,
  formatLiveInrRupee,
  formatLiveUsdtAmount,
  formatPendingCountdown,
  formatSecsAgo,
  secsAgoFromAppearedAt,
  shortTxRef,
  type LiveTxStatus,
} from "@/lib/fakeLiveTransactions";
import { cn } from "@/lib/utils";

const TX_CYAN = "text-[#2dd4bf]";
const AMOUNT_CYAN = "text-[#2dd4bf]";
const MUTED = "text-[#a3a3a3]";

function statusStyles(status: LiveTxStatus) {
  if (status === "Pending" || status === "Processing") {
    return {
      label: "Pending",
      icon: Clock,
      card: "site-card border-amber-600/45 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.06)]",
      badge: "bg-[#f59e0b]/12 text-[#fbbf24] border border-[#f59e0b]/35",
      timeClass: "text-[#fbbf24]",
      showCountdown: true,
    };
  }
  return {
    label: "Done",
    icon: CircleCheck,
    card: "site-card border-emerald-700/40 shadow-[inset_0_1px_0_0_rgba(34,197,94,0.05)]",
    badge: "bg-[#22c55e]/12 text-[#4ade80] border border-[#22c55e]/35",
    timeClass: "text-[#4ade80]/85",
    showCountdown: false,
  };
}

function PayIcon({ method }: { method: "bank" | "upi" }) {
  if (method === "bank") {
    return <UpiMark className="h-[18px] w-[18px]" />;
  }
  return <BankImpsMark className="h-[18px] w-[18px]" />;
}

function ReceiveIcon({ network }: { network: ReturnType<typeof deriveLiveFeedRoute>["network"] }) {
  const cls = "h-[18px] w-[18px] shrink-0";
  if (network === "TRX" || network === "TRC20") return <IconTron className={cls} />;
  if (network === "ERC20") return <IconEth className={cls} />;
  return <IconBsc className={cls} />;
}

function LiveTransactionCard({
  row,
  slotIndex,
  isNew,
  nowMs,
}: {
  row: LiveFeedEntry;
  slotIndex: number;
  isNew: boolean;
  nowMs: number;
}) {
  const meta = statusStyles(row.status);
  const StatusIcon = meta.icon;
  const secsAgo = secsAgoFromAppearedAt(row.appearedAt, nowMs);
  const route = deriveLiveFeedRoute(row.globalIndex, slotIndex);
  const txRef = shortTxRef(row.globalIndex);
  const timeLabel = meta.showCountdown
    ? formatPendingCountdown(row.globalIndex, nowMs)
    : formatSecsAgo(secsAgo);

  return (
    <article
      className={cn(
        "rounded-[14px] border p-3.5 sm:p-4 transition-colors",
        meta.card,
        isNew && "ring-1 ring-[#2dd4bf]/25",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3 min-h-[26px]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={cn("text-[13px] font-bold tabular-nums tracking-wide shrink-0", TX_CYAN)}>
            {txRef}
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-[22px] h-[22px] rounded-full border border-[#333] bg-[#222] flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-[#888]" strokeWidth={2} />
            </span>
            <span className="text-[13px] font-medium text-white truncate">{row.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-semibold leading-none",
              meta.badge,
            )}
          >
            <StatusIcon className="w-3 h-3 shrink-0" aria-hidden />
            {meta.label}
          </span>
          <span className={cn("text-[11px] font-medium tabular-nums whitespace-nowrap", meta.timeClass)}>
            {timeLabel}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 text-[11px] sm:text-xs">
          <span className="inline-flex items-center gap-1 text-[#e5e5e5] shrink-0 font-medium">
            <PayIcon method={route.payMethod} />
            <span>{route.payLabel}</span>
          </span>
          <ArrowRight className="h-3 w-3 text-[#666] shrink-0 mx-0.5" aria-hidden />
          <span className="inline-flex items-center gap-1 text-[#e5e5e5] font-medium min-w-0">
            <ReceiveIcon network={route.network} />
            <span className="truncate">{route.receiveLabel}</span>
          </span>
        </div>
        <div className="text-right shrink-0 leading-none pl-2">
          <p className={cn("text-[17px] sm:text-lg font-bold tabular-nums", AMOUNT_CYAN)}>
            {formatLiveUsdtAmount(row.usdt)}
          </p>
          <p className={cn("text-[12px] tabular-nums mt-1.5", MUTED)}>{formatLiveInrRupee(row.inr)}</p>
        </div>
      </div>
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[88px] rounded-[14px] site-card animate-pulse"
        />
      ))}
    </div>
  );
}

export function LiveTransactionsFeed() {
  const { data, isLoading, isError } = useLiveFeed();
  const [, setTick] = useState(0);
  const [newTopId, setNewTopId] = useState<string | null>(null);
  const prevTopIndex = useRef<number | null>(null);

  const hasPending = (data?.entries ?? []).some(
    (e) => e.status === "Pending" || e.status === "Processing",
  );

  useEffect(() => {
    const ms = hasPending ? 1000 : 60_000;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [hasPending]);

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

  const displayRows = (data?.entries ?? []).slice(0, 5);

  return (
    <section className="relative pt-4 sm:pt-6 pb-6 sm:pb-8 isolate">
      <div className="container mx-auto px-3 sm:px-4 max-w-lg sm:max-w-xl">
        <div className="site-panel p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="font-display text-[17px] sm:text-lg font-semibold text-white tracking-tight">
              Latest Transactions
            </h2>
            <span className="text-[11px] text-[#a3a3a3] bg-[#1f1f1f] border border-[#2e2e2e] px-2.5 py-1 rounded-full shrink-0 tabular-nums">
              5 recent
            </span>
          </div>

          {isLoading ? (
            <FeedSkeleton />
          ) : isError ? (
            <div className="py-8 text-center text-sm text-[#a3a3a3]">
              Live feed unavailable — refresh to retry.
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayRows.map((row, slotIndex) => (
                <LiveTransactionCard
                  key={row.id}
                  row={row}
                  slotIndex={slotIndex}
                  isNew={row.id === newTopId}
                  nowMs={nowMs}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
