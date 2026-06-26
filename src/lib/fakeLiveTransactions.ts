export type LiveTxStatus = "Pending" | "Completed" | "Processing";

export function formatLiveInr(n: number) {
  return `${n.toLocaleString("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} INR`;
}

export function formatLiveUsdt(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USDT`;
}

export function formatSecsAgo(secs: number) {
  if (secs < 60) return `${secs} sec${secs === 1 ? "" : "s"} ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
}

export function secsAgoFromAppearedAt(appearedAt: number, nowMs: number) {
  return Math.max(1, Math.floor((nowMs - appearedAt) / 1000));
}
