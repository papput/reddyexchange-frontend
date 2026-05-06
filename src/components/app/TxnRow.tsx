import { Link } from "@tanstack/react-router";
import type { Txn } from "@/lib/store";
import { fmtINR } from "@/lib/store";
import { site } from "@/config/site";
import { FormattedUsdt, UsdtWord } from "@/components/app/UsdtMark";
import { ArrowDownToLine, ArrowUpFromLine, Wallet, ChevronRight } from "lucide-react";
import { listStatusToUi, TxnStatusPill } from "@/components/app/TxnStatus";

export function TxnRow({ txn }: { txn: Txn }) {
  const isBuy = txn.type === "buy";
  const isWithdrawal = txn.type === "withdrawal";
  const buyLabel =
    isBuy && txn.buyAsset === "pex" ? site.coinSymbol : isBuy ? site.standardUsdtLabel : "USDT";

  const title = isWithdrawal ? (
    <span className="inline-flex items-center gap-1 flex-wrap">
      Withdrawal <FormattedUsdt value={txn.usdt} size="xs" />
    </span>
  ) : isBuy ? (
    <span className="inline-flex items-center gap-1 flex-wrap">
      Bought <FormattedUsdt value={txn.usdt} size="xs" />
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 flex-wrap">
      Sold <FormattedUsdt value={txn.usdt} size="xs" />
    </span>
  );
  const sub = isWithdrawal
    ? `${txn.network} · ${new Date(txn.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
    : `${txn.network} · ${new Date(txn.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`;

  return (
    <Link
      to="/app/transaction"
      search={{ id: txn.documentId, kind: txn.type }}
      className="glass rounded-2xl p-4 flex items-center justify-between hover-lift hover:border-primary/25 border border-transparent transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${
            isBuy ? "bg-accent/15" : isWithdrawal ? "bg-violet-500/15" : "bg-primary/15"
          }`}
        >
          {isBuy ? (
            <ArrowDownToLine className="h-4.5 w-4.5 text-accent" />
          ) : isWithdrawal ? (
            <Wallet className="h-4.5 w-4.5 text-violet-400" />
          ) : (
            <ArrowUpFromLine className="h-4.5 w-4.5 text-primary-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">
            {title}{" "}
            {!isWithdrawal && (
              <span className="text-muted-foreground font-normal inline-flex items-center gap-1">
                (
                {buyLabel === site.standardUsdtLabel && site.standardUsdtLabel === "USDT" ? (
                  <UsdtWord size="2xs" className="font-normal text-muted-foreground" />
                ) : (
                  buyLabel
                )}
                )
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">{sub}</div>
          {isWithdrawal && txn.status === "failed" && txn.rejectReason ? (
            <div className="text-xs text-destructive mt-1 animate-fade-in truncate">
              {txn.rejectReason}
            </div>
          ) : null}
        </div>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2 pl-2">
        <div>
          <div className="text-sm font-medium">{isWithdrawal ? "—" : fmtINR(txn.inr)}</div>
          <TxnStatusPill status={listStatusToUi(txn.status)} size="sm" className="mt-0.5" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
      </div>
    </Link>
  );
}

/** @deprecated prefer TxnStatusPill + listStatusToUi */
export function StatusBadge({ status }: { status: Txn["status"] }) {
  return <TxnStatusPill status={listStatusToUi(status)} size="sm" className="mt-0.5" />;
}
