import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiCreateWithdrawal, getApiErrorMessage } from "@/lib/api";
import { effectiveWithdrawalMinUsdt, useAuth, type Network } from "@/lib/store";
import { FormattedUsdt, UsdtWord } from "@/components/app/UsdtMark";
import { site } from "@/config/site";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/withdraw")({
  head: () => ({ meta: [{ title: `Withdraw — ${site.siteName}` }] }),
  component: WithdrawPage,
});

const TXN_QK = ["user-transactions"] as const;

function FormField({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</Label>
      <div className="rounded-xl border border-border bg-background/90 dark:bg-muted/30 shadow-sm ring-focus">{children}</div>
      {hint != null ? <div className="px-0.5">{hint}</div> : null}
    </div>
  );
}

function WithdrawPage() {
  const auth = useAuth();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network>("TRC20");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const balance = auth?.user.primeExchUsdtBalance ?? 0;
  const minUsdt = auth ? effectiveWithdrawalMinUsdt(auth.user) : 25;
  const maxUsdt = balance;

  const shortfall = useMemo(() => {
    if (balance >= minUsdt) return 0;
    return Number((minUsdt - balance).toFixed(6));
  }, [balance, minUsdt]);

  const amountNum = Number(amount);
  const amountOk = Number.isFinite(amountNum) && amountNum > 0;
  const belowMinAmount = amountOk && amountNum < minUsdt;
  const aboveMax = amountOk && amountNum > maxUsdt;
  const canSubmit =
    auth &&
    amountOk &&
    !belowMinAmount &&
    !aboveMax &&
    shortfall === 0 &&
    address.trim().length >= 10 &&
    !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await apiCreateWithdrawal({
        amountUsdt: amountNum,
        network,
        walletAddress: address.trim(),
      });
      toast.success("Withdrawal request submitted");
      setDone(true);
      setAmount("");
      setAddress("");
      qc.invalidateQueries({ queryKey: [...TXN_QK, auth?.token ?? ""] });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!auth) return null;

  if (done) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-border/80 bg-background/90 dark:bg-muted/25 p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto h-14 w-14 rounded-full bg-success/15 grid place-items-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Request submitted</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              We will process your withdrawal after admin approval. You can track it under transactions.
            </p>
          </div>
          <Button asChild className="w-full max-w-xs mx-auto">
            <Link to="/app/transactions">Back to transactions</Link>
          </Button>
        </div>
      </div>
    );
  }

  const inputInner =
    "h-12 w-full border-0 bg-transparent px-4 text-base md:text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/80";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2">
          <Link to="/app" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Withdraw {site.coinSymbol}</h1>
          <p className="text-sm text-muted-foreground">
            Send wallet balance to your TRC20, ERC20, or BEP20{" "}
            <UsdtWord size="xs" className="text-muted-foreground font-normal" /> address.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-border/80 bg-background/90 dark:bg-muted/25 p-5 sm:p-6 flex items-start gap-4 shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/25 grid place-items-center shrink-0">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 space-y-1.5 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Available balance</div>
          <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground inline-flex items-center gap-1">
            <FormattedUsdt value={balance} size="md" />
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/60 mt-2">
            You can withdraw up to{" "}
            <span className="font-semibold text-foreground tabular-nums inline-flex items-center gap-1">
              {maxUsdt.toFixed(2)} <UsdtWord size="xs" className="font-semibold" />
            </span>
            {balance > 0 && balance < minUsdt && (
              <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                Add {shortfall.toFixed(2)} more <UsdtWord size="2xs" className="font-medium" /> to your {site.coinName}{" "}
                wallet to withdraw (need at least {minUsdt} <UsdtWord size="2xs" className="font-medium" />).
              </span>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border-2 border-border/80 bg-background/90 dark:bg-muted/25 p-5 sm:p-6 space-y-6 shadow-sm"
      >
        <FormField
          label={
            <span className="inline-flex items-center gap-1">
              Amount (<UsdtWord size="2xs" />)
            </span>
          }
          hint={
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              Minimum{" "}
              <span className="font-semibold text-foreground tabular-nums inline-flex items-center gap-1">
                {minUsdt} <UsdtWord size="2xs" className="font-semibold" />
              </span>
              <span className="text-border"> · </span>
              Maximum{" "}
              <span className="font-semibold text-foreground tabular-nums inline-flex items-center gap-1">
                {maxUsdt.toFixed(2)} <UsdtWord size="2xs" className="font-semibold" />
              </span>
            </p>
          }
        >
          <Input
            id="wd-amt"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`e.g. ${Math.min(minUsdt + 10, Math.max(minUsdt, maxUsdt)).toFixed(0)}`}
            className={cn(inputInner, "font-mono tabular-nums")}
            disabled={shortfall > 0}
          />
        </FormField>
        {(belowMinAmount && shortfall === 0) || aboveMax ? (
          <p className="text-xs text-destructive -mt-2">
            {belowMinAmount && (
              <span className="inline-flex items-center gap-1 flex-wrap">
                Amount must be at least {minUsdt} <UsdtWord size="2xs" />.
              </span>
            )}
            {aboveMax && (
              <span className="inline-flex items-center gap-1 flex-wrap">
                Amount cannot exceed your available balance ({maxUsdt.toFixed(2)} <UsdtWord size="2xs" />).
              </span>
            )}
          </p>
        ) : null}

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-secondary block">Network</span>
          <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-border bg-muted/30 dark:bg-muted/20">
            {(["TRC20", "ERC20", "BEP20"] as const).map((n) => (
              <button
                key={n}
                type="button"
                disabled={shortfall > 0}
                onClick={() => setNetwork(n)}
                className={cn(
                  "flex-1 min-w-[5.5rem] rounded-lg py-3 px-2 text-sm font-semibold transition-all",
                  "border-2 shadow-sm",
                  network === n
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-transparent bg-background/80 dark:bg-background/40 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label={
            <span className="inline-flex items-center gap-1 flex-wrap">
              Your {network} <UsdtWord size="2xs" /> address
            </span>
          }
        >
          <Input
            id="wd-addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={network === "TRC20" ? "Paste TRC20 address (starts with T)" : "Paste ERC20 / BEP20 address (0x…)"}
            className={cn(inputInner, "font-mono text-sm")}
            disabled={shortfall > 0}
            autoComplete="off"
          />
        </FormField>

        <p className="text-[11px] text-muted-foreground -mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
          Double-check the network and address. Wrong chain or address can mean permanent loss of funds.
        </p>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={!canSubmit}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit withdrawal"
          )}
        </Button>
      </form>
    </div>
  );
}
