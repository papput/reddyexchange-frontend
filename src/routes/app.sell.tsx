import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "@/components/app/StepIndicator";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { apiCreateSell, getApiErrorMessage } from "@/lib/api";
import { site } from "@/config/site";
import { ProofUploadPreview } from "@/components/app/ProofUploadPreview";
import { fmtINR, usdtToInr, type PayMethod } from "@/lib/store";
import { FormattedUsdt, UsdtWord } from "@/components/app/UsdtMark";
import { BankImpsMark, UpiMark } from "@/components/app/ExchangeMark";

export const Route = createFileRoute("/app/sell")({
  head: () => ({ meta: [{ title: `Sell USDT — ${site.siteName}` }] }),
  component: SellFlow,
});

const MIN_SELL_USDT = 10;
const TOTAL_STEPS = 5;
const LABELS: ReactNode[] = [
  "Amount",
  <span key="send" className="inline-flex items-center gap-1">
    Send <UsdtWord size="xs" />
  </span>,
  "TXID & proof",
  "Payout",
  "Success",
];

type SellNetwork = "TRC20" | "BEP20";

/** Sell rate — compact card, gradient price + glow (no extra copy) */
function SellPriceGlow({ sellRate }: { sellRate: number }) {
  return (
    <div className="mb-4 flex justify-center px-1">
      <div
        className="relative inline-flex min-w-0 max-w-[280px] flex-col items-center rounded-xl border border-primary/35 bg-gradient-to-br from-primary/20 via-surface to-accent/10 px-5 py-3 text-center animate-sell-price-glow sm:max-w-xs"
        title={`Sell rate ₹${sellRate.toFixed(2)} per USDT (Tether)`}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-primary/25 via-accent/20 to-primary/25 opacity-50 blur-lg"
          aria-hidden
        />
        <p className="relative text-[10px] font-semibold uppercase tracking-widest text-accent mb-1">Sell rate</p>
        <p className="relative text-2xl sm:text-3xl font-bold tabular-nums tracking-tight leading-none">
          <span className="gradient-text drop-shadow-[0_0_16px_color-mix(in_oklab,var(--accent)_40%,transparent)]">
            ₹{sellRate.toFixed(2)}
          </span>
          <span className="text-sm sm:text-base font-semibold text-muted-foreground inline-flex items-center gap-1">
            {" "}
            / <UsdtWord size="sm" className="text-muted-foreground font-semibold" />
          </span>
        </p>
      </div>
    </div>
  );
}

function SellFlow() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = usePublicSettings();
  const buyRate = settings?.price ?? 91;
  const sellRate = settings?.sellPriceInr ?? buyRate;
  const wallets = settings?.primeExchUsdtWallets ?? {};

  const [step, setStep] = useState(1);
  const [usdt, setUsdt] = useState(50);
  const [network, setNetwork] = useState<SellNetwork>("TRC20");
  const [payMethod, setPayMethod] = useState<PayMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bank, setBank] = useState("");
  const [txRef, setTxRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sellId, setSellId] = useState("");

  const inr = useMemo(() => usdtToInr(usdt, sellRate), [usdt, sellRate]);
  const depositAddress = (wallets[network] || "").trim();

  useEffect(() => {
    if (!settings) return;
    setUsdt((u) => Math.max(MIN_SELL_USDT, u));
  }, [settings]);

  const next = () => {
    if (step === 1) {
      if (usdt < MIN_SELL_USDT) return toast.error(`Minimum sell amount is ${MIN_SELL_USDT} USDT`);
    }
    if (step === 2) {
      if (!depositAddress) return toast.error(`No ${network} deposit wallet configured. Contact support.`);
    }
    if (step === 3) {
      if (!txRef.trim() || txRef.trim().length < 6) return toast.error("Enter your on-chain TXID (min 6 characters)");
      if (!proofFile) return toast.error("Upload a transfer screenshot");
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (payMethod === "upi") {
      if (!upiId.includes("@")) return toast.error("Enter a valid UPI ID");
    } else {
      if (!accountName || accountNumber.length < 6 || ifsc.length < 6 || !bank) return toast.error("Complete bank details");
    }
    if (!txRef.trim() || txRef.trim().length < 6) return toast.error("Enter your on-chain TXID");
    if (!proofFile) return toast.error("Upload transfer proof");
    if (usdt < MIN_SELL_USDT) return toast.error(`Minimum sell amount is ${MIN_SELL_USDT} USDT`);

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("usdtAmount", String(usdt));
      fd.append("network", network);
      fd.append("payoutMethod", payMethod === "upi" ? "UPI" : "BANK");
      fd.append("referenceNumber", txRef.trim());
      fd.append("screenshot", proofFile);
      if (payMethod === "upi") {
        fd.append("upiId", upiId.trim());
      } else {
        fd.append(
          "bankDetails",
          JSON.stringify({
            holderName: accountName.trim(),
            bankName: bank.trim(),
            accountNumber: accountNumber.trim(),
            ifsc: ifsc.trim(),
          })
        );
      }
      const { data } = await apiCreateSell(fd);
      setSellId(String(data.data?._id || ""));
      await qc.invalidateQueries({ queryKey: ["user-transactions"] });
      setStep(5);
      toast.success("Sell request submitted");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setUsdt(Math.max(MIN_SELL_USDT, 50));
    setTxRef("");
    setProofFile(null);
    setSellId("");
  };

  if (settingsLoading || !settings) {
    return (
      <div className="flex items-center justify-center py-20 text-secondary text-sm">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading rates…
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1 inline-flex items-center gap-2">
        Sell <UsdtWord size="md" />
      </h1>
      <SellPriceGlow sellRate={sellRate} />
      <StepIndicator step={step} total={TOTAL_STEPS} labels={LABELS} />

      <div className="glass-strong rounded-2xl p-5 sm:p-6 animate-fade-up">
        {step === 1 && <StepAmount usdt={usdt} setUsdt={setUsdt} inr={inr} minUsdt={MIN_SELL_USDT} />}
        {step === 2 && <StepSend usdt={usdt} network={network} setNetwork={setNetwork} address={depositAddress} />}
        {step === 3 && (
          <StepTxidAndProof
            network={network}
            txRef={txRef}
            setTxRef={setTxRef}
            proofFile={proofFile}
            setProofFile={setProofFile}
          />
        )}
        {step === 4 && (
          <StepPayout
            inr={inr}
            payMethod={payMethod}
            setPayMethod={setPayMethod}
            upiId={upiId}
            setUpiId={setUpiId}
            accountName={accountName}
            setAccountName={setAccountName}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            ifsc={ifsc}
            setIfsc={setIfsc}
            bank={bank}
            setBank={setBank}
          />
        )}
        {step === 5 && <StepStatus sellId={sellId} inr={inr} usdt={usdt} payMethod={payMethod} />}

        {step < 5 && (
          <div className="mt-6 flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={back} className="glass border-border/60">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={next} className="flex-1 gradient-primary border-0 hover-glow h-11">
                {step === 2 ? (
                  <span className="inline-flex items-center gap-1">
                    I&apos;ve sent <UsdtWord size="xs" />
                  </span>
                ) : (
                  "Continue"
                )}{" "}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="flex-1 gradient-primary border-0 hover-glow h-11">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Confirm sell <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => nav({ to: "/app" })} className="flex-1 glass border-border/60 h-11">
              Go home
            </Button>
            <Button onClick={resetFlow} className="flex-1 gradient-primary border-0 hover-glow h-11">
              New order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepAmount({
  usdt,
  setUsdt,
  inr,
  minUsdt,
}: {
  usdt: number;
  setUsdt: (n: number) => void;
  inr: number;
  minUsdt: number;
}) {
  const presets = Array.from(new Set([minUsdt, 50, 100, 500].filter((x) => x >= minUsdt).sort((a, b) => a - b)));
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Minimum sell:{" "}
        <span className="text-foreground font-semibold inline-flex items-center gap-1">
          {minUsdt} <UsdtWord size="xs" className="font-semibold" />
        </span>
      </p>
      <Field
        label={
          <span className="inline-flex items-center gap-1">
            You sell (<UsdtWord size="2xs" />)
          </span>
        }
      >
        <div className="flex items-baseline gap-2 px-4 py-3">
          <Input
            type="number"
            min={minUsdt}
            step="0.01"
            value={usdt}
            onChange={(e) => setUsdt(Math.max(minUsdt, Number(e.target.value) || minUsdt))}
            className="border-0 bg-transparent text-3xl font-semibold p-0 h-auto focus-visible:ring-0 shadow-none"
          />
          <UsdtWord size="sm" className="text-secondary" />
        </div>
      </Field>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setUsdt(p)}
            className="px-3 py-1.5 text-xs rounded-full bg-surface border border-border hover:border-primary/50 transition"
          >
            <span className="inline-flex items-center gap-1">
              {p} <UsdtWord size="2xs" />
            </span>
          </button>
        ))}
      </div>
      <Field label="You receive (INR)">
        <div className="flex items-baseline gap-2 px-4 py-3">
          <span className="text-3xl font-semibold gradient-text">{fmtINR(inr)}</span>
        </div>
      </Field>
    </div>
  );
}

function StepSend({
  usdt,
  network,
  setNetwork,
  address,
}: {
  usdt: number;
  network: SellNetwork;
  setNetwork: (n: SellNetwork) => void;
  address: string;
}) {
  const networks: SellNetwork[] = ["TRC20", "BEP20"];
  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-secondary uppercase tracking-wide mb-2 block">Network</Label>
        <div className="grid grid-cols-2 gap-2">
          {networks.map((n) => {
            const active = n === network;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setNetwork(n)}
                className={`rounded-xl p-3 text-left border transition ${active ? "bg-primary/15 border-primary/60 shadow-[0_0_16px_-4px_var(--primary)]" : "bg-surface border-border hover:border-primary/30"}`}
              >
                <div className="font-semibold text-sm">{n}</div>
                <div className="text-[10px] text-muted-foreground">{n === "TRC20" ? "Tron · Recommended" : "BNB Chain"}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-5 border border-border text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Send exactly</div>
        <div className="text-3xl font-bold gradient-text mb-3 inline-flex items-center gap-1">
          <FormattedUsdt value={usdt} size="lg" />
        </div>
        {address ? (
          <>
            <p className="text-[11px] text-muted-foreground mb-2">QR matches the deposit address from our servers for {network}.</p>
            <div className="bg-white p-3 rounded-xl inline-block">
              <QRCodeSVG key={`${network}-${address}`} value={address} size={180} level="M" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 bg-background rounded-xl px-3 py-2 border border-border">
              <span className="font-mono text-xs truncate text-left">{address}</span>
              <button
                type="button"
                onClick={copy}
                className="shrink-0 p-1.5 rounded-md hover:bg-surface text-muted-foreground hover:text-foreground transition"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-destructive">Deposit address missing for {network}. Ask admin to set wallets in settings.</p>
        )}
        <div className="text-xs text-muted-foreground mt-3">
          Network: <span className="text-foreground">{network}</span>
        </div>
      </div>

      <div className="rounded-xl bg-yellow-400/10 text-yellow-200 text-xs p-3 border border-yellow-400/20">
        ⚠ Send only <UsdtWord size="xs" className="font-semibold text-yellow-100" /> on {network}. Other tokens or networks
        will be lost.
      </div>
    </div>
  );
}

function StepTxidAndProof({
  network,
  txRef,
  setTxRef,
  proofFile,
  setProofFile,
}: {
  network: SellNetwork;
  txRef: string;
  setTxRef: (s: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        After sending on {network}, add your <span className="text-foreground font-medium">TXID</span> and a{" "}
        <span className="text-foreground font-medium">wallet screenshot</span> (same step).
      </p>

      <div className="rounded-2xl border border-border/80 bg-surface/40 p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">1 · On-chain TXID</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Transaction hash from the blockchain (not UPI / bank reference).
          </p>
        </div>
        <Field label="Transaction hash">
          <Input
            value={txRef}
            onChange={(e) => setTxRef(e.target.value)}
            placeholder={`${network} transaction hash`}
            className="border-0 bg-transparent h-12 px-4 focus-visible:ring-0 shadow-none font-mono text-sm"
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/40 p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">2 · Transfer screenshot</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Screenshot from your wallet showing amount, time, and destination address.
          </p>
        </div>
        <ProofUploadPreview
          file={proofFile}
          onFileChange={setProofFile}
          inputRef={fileRef}
          label="Screenshot / photo of transfer"
        />
      </div>
    </div>
  );
}

function StepPayout({
  inr,
  payMethod,
  setPayMethod,
  upiId,
  setUpiId,
  accountName,
  setAccountName,
  accountNumber,
  setAccountNumber,
  ifsc,
  setIfsc,
  bank,
  setBank,
}: {
  inr: number;
  payMethod: PayMethod;
  setPayMethod: (p: PayMethod) => void;
  upiId: string;
  setUpiId: (s: string) => void;
  accountName: string;
  setAccountName: (s: string) => void;
  accountNumber: string;
  setAccountNumber: (s: string) => void;
  ifsc: string;
  setIfsc: (s: string) => void;
  bank: string;
  setBank: (s: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-success/10 border border-success/30 p-3 text-sm">
        You will receive <span className="font-semibold text-success">{fmtINR(inr)}</span> after{" "}
        <UsdtWord size="xs" className="font-semibold text-foreground" /> confirmation.
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPayMethod("upi")}
          className={`rounded-xl p-3 border transition flex items-center gap-3 ${payMethod === "upi" ? "bg-primary/15 border-primary/60" : "bg-surface border-border hover:border-primary/30"}`}
        >
          <UpiMark className="h-10 w-10 shrink-0 object-contain" />
          <div className="text-left">
            <div className="font-semibold text-sm">UPI</div>
            <div className="text-[10px] text-muted-foreground">Instant payout</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setPayMethod("bank")}
          className={`rounded-xl p-3 border transition flex items-center gap-3 ${payMethod === "bank" ? "bg-primary/15 border-primary/60" : "bg-surface border-border hover:border-primary/30"}`}
        >
          <BankImpsMark className="h-10 w-10 shrink-0 object-contain" />
          <div className="text-left">
            <div className="font-semibold text-sm">Bank</div>
            <div className="text-[10px] text-muted-foreground">IMPS</div>
          </div>
        </button>
      </div>

      {payMethod === "upi" ? (
        <Field label="Your UPI ID">
          <Input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="name@bank"
            className="border-0 bg-transparent h-12 px-4 focus-visible:ring-0 shadow-none"
          />
        </Field>
      ) : (
        <div className="space-y-3">
          <Field label="Account holder name">
            <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 shadow-none" />
          </Field>
          <Field label="Account number">
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 shadow-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="IFSC">
              <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 shadow-none" />
            </Field>
            <Field label="Bank">
              <Input value={bank} onChange={(e) => setBank(e.target.value)} className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 shadow-none" />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

function StepStatus({ sellId, inr, usdt, payMethod }: { sellId: string; inr: number; usdt: number; payMethod: PayMethod }) {
  return (
    <div className="text-center py-4">
      <div className="mx-auto h-16 w-16 rounded-full gradient-primary grid place-items-center mb-4 animate-pulse-glow">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold">Sell request submitted</h2>
      <p className="text-secondary text-sm mt-1">
        We&apos;ll release INR to your {payMethod === "upi" ? "UPI" : "bank account"} once{" "}
        <UsdtWord size="xs" className="font-semibold text-foreground" /> is confirmed.
      </p>
      <div className="mt-5 rounded-xl bg-surface p-4 text-sm space-y-2 text-left border border-border">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground text-xs shrink-0">Request ID</span>
          <span className="font-medium font-mono text-xs truncate text-right">{sellId || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-xs inline-flex items-center gap-1">
            <UsdtWord size="2xs" /> sold
          </span>
          <span className="font-medium inline-flex items-center gap-1">
            <FormattedUsdt value={usdt} size="xs" />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-xs">You receive</span>
          <span className="font-medium">{fmtINR(inr)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-xs">Status</span>
          <span className="text-yellow-300">Pending</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-secondary uppercase tracking-wide">{label}</Label>
      <div className="rounded-xl bg-surface border border-border ring-focus">{children}</div>
    </div>
  );
}
