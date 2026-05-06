import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { TxnStatusPill, normalizeDetailStatus } from "@/components/app/TxnStatus";
import { fmtINR } from "@/lib/store";
import {
  apiGetBuyById,
  apiListMyRefundRequests,
  getApiErrorMessage,
  type RefundRequest,
} from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { FormattedUsdt } from "@/components/app/UsdtMark";
import { RefundDialog } from "@/routes/-app.refunds._refundDialog";

export const Route = createFileRoute("/app/refunds/$id")({
  head: () => ({ meta: [{ title: `Refund details — ${site.siteName}` }] }),
  component: RefundDetailPage,
});

function RefundDetailPage() {
  const { id } = Route.useParams();

  const buyQ = useQuery({
    queryKey: ["buy-detail", id],
    queryFn: async () => {
      const { data } = await apiGetBuyById(id);
      if (!data.success || !data.data) throw new Error("Buy transaction not found");
      return data.data;
    },
    enabled: Boolean(id),
  });

  const refundsQ = useQuery({
    queryKey: ["refund-requests"],
    queryFn: async () => {
      const { data } = await apiListMyRefundRequests(1, 200);
      if (!data.success) throw new Error("Could not load refund requests");
      return data.data || [];
    },
  });

  const refund = useMemo(() => {
    const list = refundsQ.data || [];
    return list.find((r) => String(r.buyTransactionId) === String(id)) || null;
  }, [id, refundsQ.data]);

  if (buyQ.isLoading || refundsQ.isLoading) {
    return <div className="glass rounded-2xl p-10 text-secondary text-sm">Loading…</div>;
  }

  if (buyQ.isError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{getApiErrorMessage(buyQ.error)}</p>
        <Button variant="outline" asChild className="glass border-border/60">
          <Link to="/app/refunds">Back</Link>
        </Button>
      </div>
    );
  }

  if (refundsQ.isError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{getApiErrorMessage(refundsQ.error)}</p>
        <Button variant="outline" asChild className="glass border-border/60">
          <Link to="/app/refunds">Back</Link>
        </Button>
      </div>
    );
  }

  const b = buyQ.data!;
  const statusText = String(b.status || "pending");
  const uiStatus = normalizeDetailStatus("buy", statusText);

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <Link
        to="/app/refunds"
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to refunds
      </Link>

      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-surface/80 to-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Buy</p>
            <p className="text-lg font-bold tracking-tight mt-0.5">
              {fmtINR(Number(b.amountINR ?? 0))}
            </p>
            <p className="text-sm text-secondary mt-1 inline-flex items-center gap-1 flex-wrap">
              → <FormattedUsdt value={Number(b.usdtAmount ?? 0)} size="xs" /> net
            </p>
          </div>
          <TxnStatusPill status={uiStatus} size="lg" />
        </div>
        <p className="text-xs text-muted-foreground mt-4 font-mono break-all">
          Order: {String(b.orderId || "—")}
        </p>
      </div>

      <section className="rounded-2xl border border-border/70 bg-surface/50 overflow-hidden divide-y divide-border/50">
        <Row label="Payment method" value={String(b.paymentMethod || "—")} />
        <Row label="Payment channel" value={String(b.paymentChannel || "—")} />
        <Row label="UTR" value={String(b.utrNumber || "—")} mono />
        <Row label="Network" value={String(b.network || "—")} />
        <Row label="Wallet address" value={String(b.walletAddress || "—")} mono />
      </section>

      {refund ? (
        <RefundStatusCard refund={refund} />
      ) : (
        <div className="glass rounded-2xl p-4 border border-border/50 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Refund will be initiated within <span className="font-semibold">3–4 working days</span>{" "}
            after approval.
          </div>
          <RefundDialog buyId={id} onDone={() => refundsQ.refetch()} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span
        className={`font-medium text-sm text-right break-all ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function RefundStatusCard({ refund }: { refund: RefundRequest }) {
  const rejectNote = refund.status === "rejected" ? (refund.adminNote || "").trim() : "";
  return (
    <div className="glass rounded-2xl p-4 border border-border/50 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-secondary">
          Refund status: <span className="font-semibold capitalize">{refund.status}</span>
        </div>
        <div className="text-xs text-muted-foreground capitalize">
          Method: {refund.refundMethod}
        </div>
      </div>

      {refund.status === "rejected" && rejectNote ? (
        <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm animate-reject-reason-soft">
          <div className="font-semibold text-destructive">Refund rejected</div>
          <div className="text-destructive/90 mt-1 break-words">{rejectNote}</div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          Refund will be initiated within <span className="font-semibold">3–4 working days</span>.
        </div>
      )}
    </div>
  );
}
