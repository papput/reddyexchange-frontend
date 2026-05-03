import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { site } from "@/config/site";
import { apiGetBuyById, apiGetSellById, apiGetWithdrawalById, getApiErrorMessage } from "@/lib/api";
import { fmtINR, type TxnType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { normalizeDetailStatus, TxnStatusPill } from "@/components/app/TxnStatus";
import { FormattedUsdt, RawAmountUsdt, UsdtWord } from "@/components/app/UsdtMark";

type TxnSearch = {
  id: string;
  kind: TxnType;
};

export const Route = createFileRoute("/app/transaction")({
  validateSearch: (search: Record<string, unknown>): TxnSearch => ({
    id: typeof search.id === "string" ? search.id : "",
    kind:
      search.kind === "buy" || search.kind === "sell" || search.kind === "withdrawal"
        ? search.kind
        : "buy",
  }),
  head: () => ({ meta: [{ title: `Transaction — ${site.siteName}` }] }),
  component: TransactionDetailPage,
});

function copyText(label: string, text: string) {
  if (!text || text === "—") return;
  void navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
}

function TransactionDetailPage() {
  const { id, kind } = Route.useSearch();

  const q = useQuery({
    queryKey: ["txn-detail", kind, id],
    queryFn: async () => {
      if (!id) throw new Error("Missing transaction id");
      if (kind === "buy") {
        const { data } = await apiGetBuyById(id);
        if (!data.success || !data.data) throw new Error("Not found");
        return { kind: "buy" as const, data: data.data };
      }
      if (kind === "sell") {
        const { data } = await apiGetSellById(id);
        if (!data.success || !data.data) throw new Error("Not found");
        return { kind: "sell" as const, data: data.data };
      }
      const { data } = await apiGetWithdrawalById(id);
      if (!data.success || !data.data) throw new Error("Not found");
      return { kind: "withdrawal" as const, data: data.data };
    },
    enabled: Boolean(id),
  });

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-secondary text-sm">Invalid link.</p>
        <Button variant="outline" asChild className="glass border-border/60">
          <Link to="/app/transactions">All transactions</Link>
        </Button>
      </div>
    );
  }

  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-secondary text-sm">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">{getApiErrorMessage(q.error)}</p>
        <Button variant="outline" asChild className="glass border-border/60">
          <Link to="/app/transactions">All transactions</Link>
        </Button>
      </div>
    );
  }

  const row = q.data!;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Link
        to="/app/transactions"
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> All transactions
      </Link>

      {row.kind === "buy" && <BuyDetail kind={row.kind} d={row.data} />}
      {row.kind === "sell" && <SellDetail kind={row.kind} d={row.data} />}
      {row.kind === "withdrawal" && <WithdrawalDetail kind={row.kind} d={row.data} />}
    </div>
  );
}

function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">
        {title}
      </h2>
      <div className="rounded-2xl border border-border/70 bg-surface/50 overflow-hidden divide-y divide-border/50">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  copyable,
  copyLabel,
}: {
  label: ReactNode;
  value: ReactNode;
  copyable?: string;
  copyLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <div className="flex items-start justify-end gap-2 min-w-0 sm:max-w-[65%]">
        <span className="font-medium text-sm text-right break-all">{value}</span>
        {copyable && copyable !== "—" && (
          <button
            type="button"
            onClick={() => copyText(copyLabel || label, copyable)}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentProofCard({ url }: { url: string }) {
  const trimmed = url.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return null;

  return (
    <Section title="Your payment screenshot">
      <div className="p-4 space-y-3 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          This is the proof image you attached with your request. Tap the image to open the full file.
        </p>
        <a
          href={trimmed}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-border/80 overflow-hidden bg-background/80 hover:border-primary/40 transition-colors"
        >
          <img
            src={trimmed}
            alt="Payment proof you uploaded"
            className="w-full max-h-72 object-contain bg-black/5 dark:bg-black/20"
            loading="lazy"
          />
          <div className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-primary">
            <ExternalLink className="h-3.5 w-3.5" />
            Open full size
          </div>
        </a>
      </div>
    </Section>
  );
}

function formatWhen(d: Record<string, unknown>) {
  const raw = d.createdAt;
  if (!raw) return "—";
  try {
    return new Date(String(raw)).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function BuyDetail({ kind, d }: { kind: "buy"; d: Record<string, unknown> }) {
  const orderId = d.orderId != null ? String(d.orderId) : "—";
  const st = String(d.status || "pending");
  const uiStatus = normalizeDetailStatus(kind, st);
  const shot = d.screenshotUrl != null ? String(d.screenshotUrl) : "";

  return (
    <>
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-surface/80 to-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Buy order</p>
            <p className="text-lg font-bold tracking-tight mt-0.5">{fmtINR(Number(d.amountINR ?? 0))}</p>
            <p className="text-sm text-secondary mt-1 inline-flex items-center gap-1 flex-wrap">
              → <FormattedUsdt value={Number(d.usdtAmount ?? 0)} size="xs" /> net
            </p>
          </div>
          <TxnStatusPill status={uiStatus} size="lg" />
        </div>
        <p className="text-xs text-muted-foreground mt-4 font-mono break-all">ID: {orderId}</p>
      </div>

      <Section title="Summary">
        <DetailRow label="Order ID" value={orderId} copyable={orderId} />
        <DetailRow label="Status (raw)" value={<span className="capitalize">{st}</span>} />
        <DetailRow
          label={
            <span className="inline-flex items-center gap-1">
              <UsdtWord size="2xs" /> (before fee)
            </span>
          }
          value={<FormattedUsdt value={Number(d.usdtGrossBeforeFee ?? 0)} size="xs" />}
        />
        <DetailRow
          label="Blockchain fee"
          value={<RawAmountUsdt amountText={String(d.exchangeFeeUsdt ?? "0")} size="xs" />}
        />
        <DetailRow label="Buy asset" value={<span className="capitalize">{String(d.buyAsset ?? "—")}</span>} />
        <DetailRow
          label={
            <span className="inline-flex items-center gap-1">
              Rate (₹/<UsdtWord size="2xs" />)
            </span>
          }
          value={String(d.price ?? "—")}
        />
        <DetailRow label="Created" value={formatWhen(d)} />
      </Section>

      <Section title="Payment">
        <DetailRow label="Method" value={String(d.paymentMethod ?? "—")} />
        <DetailRow label="Channel" value={String(d.paymentChannel ?? "—")} />
        <DetailRow label="UTR / reference" value={String(d.utrNumber ?? "—")} copyable={String(d.utrNumber || "")} copyLabel="UTR" />
      </Section>

      <Section title="Delivery">
        <DetailRow label="Network" value={String(d.network ?? "—")} />
        <DetailRow
          label="Wallet"
          value={String(d.walletAddress || "—")}
          copyable={d.walletAddress ? String(d.walletAddress) : undefined}
        />
      </Section>

      {shot ? <PaymentProofCard url={shot} /> : null}
    </>
  );
}

function SellDetail({ kind, d }: { kind: "sell"; d: Record<string, unknown> }) {
  const st = String(d.status || "pending");
  const uiStatus = normalizeDetailStatus(kind, st);
  const shot = d.screenshotUrl != null ? String(d.screenshotUrl) : "";

  return (
    <>
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-emerald-500/10 via-surface/80 to-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sell request</p>
            <p className="text-lg font-bold tracking-tight mt-0.5 inline-flex items-center gap-1">
              <FormattedUsdt value={Number(d.usdtAmount ?? 0)} />
            </p>
            <p className="text-sm text-secondary mt-1">Payout ≈ {fmtINR(Number(d.amountINR ?? 0))}</p>
          </div>
          <TxnStatusPill status={uiStatus} size="lg" />
        </div>
      </div>

      <Section title="Amounts">
        <DetailRow label="Status" value={<span className="capitalize">{st}</span>} />
        <DetailRow
          label={
            <span className="inline-flex items-center gap-1">
              <UsdtWord size="2xs" /> sold
            </span>
          }
          value={<FormattedUsdt value={Number(d.usdtAmount ?? 0)} size="xs" />}
        />
        <DetailRow label="INR payout" value={fmtINR(Number(d.amountINR ?? 0))} />
        <DetailRow label="Created" value={formatWhen(d)} />
      </Section>

      <Section title="Your payout">
        <DetailRow label="Method" value={String(d.payoutMethod ?? "—")} />
        <DetailRow label="UPI ID" value={String(d.upiId || "—")} copyable={d.upiId ? String(d.upiId) : undefined} />
        <DetailRow label="Bank details" value={String(d.bankDetails || "—")} />
      </Section>

      <Section
        title={
          <span className="inline-flex items-center gap-1">
            Your <UsdtWord size="xs" /> transfer (on-chain)
          </span>
        }
      >
        <DetailRow
          label="Your TXID"
          value={String(d.referenceNumber ?? "—")}
          copyable={d.referenceNumber ? String(d.referenceNumber) : undefined}
          copyLabel="TXID"
        />
        <DetailRow label="Network" value={String(d.network ?? "—")} />
        <DetailRow
          label="Our deposit address"
          value={String(d.ourWalletAddress ?? "—")}
          copyable={d.ourWalletAddress ? String(d.ourWalletAddress) : undefined}
        />
      </Section>

      {shot ? <PaymentProofCard url={shot} /> : null}

      {String(d.payoutReference || "").trim() ? (
        <Section title="INR payout confirmation">
          <DetailRow
            label="Payout reference (UTR / bank ref)"
            value={String(d.payoutReference)}
            copyable={String(d.payoutReference)}
            copyLabel="Payout reference"
          />
        </Section>
      ) : null}
    </>
  );
}

function WithdrawalDetail({ kind, d }: { kind: "withdrawal"; d: Record<string, unknown> }) {
  const st = String(d.status || "pending");
  const uiStatus = normalizeDetailStatus(kind, st);

  return (
    <>
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-violet-500/10 via-surface/80 to-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Withdrawal</p>
            <p className="text-lg font-bold tracking-tight mt-0.5 inline-flex items-center gap-1">
              <FormattedUsdt value={Number(d.amountUsdt ?? 0)} />
            </p>
            <p className="text-sm text-secondary mt-1">{String(d.network ?? "—")}</p>
          </div>
          <TxnStatusPill status={uiStatus} size="lg" />
        </div>
      </div>

      <Section title="Details">
        <DetailRow label="Status" value={<span className="capitalize">{st}</span>} />
        <DetailRow label="Network" value={String(d.network ?? "—")} />
        <DetailRow
          label="Destination wallet"
          value={String(d.walletAddress ?? "—")}
          copyable={d.walletAddress ? String(d.walletAddress) : undefined}
        />
        <DetailRow label="TXID (after approval)" value={String(d.txid || "—")} copyable={d.txid ? String(d.txid) : undefined} />
        <DetailRow label="Requested" value={formatWhen(d)} />
      </Section>

      <p className="text-xs text-muted-foreground px-1">
        Withdrawals do not include a payment screenshot. Status updates when the team processes your request.
      </p>
    </>
  );
}
