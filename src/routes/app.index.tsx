import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff, ChevronRight, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/store";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useUserTransactions } from "@/hooks/use-user-transactions";
import { fmtINR } from "@/lib/store";
import { fmtUsdtNumber, UsdtMark, UsdtWord } from "@/components/app/UsdtMark";
import { TxnRow } from "@/components/app/TxnRow";
import { site } from "@/config/site";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: `Home — ${site.siteName}` }] }),
  component: AppHome,
});

function AppHome() {
  const auth = useAuth();
  const { data: settings } = usePublicSettings();
  const rate = settings?.price ?? 91;
  const { data: txns = [], isLoading } = useUserTransactions();
  const [hidden, setHidden] = useState(false);

  const balanceUsdt = auth?.user.primeExchUsdtBalance ?? 0;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 gradient-primary shadow-[var(--shadow-elegant)]">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-16 h-48 w-48 rounded-full bg-accent/30 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between text-white/80 text-xs uppercase tracking-widest">
            <span>{site.coinName} balance</span>
            <button onClick={() => setHidden((h) => !h)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition">
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-white">
            {hidden ? (
              "••••••"
            ) : (
              <span className="inline-flex items-center gap-2 text-white drop-shadow-sm">
                <span>{fmtUsdtNumber(balanceUsdt)}</span>
                <UsdtMark size="xl" />
                <span className="font-bold">USDT</span>
              </span>
            )}
          </div>
          <div className="text-white/80 text-sm mt-1">
            ≈ {hidden ? "••••••" : fmtINR(balanceUsdt * rate)}
          </div>
          <p className="text-white/70 text-[11px] mt-2 max-w-md">
            {site.coinName} wallet — topped up when you buy Reddy Exchange <UsdtWord size="2xs" className="text-white/90 font-medium" /> and an admin approves your order. Withdraw to TRC20, ERC20, or BEP20 below.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Link to="/app/buy" className="bg-white text-primary font-semibold rounded-xl py-3 text-center hover-lift flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-sm">
              <ArrowDownToLine className="h-4 w-4 shrink-0" /> Buy
            </Link>
            <Link to="/app/sell" className="bg-white/15 backdrop-blur text-white font-semibold rounded-xl py-3 text-center hover:bg-white/25 transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-sm">
              <ArrowUpFromLine className="h-4 w-4 shrink-0" /> Sell
            </Link>
            <Link to="/app/withdraw" className="bg-white/15 backdrop-blur text-white font-semibold rounded-xl py-3 text-center hover:bg-white/25 transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-sm">
              <Wallet className="h-4 w-4 shrink-0" /> Withdraw
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent transactions</h2>
          <Link to="/app/transactions" className="text-xs text-accent hover:underline flex items-center gap-0.5">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {isLoading ? (
          <div className="glass rounded-2xl p-8 text-center text-secondary text-sm">Loading…</div>
        ) : txns.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-secondary text-sm">
            No transactions yet. <Link to="/app/buy" className="text-accent hover:underline">Make your first purchase →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {txns.slice(0, 5).map((t) => (
              <TxnRow key={`${t.type}-${t.documentId}`} txn={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
