import bankSvg from "@/assets/payment/bank.svg";
import upiMoneyTransferSvg from "@/assets/payment/upi-money-transfer.svg";
import { cn } from "@/lib/utils";

/** In-app / Reddy Exchange token tile (legacy). */
export function ExchangeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="exchange-mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.62 0.19 264)" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 303)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#exchange-mark-grad)" />
      <path
        fill="white"
        fillOpacity="0.96"
        d="M12 11h10c3.3 0 5.5 1.7 5.5 4.2 0 1.9-1.1 3.3-3 3.9 2.4.4 4 2.1 4 4.4 0 3-2.5 5-6.2 5H12V11zm3.2 6.6h6.5c1.6 0 2.6-.8 2.6-2.1 0-1.4-1-2.2-2.7-2.2h-6.4v4.3zm0 7.1h7c1.8 0 2.9-.9 2.9-2.4 0-1.5-1.1-2.4-3-2.4h-6.9v4.8z"
      />
    </svg>
  );
}

/**
 * UPI payment row — bank building artwork (`bank.svg`).
 */
export function UpiMark({ className }: { className?: string }) {
  return (
    <img
      src={bankSvg}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

/**
 * Bank IMPS / transfer row — UPI money-transfer artwork (`upi-money-transfer.svg`).
 */
export function BankImpsMark({ className }: { className?: string }) {
  return (
    <img
      src={upiMoneyTransferSvg}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
