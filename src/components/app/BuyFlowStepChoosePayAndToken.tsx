import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { estimateBuyUsdt } from "@/lib/store";
import type { Network, PayMethod } from "@/lib/store";
import { site } from "@/config/site";
import {
  IconBsc,
  IconEth,
  IconPex,
  IconTron,
  selectedGridKey,
  type GridKey,
} from "@/components/app/NetworkTokenPicker";
import { BankImpsMark, UpiMark } from "@/components/app/ExchangeMark";
import { FeeCompact, UsdtMark, UsdtNetworkTitle, UsdtWord } from "@/components/app/UsdtMark";
import { cn } from "@/lib/utils";

export type BuyAsset = "standard" | "pex";

/** Shown as upper “You Send” limit (typical UPI ceiling; adjust if you add a server max). */
const DISPLAY_MAX_INR = 900_000;

export type BuyFlowStepChoosePayAndTokenProps = {
  payMethod: PayMethod;
  setPayMethod: (p: PayMethod) => void;
  network: Network;
  setNetwork: (n: Network) => void;
  buyAsset: BuyAsset;
  setBuyAsset: (a: BuyAsset) => void;
  fees: { TRC20: number; ERC20: number; BEP20: number };
  price: number;
  minInr: number;
  onStartExchange: () => void;
};

/** Lightweight inset border — shared across exchange card panels */
const liteBorder = "border border-white/[0.1]";
const insetPanel = cn(
  liteBorder,
  "rounded-xl bg-surface-2/75 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]",
);

function SectionBadge({ children, tone }: { children: ReactNode; tone: "from" | "to" }) {
  return (
    <span
      className={cn(
        "text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md px-2 py-1 sm:px-2.5 sm:py-1 shrink-0",
        liteBorder,
        tone === "from"
          ? "bg-primary/30 text-white border-primary/45 shadow-[0_0_14px_-6px_rgba(108,76,255,0.5)]"
          : "bg-accent/20 text-accent border-accent/45 shadow-[0_0_14px_-6px_rgba(0,212,255,0.4)]",
      )}
    >
      {children}
    </span>
  );
}

function ExchangeSection({
  title,
  badge,
  icon,
  children,
  limits,
}: {
  title: string;
  badge: ReactNode;
  icon: ReactNode;
  children: ReactNode;
  limits: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3.5 sm:p-5 space-y-2.5 sm:space-y-3",
        liteBorder,
        "bg-surface-2/55 border-primary/15",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
      )}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight shrink-0">{title}</h3>
        {badge}
      </div>
      <div className={cn(insetPanel, "p-2.5 sm:p-3")}>
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="shrink-0">{icon}</div>
          <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
      <div className={cn(insetPanel, "p-2 sm:px-3 sm:py-2.5 min-w-0 w-full")}>{limits}</div>
    </div>
  );
}

function LimitRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-2 text-xs sm:text-sm text-secondary tabular-nums leading-snug">
      <span className="truncate min-w-0">{left}</span>
      <span className="truncate min-w-0 text-right">{right}</span>
    </div>
  );
}

function SelectOptionRow({
  icon,
  title,
  subtitle,
  aside,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-3 min-w-0">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 text-base font-semibold text-foreground leading-tight">{title}</div>
          <div className="shrink-0 text-xs sm:text-sm text-muted-foreground text-right leading-snug max-w-[52%] [&_span]:justify-end">
            {aside}
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</div>
      </div>
    </div>
  );
}

export function BuyFlowStepChoosePayAndToken({
  payMethod,
  setPayMethod,
  network,
  setNetwork,
  buyAsset,
  setBuyAsset,
  fees,
  price,
  minInr,
  onStartExchange,
}: BuyFlowStepChoosePayAndTokenProps) {
  const fmtLim = (n: number) => n.toLocaleString("en-IN");

  const pickAsset = (key: GridKey) => {
    if (key === "PEX") {
      setBuyAsset("pex");
      setNetwork("TRC20");
      return;
    }
    setBuyAsset("standard");
    setNetwork(key);
  };

  const assetKey = selectedGridKey(network, buyAsset);
  const minNetUsdt = estimateBuyUsdt(minInr, price, network, fees, buyAsset);
  const maxNetUsdt = estimateBuyUsdt(DISPLAY_MAX_INR, price, network, fees, buyAsset);
  const sendTag = payMethod === "upi" ? "UPI" : "IMPS";

  const assetIcon = (key: GridKey, className?: string) => {
    const c = cn("h-11 w-11 sm:h-12 sm:w-12 shrink-0", className);
    switch (key) {
      case "TRC20":
        return <IconTron className={c} />;
      case "ERC20":
        return <IconEth className={c} />;
      case "BEP20":
        return <IconBsc className={c} />;
      default:
        return <IconPex className={c} />;
    }
  };

  const payTitle = payMethod === "upi" ? "UPI" : "Bank IMPS";

  const payIcon = (
    <div
      className={cn(
        "flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full p-1.5 sm:p-2",
        liteBorder,
        "border-accent/40 bg-surface/90 shadow-[0_0_20px_-6px_rgba(0,212,255,0.45)]",
      )}
    >
      {payMethod === "upi" ? (
        <UpiMark className="h-full w-full object-contain" />
      ) : (
        <BankImpsMark className="h-full w-full object-contain" />
      )}
    </div>
  );

  const receiveIcon = (
    <div
      className={cn(
        "flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full p-1.5 sm:p-2",
        liteBorder,
        "border-primary/40 bg-surface/90 shadow-[0_0_20px_-6px_rgba(108,76,255,0.45)]",
      )}
    >
      {assetKey === "PEX" ? (
        <IconPex className="h-full w-full object-contain" />
      ) : (
        assetIcon(assetKey, "h-full w-full max-h-11 max-w-11 object-contain")
      )}
    </div>
  );

  const selectTrigger = cn(
    "w-full max-w-full min-w-0 min-h-[3.25rem] h-[3.25rem] sm:min-h-14 sm:h-14",
    "rounded-full px-4 sm:px-5 text-left text-sm sm:text-base font-semibold",
    "border border-primary/40 bg-surface-2/85 text-foreground",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_16px_-8px_rgba(108,76,255,0.2)]",
    "hover:border-primary/55 hover:bg-surface-2/95",
    "focus:ring-2 focus:ring-primary/35 focus:border-primary/60",
    "data-[state=open]:border-primary/60 data-[state=open]:bg-surface-2/95",
    "transition-all pr-10 sm:pr-11 overflow-hidden",
    "[&>span:first-child]:min-w-0 [&>span:first-child]:flex-1 [&>span:first-child]:truncate",
  );

  const selectContentPanel = cn(
    "rounded-xl p-1.5 shadow-xl shadow-black/50 z-[200]",
    liteBorder,
    "bg-popover/98 backdrop-blur-md",
    "min-w-[var(--radix-select-trigger-width)] w-[min(calc(100vw-1.25rem),24rem)] max-w-[24rem] max-h-[min(70vh,28rem)]",
  );

  const selectItemRow = cn(
    "rounded-lg py-2.5 px-2.5 my-0.5 cursor-pointer",
    liteBorder,
    "border-transparent",
    "items-center text-left [&>span]:w-full",
    "data-[highlighted]:bg-muted/90 data-[highlighted]:text-foreground data-[highlighted]:border-border/40",
    "data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary/25",
    "pl-2.5 pr-9 min-h-[3.5rem]",
  );


  const receiveLabel =
    buyAsset === "pex" ? (
      <span className="truncate">{site.coinName}</span>
    ) : (
      <span className="inline-flex items-center gap-1 min-w-0 truncate">
        <UsdtMark size="xs" className="shrink-0" />
        <span className="truncate">USDT ({network})</span>
      </span>
    );

  return (
    <div
      className={cn(
        "card-glow-frame w-full max-w-full min-w-0 mb-2 sm:mb-3",
        "rounded-[1.25rem] sm:rounded-[1.35rem] p-[1px]",
        "bg-gradient-to-br from-primary/65 via-accent/40 to-primary/55",
        "shadow-[0_0_48px_-6px_rgba(108,76,255,0.55),0_0_40px_-10px_rgba(0,212,255,0.35)]",
      )}
    >
      <div
        className={cn(
          "card-glow-surface rounded-[1.2rem] sm:rounded-[1.3rem]",
          liteBorder,
          "border-white/[0.12] bg-surface-2/90 backdrop-blur-md",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]",
        )}
      >
        <div className="p-3.5 sm:p-6 pb-5 sm:pb-7 space-y-3 sm:space-y-5">
          <ExchangeSection
            title="You Send"
            badge={<SectionBadge tone="from">From</SectionBadge>}
            icon={payIcon}
            limits={
              <LimitRow
                left={`${fmtLim(minInr)} ${sendTag}`}
                right={`${fmtLim(DISPLAY_MAX_INR)} ${sendTag}`}
              />
            }
          >
            <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PayMethod)}>
              <SelectTrigger className={selectTrigger}>
                <SelectValue>{payTitle}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} className={selectContentPanel}>
                <SelectItem value="upi" textValue="UPI" className={selectItemRow}>
                  <SelectOptionRow
                    icon={<UpiMark className="h-10 w-10 shrink-0 object-contain" />}
                    title="UPI"
                    subtitle="QR or link"
                    aside="no method fee"
                  />
                </SelectItem>
                <SelectItem value="bank" textValue="Bank IMPS" className={selectItemRow}>
                  <SelectOptionRow
                    icon={<BankImpsMark className="h-10 w-10 shrink-0 object-contain" />}
                    title="Bank IMPS"
                    subtitle="IMPS / NEFT"
                    aside="no method fee"
                  />
                </SelectItem>
              </SelectContent>
            </Select>
          </ExchangeSection>

          <div className="flex justify-center relative z-10">
            <div
              className={cn(
                "px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-sm sm:text-base font-bold tabular-nums max-w-full truncate",
                insetPanel,
                "bg-surface/90 text-foreground border-primary/25",
                "shadow-[0_0_20px_-8px_rgba(108,76,255,0.35),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
              )}
            >
              <span className="inline-flex items-center gap-1">
                1 <UsdtWord size="xs" />
              </span>{" "}
              = ₹{price.toFixed(0)} INR
            </div>
          </div>

          <ExchangeSection
            title="You Receive"
            badge={<SectionBadge tone="to">To</SectionBadge>}
            icon={receiveIcon}
            limits={
              <div className="space-y-0.5 min-w-0">
                <LimitRow left={fmtLim(minNetUsdt)} right={fmtLim(maxNetUsdt)} />
                <p className="text-xs sm:text-sm text-secondary truncate">
                  {buyAsset === "pex" ? site.coinName : `USDT (${network})`}
                </p>
              </div>
            }
          >
            <Select value={assetKey} onValueChange={(v) => pickAsset(v as GridKey)}>
              <SelectTrigger className={selectTrigger}>
                <SelectValue>{receiveLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} className={selectContentPanel}>
                <SelectItem value="TRC20" textValue="USDT (TRC20)" className={selectItemRow}>
                  <SelectOptionRow
                    icon={<IconTron className="h-9 w-9 shrink-0" />}
                    title={<UsdtNetworkTitle network="TRC20" className="text-base" />}
                    subtitle={`₹${price.toFixed(2)}`}
                    aside={<FeeCompact fee={fees.TRC20} />}
                  />
                </SelectItem>
                <SelectItem value="ERC20" textValue="USDT (ERC20)" className={selectItemRow}>
                  <SelectOptionRow
                    icon={<IconEth className="h-9 w-9 shrink-0" />}
                    title={<UsdtNetworkTitle network="ERC20" className="text-base" />}
                    subtitle={`₹${price.toFixed(2)}`}
                    aside={<FeeCompact fee={fees.ERC20} />}
                  />
                </SelectItem>
                <SelectItem value="BEP20" textValue="USDT (BEP20)" className={selectItemRow}>
                  <SelectOptionRow
                    icon={<IconBsc className="h-9 w-9 shrink-0" />}
                    title={<UsdtNetworkTitle network="BEP20" className="text-base" />}
                    subtitle={`₹${price.toFixed(2)}`}
                    aside={<FeeCompact fee={fees.BEP20} />}
                  />
                </SelectItem>
                <SelectItem value="PEX" textValue={site.coinName} className={selectItemRow}>
                  <SelectOptionRow
                    icon={<IconPex className="h-9 w-9 shrink-0" />}
                    title={site.coinName}
                    subtitle={`in-app · ₹${price.toFixed(2)}`}
                    aside={<FeeCompact fee={0} />}
                  />
                </SelectItem>
              </SelectContent>
            </Select>
          </ExchangeSection>

          <div className="cta-shadow-zone">
            <Button
              type="button"
              onClick={onStartExchange}
              className={cn(
                "w-full h-11 sm:h-12 rounded-xl font-bold text-base border-0",
                "gradient-primary text-primary-foreground hover-glow",
                "active:scale-[0.99] transition-all",
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                Start Exchange
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
