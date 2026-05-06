import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { site } from "@/config/site";
import {
  apiGetBuyHistory,
  apiListMyRefundRequests,
  type RefundRequest,
  getApiErrorMessage,
} from "@/lib/api";
import { fmtINR } from "@/lib/store";
import { TxnStatusPill, normalizeDetailStatus } from "@/components/app/TxnStatus";
import { RefundDialog } from "@/routes/-app.refunds._refundDialog";

export const Route = createFileRoute("/app/refunds")({
  head: () => ({ meta: [{ title: `Refunds — ${site.siteName}` }] }),
  component: RefundsPage,
});

function RefundsPage() {
  const nav = useNavigate();
  const buysQ = useQuery({
    queryKey: ["buy-history"],
    queryFn: async () => {
      const { data } = await apiGetBuyHistory(1, 200);
      if (!data.success) throw new Error("Could not load buy history");
      return data.data || [];
    },
  });

  const refundsQ = useQuery({
    queryKey: ["refund-requests"],
    queryFn: async () => {
      const { data } = await apiListMyRefundRequests(1, 200);
      if (!data.success) throw new Error("Could not load refund requests");
      return data.data || [];
    },
  });

  const refundByBuyId = useMemo(() => {
    const m = new Map<string, RefundRequest>();
    for (const r of refundsQ.data || []) {
      if (r.buyTransactionId) m.set(String(r.buyTransactionId), r);
    }
    return m;
  }, [refundsQ.data]);

  const buys = buysQ.data || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Refunds</h1>
        <p className="text-sm text-secondary mt-1">
          Request a refund for your buy transactions. Refunds are initiated within{" "}
          <span className="font-semibold">3–4 working days</span>.
        </p>
      </div>

      {buysQ.isLoading || refundsQ.isLoading ? (
        <div className="glass rounded-2xl p-10 text-secondary text-sm">Loading…</div>
      ) : buysQ.isError || refundsQ.isError ? (
        <div className="glass rounded-2xl p-10 text-sm text-destructive">
          {getApiErrorMessage(buysQ.error || refundsQ.error)}
        </div>
      ) : buys.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-secondary text-sm">
          No buy transactions yet.
        </div>
      ) : (
        <div className="space-y-2">
          {buys.map((b) => {
            const id = String(b._id);
            const rr = refundByBuyId.get(id);
            const statusText = String(b.status || "pending");
            const uiStatus = normalizeDetailStatus("buy", statusText);
            const refundStatus = rr?.status;
            const rejectNote = rr?.status === "rejected" ? (rr.adminNote || "").trim() : "";

            return (
              <button
                key={id}
                type="button"
                className="block w-full text-left glass rounded-2xl p-4 border border-border/50 hover:border-primary/20 transition-colors"
                onClick={() => nav({ to: "/app/refunds/$id", params: { id } })}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">
                      Buy {fmtINR(Number(b.amountINR || 0))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Order: <span className="font-mono">{b.orderId || "—"}</span> ·{" "}
                      {b.paymentMethod || "—"} · {b.utrNumber || "—"}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <TxnStatusPill status={uiStatus} size="sm" />
                  </div>
                </div>

                {refundStatus ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-secondary">
                        Refund status:{" "}
                        <span className="font-semibold capitalize">{refundStatus}</span>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        Method: {rr?.refundMethod || "—"}
                      </div>
                    </div>

                    {refundStatus === "rejected" && rejectNote ? (
                      <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm animate-reject-reason-soft">
                        <div className="font-semibold text-destructive">Refund rejected</div>
                        <div className="text-destructive/90 mt-1 break-words">{rejectNote}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Refund will be initiated within{" "}
                        <span className="font-semibold">3–4 working days</span>.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Refund will be initiated within{" "}
                      <span className="font-semibold">3–4 working days</span> after approval.
                    </div>
                    <div onClick={(e) => e.preventDefault()}>
                      <RefundDialog buyId={id} onDone={() => refundsQ.refetch()} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
