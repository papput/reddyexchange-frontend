import { cn } from "@/lib/utils";
import type { Txn, TxnType } from "@/lib/store";

/** Unified UI status for colored pills */
export type UiTxnStatus = "pending" | "success" | "rejected";

export function normalizeDetailStatus(kind: TxnType | "buy" | "sell" | "withdrawal", raw: string): UiTxnStatus {
  const s = String(raw || "").toLowerCase();
  if (kind === "withdrawal") {
    if (s === "approved") return "success";
    if (s === "rejected") return "rejected";
    return "pending";
  }
  if (kind === "sell") {
    if (s === "paid") return "success";
    if (s === "rejected") return "rejected";
    return "pending";
  }
  if (kind === "buy") {
    if (s === "completed") return "success";
    if (s === "rejected") return "rejected";
    return "pending";
  }
  return "pending";
}

/** List rows use Txn.status: pending | completed | failed */
export function listStatusToUi(status: Txn["status"]): UiTxnStatus {
  if (status === "completed") return "success";
  if (status === "failed") return "rejected";
  return "pending";
}

const pillConfig: Record<
  UiTxnStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-500/18 text-amber-800 dark:text-amber-200 border-amber-500/40 ring-1 ring-amber-500/25",
  },
  success: {
    label: "Completed",
    className:
      "bg-emerald-500/18 text-emerald-900 dark:text-emerald-200 border-emerald-500/40 ring-1 ring-emerald-500/25",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/18 text-red-900 dark:text-red-200 border-red-500/40 ring-1 ring-red-500/25",
  },
};

export function TxnStatusPill({
  status,
  className,
  size = "md",
}: {
  status: UiTxnStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const c = pillConfig[status];
  const sz =
    size === "lg"
      ? "text-sm px-4 py-1.5 rounded-full font-semibold"
      : size === "md"
        ? "text-xs px-3 py-1 rounded-full font-semibold"
        : "text-[10px] px-2 py-0.5 rounded-full font-semibold";
  return (
    <span className={cn("inline-flex items-center border", sz, c.className, className)} suppressHydrationWarning>
      {c.label}
    </span>
  );
}
