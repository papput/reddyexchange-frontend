import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Receipt } from "lucide-react";
import { site } from "@/config/site";
import { useUserTransactions } from "@/hooks/use-user-transactions";
import { TxnRow } from "@/components/app/TxnRow";

export const Route = createFileRoute("/app/transactions")({
  head: () => ({ meta: [{ title: `Transactions — ${site.siteName}` }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data: txns = [], isLoading, isError, error, refetch } = useUserTransactions();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-primary/15 grid place-items-center">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-secondary">Buys, sells, and withdrawals</p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass rounded-2xl p-12 flex items-center justify-center gap-2 text-secondary text-sm">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : isError ? (
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Could not load transactions"}</p>
          <button type="button" onClick={() => refetch()} className="text-sm text-accent underline">
            Try again
          </button>
        </div>
      ) : txns.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-secondary text-sm">No transactions yet.</div>
      ) : (
        <div className="space-y-2">
          {txns.map((t) => (
            <TxnRow key={`${t.type}-${t.documentId}`} txn={t} />
          ))}
        </div>
      )}
      <Link to="/app/more" className="inline-block text-sm text-accent hover:underline">
        ← Back to More
      </Link>
    </div>
  );
}
