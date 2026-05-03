import tetherIcon from "@/assets/tether-usdt-icon.svg";
import { cn } from "@/lib/utils";

const sizeClass = {
  "2xs": "h-2.5 w-2.5",
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
} as const;

export type UsdtMarkSize = keyof typeof sizeClass;

/** Tether USDT mark — use before “USDT” copy for a consistent premium token label. */
export function UsdtMark({
  size = "sm",
  className,
}: {
  size?: UsdtMarkSize;
  className?: string;
}) {
  return (
    <img
      src={tetherIcon}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("shrink-0 object-contain align-middle inline-block", sizeClass[size], className)}
    />
  );
}

/** Small “USDT” with Tether glyph before the word. */
export function UsdtWord({
  size = "sm",
  className,
}: {
  size?: UsdtMarkSize;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {/* <UsdtMark size={size} /> */}
      <span>USDT</span>
    </span>
  );
}

export function fmtUsdtNumber(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

/** Formatted balance / amount: number + Tether + “USDT”. */
export function FormattedUsdt({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: UsdtMarkSize;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
      <span>{fmtUsdtNumber(value)}</span>
      <UsdtMark size={size} />
      <span className="font-medium">USDT</span>
    </span>
  );
}

/** Network option fee line: USDT amount + Tether mark + “USDT exchange fee”. */
export function FeeUsdtLabel({ fee }: { fee: number }) {
  if (fee === 0) {
    return <span className="inline-flex items-center gap-1">No exchange fee</span>;
  }
  const n = Number(fee.toFixed(4));
  const s = n % 1 === 0 ? String(n) : String(n).replace(/\.?0+$/, "");
  return (
    <span className="inline-flex items-center gap-1">
      <span>{s}</span>
      <UsdtMark size="xs" />
      <span>USDT exchange fee</span>
    </span>
  );
}

/** “per” + icon + USDT (rates, footnotes). */
export function PerUsdt({ size = "2xs", className }: { size?: UsdtMarkSize; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span>per</span>
      <UsdtMark size={size} />
      <span>USDT</span>
    </span>
  );
}

/** Label line like “USDT (TRC20)” with glyph before USDT. */
export function UsdtNetworkTitle({
  network,
  className,
}: {
  network: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold text-sm text-foreground", className)}>
      <UsdtMark size="xs" />
      <span>USDT ({network})</span>
    </span>
  );
}

/** Arbitrary string amount + icon + USDT (e.g. blockchain fee row). */
export function RawAmountUsdt({
  amountText,
  size = "xs",
  className,
}: {
  amountText: string;
  size?: UsdtMarkSize;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
      <span>{amountText}</span>
      <UsdtMark size={size} />
      <span className="font-medium">USDT</span>
    </span>
  );
}

/** “₹{n} / ” + small USDT word (rate chips). */
export function InrPerUsdtRate({
  inr,
  size = "xs",
  className,
}: {
  inr: number;
  size?: UsdtMarkSize;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 flex-wrap tabular-nums", className)}>
      <span>₹{inr.toFixed(2)}</span>
      <span className="text-muted-foreground">/</span>
      <UsdtWord size={size} />
    </span>
  );
}
