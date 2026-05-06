import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiCreateRefundRequest, getApiErrorMessage, type RefundMethod } from "@/lib/api";

// Note: This file lives in `src/routes/`, so prefix with `-` to avoid TanStack route generation warnings.
export function RefundDialog({ buyId, onDone }: { buyId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<RefundMethod>("original");
  const [submitting, setSubmitting] = useState(false);

  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  const submit = async () => {
    setSubmitting(true);
    try {
      await apiCreateRefundRequest({
        buyTransactionId: buyId,
        refundMethod: method,
        accountHolderName: method === "bank" ? accountHolderName : undefined,
        bankName: method === "bank" ? bankName : undefined,
        accountNumber: method === "bank" ? accountNumber : undefined,
        ifsc: method === "bank" ? ifsc : undefined,
      });
      toast.success("Refund request submitted");
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary border-0 hover-glow" type="button">
          Request refund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request refund</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Refund method</Label>
            <RadioGroup
              value={method}
              onValueChange={(v) => {
                if (v === "original" || v === "bank") setMethod(v);
              }}
              className="space-y-2"
            >
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="original" />
                Original payment method
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="bank" />
                Bank transfer
              </label>
            </RadioGroup>
          </div>

          {method === "bank" ? (
            <div className="space-y-3">
              <Input
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Account holder name"
              />
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" />
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
              />
              <Input value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="IFSC" />
              <p className="text-xs text-muted-foreground">
                Refund will be initiated within <span className="font-semibold">3–4 working days</span> after approval.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              We will refund to your original payment method. Refund will be initiated within{" "}
              <span className="font-semibold">3–4 working days</span> after approval.
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="glass border-border/60"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="gradient-primary border-0 hover-glow"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

