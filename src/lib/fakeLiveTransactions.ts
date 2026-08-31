export type LiveTxStatus = "Pending" | "Completed" | "Processing";

export function formatLiveInr(n: number) {
  return `${n.toLocaleString("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} INR`;
}

/** Compact ₹ amount for live transaction cards */
export function formatLiveInrRupee(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function formatLiveUsdtAmount(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export function shortTxRef(globalIndex: number) {
  const hash = ((globalIndex * 2_654_435_761) >>> 0) % 0xffffff;
  return hash.toString(16).toUpperCase().padStart(6, "0").slice(-6);
}

export type LiveFeedNetwork = "TRC20" | "ERC20" | "BEP20";

export type LiveFeedPayMethod = "bank" | "upi";

export function deriveLiveFeedRoute(
  globalIndex: number,
  slotIndex = 0,
): {
  payMethod: LiveFeedPayMethod;
  payLabel: string;
  receiveLabel: string;
  network: LiveFeedNetwork | "TRX";
} {
  if (slotIndex === 0) {
    return {
      payMethod: "bank",
      payLabel: "Bank Transfer",
      receiveLabel: "TRON TRX",
      network: "TRX",
    };
  }
  const slotRoutes: Array<{ network: LiveFeedNetwork | "TRX"; receiveLabel: string }> = [
    { network: "TRC20", receiveLabel: "USDT TRC20" },
    { network: "TRC20", receiveLabel: "USDT TRC20" },
    { network: "ERC20", receiveLabel: "USDT ERC20" },
    { network: "TRC20", receiveLabel: "USDT TRC20" },
  ];
  const slot = slotRoutes[(slotIndex - 1) % slotRoutes.length];
  if (slot.network === "TRX") {
    return {
      payMethod: "upi",
      payLabel: "UPI INR",
      receiveLabel: "TRON TRX",
      network: "TRX",
    };
  }
  return {
    payMethod: "upi",
    payLabel: "UPI INR",
    receiveLabel: slot.receiveLabel,
    network: slot.network,
  };
}

/** Pending card countdown (MM:SS), stable per order. */
export function formatPendingCountdown(globalIndex: number, nowMs: number) {
  const baseSec = 540 + (globalIndex % 420);
  const tick = Math.floor(nowMs / 1000);
  const remaining = baseSec - (tick % (baseSec + 120));
  const clamped = Math.max(0, Math.min(baseSec, remaining));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatLiveUsdt(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USDT`;
}

export function formatSecsAgo(secs: number) {
  if (secs < 60) return `${secs} sec${secs === 1 ? "" : "s"} ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function secsAgoFromAppearedAt(appearedAt: number, nowMs: number) {
  return Math.max(1, Math.floor((nowMs - appearedAt) / 1000));
}
