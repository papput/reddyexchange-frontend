import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Copy, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuyFlowProgressBar } from "@/components/app/StepIndicator";
import { usePublicSettings } from "@/hooks/use-public-settings";
import {
  apiConfirmAutoUpi,
  apiCreateBuy,
  apiInitiateAutoUpi,
  apiTrackBuyStep,
  getApiErrorMessage,
} from "@/lib/api";
import {
  estimateBuyUsdt,
  estimateInrFromNetUsdt,
  fmtINR,
  fmtUSDT,
  useAuth,
  type Network,
  type PayMethod,
} from "@/lib/store";
import { BuyFlowStepChoosePayAndToken, type BuyAsset } from "@/components/app/BuyFlowStepChoosePayAndToken";
import { site } from "@/config/site";
import { IconBsc, IconEth, IconPex, IconTron } from "@/components/app/NetworkTokenPicker";
import { ProofUploadPreview } from "@/components/app/ProofUploadPreview";
import { FormattedUsdt, InrPerUsdtRate, UsdtMark, UsdtWord } from "@/components/app/UsdtMark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/buy")({
  head: () => ({ meta: [{ title: `Buy — ${site.siteName}` }] }),
  component: BuyFlow,
});

const FALLBACK_MIN_INR = 2000;
const STEP_LABELS = ["Payment & asset", "Amount", "Pay", "Proof", "Done"];
const TOTAL_STEPS = 5;
const BUY_AUTO_SESSION_KEY = "neon_buy_auto_order_v1";

function fmtUsdtAmount(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function networkFee(network: Network, fees: { TRC20: number; ERC20: number; BEP20: number }) {
  return network === "ERC20" ? fees.ERC20 : network === "BEP20" ? fees.BEP20 : fees.TRC20;
}

function whatsappDigitsOnly(raw: string) {
  return String(raw || "").replace(/\D/g, "");
}

const MIN_WALLET_CHARS = 20;

function buildBuyBankImpsWhatsappMessage(opts: {
  inr: number;
  usdt: number;
  network: Network;
  buyAsset: BuyAsset;
  walletAddress: string;
  primeExchBalance?: number | null;
  adminNote?: string;
}) {
  const { inr, usdt, network, buyAsset, walletAddress, primeExchBalance, adminNote } = opts;
  const assetLine =
    buyAsset === "pex"
      ? `Asset: ${site.coinSymbol} (credited to my in-app wallet on ${site.siteName})`
      : `Asset: ${site.standardUsdtLabel}`;
  const trimmedWallet = walletAddress.trim();
  const hasStandardWallet = buyAsset === "standard" && trimmedWallet.length >= MIN_WALLET_CHARS;

  let walletBlock: string;
  if (buyAsset === "pex") {
    const balKnown =
      typeof primeExchBalance === "number" && Number.isFinite(primeExchBalance) && primeExchBalance >= 0;
    const balanceLine = balKnown
      ? `My ${site.coinSymbol} in-app wallet balance (TRC20 / ${site.siteName}): ${fmtUSDT(primeExchBalance)}`
      : `My ${site.coinSymbol} in-app wallet balance (TRC20 / ${site.siteName}): please check my account — no external on-chain address is required for this buy.`;
    walletBlock = [
      `Purchase: ${site.coinName} (${site.coinSymbol}) — credited to my in-app TRC20 wallet balance on ${site.siteName}.`,
      balanceLine,
      "",
      "After IMPS, this balance will increase once payment is verified.",
    ].join("\n");
  } else if (hasStandardWallet) {
    walletBlock = `Destination wallet (${network}): ${trimmedWallet}`;
  } else {
    const balKnown =
      typeof primeExchBalance === "number" && Number.isFinite(primeExchBalance) && primeExchBalance >= 0;
    const balanceLine = balKnown
      ? `My ${site.coinSymbol} (${site.coinName}) in-app wallet balance: ${fmtUSDT(primeExchBalance)}`
      : `My ${site.coinSymbol} (${site.coinName}) in-app wallet balance: (please check my ${site.siteName} account)`;
    walletBlock = [
      `Receiving network selected for this order: ${network} (${site.standardUsdtLabel})`,
      balanceLine,
      "",
      `I have not entered my external ${site.standardUsdtLabel} address in the app yet.`,
      `Please use these lines for the three chain networks — I will confirm / fill my addresses on WhatsApp:`,
      `• TRC20 ${site.standardUsdtLabel} wallet: (to share)`,
      `• BEP20 ${site.standardUsdtLabel} wallet: (to share)`,
      `• ERC20 ${site.standardUsdtLabel} wallet: (to share)`,
      "",
      `Primary network for this IMPS buy: ${network}.`,
    ].join("\n");
  }

  const lines = [
    "Hello — I would like to pay by bank IMPS for my crypto buy.",
    "",
    `Amount (INR): ${fmtINR(inr)}`,
    `USDT (estimated net): ${fmtUSDT(usdt)}`,
    assetLine,
    `Network: ${network}`,
    walletBlock,
    "",
    "Please send me the bank account details for IMPS and confirm once I share the payment reference.",
  ];
  const note = String(adminNote || "").trim();
  if (note) lines.push("", note);
  return lines.join("\n");
}

function BuyFlow() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const auth = useAuth();
  const { data: settings, isLoading: settingsLoading } = usePublicSettings();
  const price = settings?.price ?? 91;
  const minInr = settings?.minInrLimit ?? FALLBACK_MIN_INR;
  const fees = settings?.exchangeFees ?? { TRC20: 0.5, ERC20: 1, BEP20: 0.7 };
  const manualUpi = settings?.manualUpiId ?? "";
  const bank = settings?.bankDetails ?? {};
  const buyBankImpsInstructions = settings?.buyBankImpsInstructions ?? "normal";
  const whatsappNumber = settings?.whatsappNumber ?? "";
  const whatsappMessage = settings?.whatsappMessage ?? "";
  const upiMode = settings?.upiMode ?? "manual";
  const isAutoUpi = upiMode === "auto";

  const [step, setStep] = useState(1);
  const [inr, setInr] = useState<number>(FALLBACK_MIN_INR);
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState<Network>("TRC20");
  const [buyAsset, setBuyAsset] = useState<BuyAsset>("pex");
  const [payMethod, setPayMethod] = useState<PayMethod>("upi");
  const [utr, setUtr] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [autoPayOrderId, setAutoPayOrderId] = useState<string | null>(null);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  /** Which field user last edited for INR ↔ USDT sync */
  const [amountLead, setAmountLead] = useState<"inr" | "usdt">("inr");
  const [usdtInput, setUsdtInput] = useState("");

  const usdt = useMemo(() => estimateBuyUsdt(inr, price, network, fees, buyAsset), [inr, price, network, fees, buyAsset]);
  const grossUsdt = useMemo(() => Number((inr / price).toFixed(6)), [inr, price]);
  const blockchainFeeUsdt = buyAsset === "pex" ? 0 : networkFee(network, fees);

  const receiveLabel: ReactNode =
    buyAsset === "pex" ? (
      `${site.coinSymbol} (TRC20)`
    ) : (
      <span className="inline-flex items-center gap-1">
        <UsdtMark size="sm" />
        <span>
          {site.standardUsdtLabel} ({network})
        </span>
      </span>
    );

  const displayUsdtField =
    amountLead === "inr" ? fmtUsdtAmount(usdt) : usdtInput;

  useEffect(() => {
    if (!settings) return;
    setInr((x) => Math.max(x, minInr));
  }, [settings, minInr]);

  useEffect(() => {
    if (!auth?.token) return;
    void apiTrackBuyStep({ step, amountINR: step === 2 ? inr : undefined }).catch(() => {});
  }, [auth?.token, step, inr]);

  useEffect(() => {
    if (step === 3 && autoPayOrderId) setStep(4);
  }, [step, autoPayOrderId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const qs = new URLSearchParams(window.location.search);
    const resume = qs.get("resume") === "auto";
    const successFlag =
      qs.get("success") === "true" ||
      qs.get("success") === "1" ||
      qs.get("payment_status") === "success" ||
      qs.get("status") === "success";

    let oid =
      qs.get("orderId") ||
      qs.get("order_id") ||
      qs.get("mOrderId") ||
      qs.get("m_order_id");

    let storedOid: string | null = null;
    try {
      const raw = sessionStorage.getItem(BUY_AUTO_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { orderId?: string };
        if (parsed.orderId != null) storedOid = String(parsed.orderId);
      }
    } catch {
      storedOid = null;
    }

    if (!oid && (resume || successFlag) && storedOid) oid = storedOid;

    const fromGateway = (resume || successFlag) && !!oid;
    const hasOrderInQs =
      qs.has("order_id") ||
      qs.has("orderId") ||
      qs.has("mOrderId") ||
      qs.has("m_order_id");
    const sessionMatches = !!oid && !!storedOid && String(oid) === String(storedOid) && hasOrderInQs;

    if ((fromGateway || sessionMatches) && oid) {
      setAutoPayOrderId(String(oid));
      setStep(4);
      sessionStorage.setItem(BUY_AUTO_SESSION_KEY, JSON.stringify({ orderId: String(oid) }));
    }

    const stripQs = resume || successFlag || hasOrderInQs;
    if (stripQs) {
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
    }
  }, []);

  const inrRoundedForGateway = Math.round(Number(inr));

  const startAutoUpiGateway = async () => {
    if (inrRoundedForGateway < minInr) {
      toast.error(`Minimum is ${fmtINR(minInr)}`);
      return;
    }
    if (buyAsset === "standard" && walletAddress.trim().length < 20) {
      toast.error("Enter a valid wallet address");
      return;
    }
    setGatewayLoading(true);
    try {
      const { data } = await apiInitiateAutoUpi({
        amountINR: inrRoundedForGateway,
        network,
        walletAddress: buyAsset === "pex" ? "" : walletAddress.trim(),
        buyAsset,
      });
      const url = data.data?.redirectUrl;
      const oid = data.data?.orderId;
      if (!url || !oid) throw new Error("Invalid payment response");
      sessionStorage.setItem(BUY_AUTO_SESSION_KEY, JSON.stringify({ orderId: oid }));
      window.location.assign(url);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      setGatewayLoading(false);
    }
  };

  const goNext = () => {
    if (step === 2) {
      if (inr < minInr) return toast.error(`Minimum is ${fmtINR(minInr)}`);
      if (usdt <= 0) return toast.error("Amount too low after fees — increase INR or contact support.");
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  };

  const goToProofStep = () => {
    if (buyAsset === "standard" && walletAddress.trim().length < 20) {
      return toast.error("Enter a valid wallet address");
    }
    setStep(4);
  };

  const startExchange = () => {
    setStep(2);
  };

  const back = () => {
    if (step === 4 && autoPayOrderId) {
      setAutoPayOrderId(null);
      sessionStorage.removeItem(BUY_AUTO_SESSION_KEY);
      setUtr("");
      setProofFile(null);
      setStep(3);
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = async () => {
    if (!utr.trim() || utr.trim().length < 6) return toast.error("Enter a valid UTR / reference");
    if (!proofFile) return toast.error("Upload payment screenshot / proof");
    setSubmitting(true);
    try {
      if (autoPayOrderId) {
        const fd = new FormData();
        fd.append("orderId", autoPayOrderId);
        fd.append("utrNumber", utr.trim());
        fd.append("screenshot", proofFile);
        const { data } = await apiConfirmAutoUpi(fd);
        const id = String(data.data?.orderId || data.data?._id || "");
        setOrderId(id);
        setAutoPayOrderId(null);
        sessionStorage.removeItem(BUY_AUTO_SESSION_KEY);
      } else {
        const fd = new FormData();
        fd.append("amountINR", String(inr));
        fd.append("network", network);
        fd.append("walletAddress", buyAsset === "pex" ? "" : walletAddress.trim());
        fd.append("paymentMethod", payMethod === "upi" ? "UPI" : "BANK");
        fd.append("utrNumber", utr.trim());
        fd.append("buyAsset", buyAsset);
        fd.append("screenshot", proofFile);
        const { data } = await apiCreateBuy(fd);
        const id = String(data.data?.orderId || data.data?._id || "");
        setOrderId(id);
      }
      await qc.invalidateQueries({ queryKey: ["user-transactions"] });
      setStep(5);
      toast.success("Order submitted");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setInr(minInr);
    setWalletAddress("");
    setBuyAsset("pex");
    setNetwork("TRC20");
    setPayMethod("upi");
    setUtr("");
    setProofFile(null);
    setOrderId("");
    setAutoPayOrderId(null);
    setAmountLead("inr");
    setUsdtInput("");
    sessionStorage.removeItem(BUY_AUTO_SESSION_KEY);
  };

  if (settingsLoading || !settings) {
    return (
      <div className="flex items-center justify-center py-20 text-secondary text-sm">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  const showMainNav = step < 5;
  const step3NeedsPayOnly = step === 3 && isAutoUpi && payMethod === "upi" && !autoPayOrderId;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Buy crypto</h1>
      <p className="text-sm text-secondary mb-5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className="inline-flex items-center gap-1">
          Rate <InrPerUsdtRate inr={price} size="xs" />
        </span>
        <span>·</span>
        <span>Minimum {fmtINR(minInr)}</span>
      </p>
      <BuyFlowProgressBar step={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1] ?? ""} />

      <div
        className={cn(
          "animate-fade-up rounded-2xl",
          step === 1 ? "p-0 bg-transparent border-0 shadow-none" : "glass-strong p-5 sm:p-6"
        )}
      >
        {step === 1 && (
          <BuyFlowStepChoosePayAndToken
            payMethod={payMethod}
            setPayMethod={setPayMethod}
            network={network}
            setNetwork={setNetwork}
            buyAsset={buyAsset}
            setBuyAsset={setBuyAsset}
            fees={fees}
            price={price}
            minInr={minInr}
            onStartExchange={startExchange}
          />
        )}

        {step === 2 && (
          <StepAmountExchange
            minInr={minInr}
            inr={inr}
            setInr={setInr}
            price={price}
            network={network}
            fees={fees}
            buyAsset={buyAsset}
            usdt={usdt}
            grossUsdt={grossUsdt}
            blockchainFeeUsdt={blockchainFeeUsdt}
            amountLead={amountLead}
            setAmountLead={setAmountLead}
            usdtInput={usdtInput}
            setUsdtInput={setUsdtInput}
            displayUsdtField={displayUsdtField}
          />
        )}

        {step === 3 &&
          (autoPayOrderId ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-secondary text-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading payment confirmation…</p>
            </div>
          ) : (
            <StepWalletAndPay
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              network={network}
              buyAsset={buyAsset}
              inr={inr}
              inrRoundedForGateway={inrRoundedForGateway}
              payMethod={payMethod}
              manualUpi={manualUpi}
              bank={bank}
              buyBankImpsInstructions={buyBankImpsInstructions}
              usdt={usdt}
              primeExchBalance={auth?.user?.primeExchUsdtBalance ?? null}
              whatsappNumber={whatsappNumber}
              whatsappMessage={whatsappMessage}
              upiPayeeName={site.upiPayeeName}
              isAutoUpi={isAutoUpi}
              minInr={minInr}
              gatewayLoading={gatewayLoading}
              onStartAutoUpi={startAutoUpiGateway}
            />
          ))}

        {step === 4 && (
          <StepUtrProof
            autoPayOrderId={autoPayOrderId}
            utr={utr}
            setUtr={setUtr}
            proofFile={proofFile}
            setProofFile={setProofFile}
          />
        )}

        {step === 5 && (
          <StepStatus orderId={orderId} inr={inr} usdt={usdt} network={network} receiveLabel={receiveLabel} />
        )}

        {showMainNav && step !== 1 && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={back} className="glass border-border/60 sm:flex-1 h-11">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            {step === 2 && (
              <Button type="button" onClick={goNext} className="flex-1 gradient-primary border-0 hover-glow h-11">
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 3 && !autoPayOrderId && !step3NeedsPayOnly && (
              <Button type="button" onClick={goToProofStep} className="flex-1 gradient-primary border-0 hover-glow h-11">
                I&apos;ve paid — enter UTR <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 4 && (
              <Button type="button" onClick={submit} disabled={submitting} className="flex-1 gradient-primary border-0 hover-glow h-11">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="mt-6 flex gap-2">
            <Button type="button" variant="outline" onClick={() => nav({ to: "/app" })} className="flex-1 glass border-border/60 h-11">
              Go home
            </Button>
            <Button type="button" onClick={resetFlow} className="flex-1 gradient-primary border-0 hover-glow h-11">
              New order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepAmountExchange({
  minInr,
  inr,
  setInr,
  price,
  network,
  fees,
  buyAsset,
  usdt,
  grossUsdt,
  blockchainFeeUsdt,
  amountLead,
  setAmountLead,
  usdtInput,
  setUsdtInput,
  displayUsdtField,
}: {
  minInr: number;
  inr: number;
  setInr: (n: number) => void;
  price: number;
  network: Network;
  fees: { TRC20: number; ERC20: number; BEP20: number };
  buyAsset: BuyAsset;
  usdt: number;
  grossUsdt: number;
  blockchainFeeUsdt: number;
  amountLead: "inr" | "usdt";
  setAmountLead: (l: "inr" | "usdt") => void;
  usdtInput: string;
  setUsdtInput: (s: string) => void;
  displayUsdtField: string;
}) {
  const tokenLabel = buyAsset === "pex" ? site.coinSymbol : site.standardUsdtLabel;
  const displayNetwork = buyAsset === "pex" ? "TRC20" : network;
  const presets = Array.from(new Set([minInr, 5000, 10000, 25000].sort((a, b) => a - b)));

  const onInrChange = (raw: string) => {
    setAmountLead("inr");
    if (raw === "") {
      setInr(0);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    setInr(Math.max(0, n));
  };

  const onUsdtChange = (raw: string) => {
    setAmountLead("usdt");
    setUsdtInput(raw);
    const n = parseFloat(raw.replace(/,/g, ""));
    if (!Number.isFinite(n) || n < 0) return;
    const nextInr = estimateInrFromNetUsdt(n, price, network, fees, buyAsset);
    setInr(Math.max(0, nextInr));
  };

  const onUsdtFocus = () => {
    setAmountLead("usdt");
    setUsdtInput(usdt > 0 ? String(usdt) : "");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="buy-inr" className="text-sm text-muted-foreground">
            You pay (INR)
          </Label>
          <div className="rounded-2xl border border-border/80 bg-background/95 dark:bg-surface/90 px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg text-muted-foreground select-none">₹</span>
              <Input
                id="buy-inr"
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={inr || ""}
                onChange={(e) => onInrChange(e.target.value)}
                onFocus={() => setAmountLead("inr")}
                className="border-0 bg-transparent text-xl font-bold p-0 h-auto min-w-0 flex-1 focus-visible:ring-0 shadow-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="buy-usdt" className="text-sm text-muted-foreground">
            You receive ({tokenLabel}, net)
          </Label>
          <div className="rounded-2xl border border-border/80 bg-background/95 dark:bg-surface/90 px-4 py-3">
            <Input
              id="buy-usdt"
              type="text"
              inputMode="decimal"
              value={displayUsdtField}
              onChange={(e) => onUsdtChange(e.target.value)}
              onFocus={onUsdtFocus}
              className="border-0 bg-transparent text-xl font-bold p-0 h-auto min-w-0 focus-visible:ring-0 shadow-none font-mono"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Minimum {fmtINR(minInr)}</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setAmountLead("inr");
              setInr(p);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              inr === p
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border/80 bg-muted/30 text-secondary hover:border-primary/40"
            }`}
          >
            {fmtINR(p)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/25 dark:bg-surface/50 p-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            Gross{" "}
            {site.standardUsdtLabel === "USDT" ? <UsdtWord size="2xs" className="font-normal" /> : site.standardUsdtLabel}
          </span>
          <span className="font-medium tabular-nums">{fmtUsdtAmount(grossUsdt)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Exchange fee</span>
          <span
            className={`font-medium tabular-nums ${blockchainFeeUsdt > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
          >
            {blockchainFeeUsdt > 0 ? `−${fmtUsdtAmount(blockchainFeeUsdt)}` : fmtUsdtAmount(0)}
          </span>
        </div>
        <div className="border-t border-border/60 pt-3 flex justify-between gap-4 font-medium">
          <span className="text-foreground">You get (net)</span>
          <span className="tabular-nums text-primary inline-flex items-center gap-1">
            {fmtUsdtAmount(usdt)}{" "}
            {tokenLabel === site.standardUsdtLabel && site.standardUsdtLabel === "USDT" ? (
              <UsdtWord size="2xs" />
            ) : (
              tokenLabel
            )}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">Network: {displayNetwork}</p>
      </div>
    </div>
  );
}

function StepWalletAndPay({
  walletAddress,
  setWalletAddress,
  network,
  buyAsset,
  inr,
  inrRoundedForGateway,
  payMethod,
  manualUpi,
  bank,
  buyBankImpsInstructions,
  usdt,
  primeExchBalance,
  whatsappNumber,
  whatsappMessage,
  upiPayeeName,
  isAutoUpi,
  minInr,
  gatewayLoading,
  onStartAutoUpi,
}: {
  walletAddress: string;
  setWalletAddress: (s: string) => void;
  network: Network;
  buyAsset: BuyAsset;
  inr: number;
  inrRoundedForGateway: number;
  payMethod: PayMethod;
  manualUpi: string;
  bank: { holderName?: string; bankName?: string; accountNumber?: string; ifsc?: string };
  buyBankImpsInstructions: "normal" | "whatsapp";
  usdt: number;
  primeExchBalance: number | null;
  whatsappNumber: string;
  whatsappMessage: string;
  upiPayeeName: string;
  isAutoUpi: boolean;
  minInr: number;
  gatewayLoading: boolean;
  onStartAutoUpi: () => void;
}) {
  return (
    <div className="space-y-5">
      {buyAsset === "standard" && (
        <div className="space-y-5">
          <Field label={`Your ${network} address (${site.standardUsdtLabel})`}>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder={network === "TRC20" ? "T..." : "0x..."}
              className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 shadow-none font-mono text-sm"
            />
          </Field>
          <div className="rounded-xl bg-yellow-400/10 text-yellow-200 text-xs p-3 border border-yellow-400/20">
            Double-check address and network. Wrong addresses cannot be recovered.
          </div>
        </div>
      )}

      {buyAsset === "pex" && (
        <div className="rounded-xl bg-surface border border-border p-4 text-sm text-secondary">
          <p className="font-medium text-foreground mb-1">{site.coinName}</p>
          <p>
            Credited to your in-app TRC20 balance on {site.siteName}. No external wallet address needed.
          </p>
        </div>
      )}

      <PaymentInstructions
        payMethod={payMethod}
        inr={inr}
        inrRoundedForGateway={inrRoundedForGateway}
        manualUpi={manualUpi}
        bank={bank}
        buyBankImpsInstructions={buyBankImpsInstructions}
        walletAddress={walletAddress}
        network={network}
        buyAsset={buyAsset}
        usdt={usdt}
        primeExchBalance={primeExchBalance}
        whatsappNumber={whatsappNumber}
        whatsappMessage={whatsappMessage}
        upiPayeeName={upiPayeeName}
        isAutoUpi={isAutoUpi}
        minInr={minInr}
        gatewayLoading={gatewayLoading}
        onStartAutoUpi={onStartAutoUpi}
      />
    </div>
  );
}

function PaymentInstructions({
  payMethod,
  inr,
  inrRoundedForGateway,
  manualUpi,
  bank,
  buyBankImpsInstructions,
  walletAddress,
  network,
  buyAsset,
  usdt,
  primeExchBalance,
  whatsappNumber,
  whatsappMessage,
  upiPayeeName,
  isAutoUpi,
  minInr,
  gatewayLoading,
  onStartAutoUpi,
}: {
  payMethod: PayMethod;
  inr: number;
  inrRoundedForGateway: number;
  manualUpi: string;
  bank: { holderName?: string; bankName?: string; accountNumber?: string; ifsc?: string };
  buyBankImpsInstructions: "normal" | "whatsapp";
  walletAddress: string;
  network: Network;
  buyAsset: BuyAsset;
  usdt: number;
  primeExchBalance: number | null;
  whatsappNumber: string;
  whatsappMessage: string;
  upiPayeeName: string;
  isAutoUpi: boolean;
  minInr: number;
  gatewayLoading: boolean;
  onStartAutoUpi: () => void;
}) {
  const upiUri = `upi://pay?pa=${encodeURIComponent(manualUpi)}&pn=${encodeURIComponent(upiPayeeName)}&am=${inr}&cu=INR`;
  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    toast.success("Copied");
  };

  const accName = bank.holderName || "—";
  const accNum = bank.accountNumber || "—";
  const ifsc = bank.ifsc || "—";
  const bankName = bank.bankName || "—";

  const bankImpsWhatsappBody = buildBuyBankImpsWhatsappMessage({
    inr,
    usdt,
    network,
    buyAsset,
    walletAddress,
    primeExchBalance,
    adminNote: whatsappMessage,
  });
  const standardWalletMissing =
    buyAsset === "standard" && buyBankImpsInstructions === "whatsapp" && walletAddress.trim().length < MIN_WALLET_CHARS;
  const pexBankWhatsappExtra = buyAsset === "pex" && buyBankImpsInstructions === "whatsapp";
  const waDigits = whatsappDigitsOnly(whatsappNumber);
  const whatsappHref =
    waDigits.length >= 10 ? `https://wa.me/${waDigits}?text=${encodeURIComponent(bankImpsWhatsappBody)}` : "";

  if (payMethod === "upi" && isAutoUpi) {
    return (
      <div className="rounded-2xl bg-surface p-5 border border-border space-y-4">
        <p className="text-sm text-secondary">
          Pay online with UPI. Amount: <strong>{fmtINR(inrRoundedForGateway)}</strong>
          {Math.abs(inrRoundedForGateway - inr) > 0.01 && (
            <span className="block text-xs text-muted-foreground mt-1">Amount rounded to whole rupees for this payment.</span>
          )}
        </p>
        <Button
          type="button"
          disabled={gatewayLoading || inrRoundedForGateway < minInr}
          onClick={onStartAutoUpi}
          className="w-full h-12 gradient-primary border-0 hover-glow gap-2"
        >
          {gatewayLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Opening…
            </>
          ) : (
            <>
              Pay with UPI <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    );
  }

  if (payMethod === "upi" && !isAutoUpi) {
    return (
      <div className="rounded-2xl bg-surface p-5 border border-border space-y-3">
        <div className="grid sm:grid-cols-[auto,1fr] gap-4 items-center">
          <div className="bg-white p-3 rounded-xl mx-auto">
            <QRCodeSVG value={upiUri} size={140} />
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Amount" value={fmtINR(inr)} />
            <Row label="UPI ID" value={manualUpi || "—"} onCopy={manualUpi ? () => copy(manualUpi) : undefined} />
            <Row label="Payee" value={upiPayeeName || accName} />
          </div>
        </div>
      </div>
    );
  }

  if (payMethod === "bank" && buyBankImpsInstructions === "whatsapp") {
    return (
      <div className="rounded-2xl bg-surface p-5 border border-emerald-500/25 space-y-4 text-sm">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Bank IMPS via WhatsApp</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Open WhatsApp with your order details. After paying, continue to enter UTR and upload proof.
              {buyAsset === "standard"
                ? standardWalletMissing
                  ? ` The message includes your ${site.coinSymbol} balance and ${site.standardUsdtLabel} wallet lines.`
                  : " Your wallet address is included."
                : pexBankWhatsappExtra
                  ? ` Includes your ${site.coinSymbol} in-app balance.`
                  : ""}
            </p>
          </div>
        </div>
        {standardWalletMissing && (
          <p className="text-xs text-amber-800 dark:text-amber-200 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 leading-relaxed">
            Add your {network} address on the step above, or complete wallet lines in the WhatsApp message.
          </p>
        )}
        {pexBankWhatsappExtra && (
          <p className="text-xs text-muted-foreground rounded-lg border border-border/80 bg-muted/15 px-3 py-2 leading-relaxed">
            {site.coinName} adds to your <strong>TRC20 in-app balance</strong> on {site.siteName}.
          </p>
        )}
        {waDigits.length < 10 && (
          <p className="text-xs text-amber-700 dark:text-amber-300 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            WhatsApp number may be missing — you can still copy the message.
          </p>
        )}
        <div className="rounded-xl border border-border/80 bg-muted/20 dark:bg-surface/80 p-3 max-h-40 overflow-y-auto">
          <pre className="text-[11px] sm:text-xs font-mono whitespace-pre-wrap break-words text-foreground/90">
            {bankImpsWhatsappBody}
          </pre>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {whatsappHref ? (
            <Button
              type="button"
              className="flex-1 h-11 gradient-primary border-0 hover-glow gap-2"
              onClick={() => window.open(whatsappHref, "_blank", "noopener,noreferrer")}
            >
              <MessageCircle className="h-4 w-4" /> Open WhatsApp
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className={`glass border-border/60 h-11 ${whatsappHref ? "sm:flex-1" : "w-full"}`}
            onClick={() => {
              navigator.clipboard.writeText(bankImpsWhatsappBody);
              toast.success("Message copied");
            }}
          >
            <Copy className="h-4 w-4 mr-2" /> Copy message
          </Button>
        </div>
        <Row label="Amount (INR)" value={fmtINR(inr)} />
        {buyAsset === "pex" && (
          <Row
            label={`${site.coinSymbol} in-app balance`}
            value={
              typeof primeExchBalance === "number" && Number.isFinite(primeExchBalance)
                ? (
                    <FormattedUsdt value={primeExchBalance} size="xs" />
                  )
                : "Check in app"
            }
          />
        )}
      </div>
    );
  }

  if (payMethod === "bank" && buyBankImpsInstructions === "normal") {
    return (
      <div className="rounded-2xl bg-surface p-5 border border-border space-y-2 text-sm">
        <p className="text-xs text-muted-foreground mb-2">Transfer the exact amount using IMPS / NEFT. Then continue to enter UTR.</p>
        {buyAsset === "pex" && (
          <div className="rounded-xl border border-primary/25 bg-primary/[0.06] dark:bg-primary/15 px-3 py-2.5 mb-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">
              {site.coinSymbol} — in-app TRC20 wallet
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              No external address. {site.coinSymbol} is added to your balance on {site.siteName} after verification.
            </p>
            <Row
              label="Current in-app balance"
              value={
                typeof primeExchBalance === "number" && Number.isFinite(primeExchBalance)
                  ? (
                      <FormattedUsdt value={primeExchBalance} size="xs" />
                    )
                  : "—"
              }
            />
          </div>
        )}
        <Row label="Account name" value={accName} />
        <Row label="Account number" value={accNum} onCopy={accNum !== "—" ? () => copy(accNum) : undefined} />
        <Row label="IFSC" value={ifsc} onCopy={ifsc !== "—" ? () => copy(ifsc) : undefined} />
        <Row label="Bank" value={bankName} />
        <Row label="Amount" value={fmtINR(inr)} />
      </div>
    );
  }

  return null;
}

function StepUtrProof({
  autoPayOrderId,
  utr,
  setUtr,
  proofFile,
  setProofFile,
}: {
  autoPayOrderId: string | null;
  utr: string;
  setUtr: (s: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-5">
      {autoPayOrderId && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-secondary">
          <p className="font-medium text-foreground mb-1">Payment completed</p>
          <p>
            Reference <span className="font-mono text-xs">{autoPayOrderId}</span> — enter UTR from your app and attach a screenshot.
          </p>
        </div>
      )}
      <Field label="UTR / Reference number">
        <Input
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          placeholder="UTR or bank reference"
          className="border-0 bg-transparent h-12 px-4 focus-visible:ring-0 shadow-none"
        />
      </Field>
      <ProofUploadPreview file={proofFile} onFileChange={setProofFile} inputRef={fileRef} label="Payment screenshot" />
    </div>
  );
}

function StepStatus({
  orderId,
  inr,
  usdt,
  network,
  receiveLabel,
}: {
  orderId: string;
  inr: number;
  usdt: number;
  network: Network;
  receiveLabel: ReactNode;
}) {
  return (
    <div className="text-center py-2">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/25 dark:bg-emerald-500/20 dark:ring-emerald-400/30">
        <CheckCircle2 className="h-11 w-11 text-emerald-600 dark:text-emerald-400" strokeWidth={2.25} />
      </div>
      <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">Success</h2>
      <p className="text-secondary text-sm mt-2 max-w-md mx-auto">
        Your order is submitted. We&apos;re verifying your payment — you&apos;ll receive {receiveLabel} after confirmation.
      </p>
      <div className="mt-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/40 p-4 sm:p-5 text-sm space-y-2 text-left border border-emerald-500/20">
        <Row label="Order ID" value={orderId || "—"} />
        <Row label="Amount paid" value={fmtINR(inr)} />
        <Row label="You receive (est.)" value={<FormattedUsdt value={usdt} />} />
        <Row label="Token" value={receiveLabel} />
        <Row label="Network" value={network} />
        <Row label="Status" value={<span className="text-amber-700 dark:text-amber-300 font-medium">Pending verification</span>} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-secondary uppercase tracking-wide">{label}</Label>
      <div className="rounded-xl bg-surface border border-border ring-focus">{children}</div>
    </div>
  );
}

function Row({ label, value, onCopy }: { label: string; value: React.ReactNode; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium truncate text-right">{value}</span>
        {onCopy && (
          <button type="button" onClick={onCopy} className="p-1 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-foreground transition">
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
