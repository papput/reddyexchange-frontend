import { ArrowRight } from "lucide-react";
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
import { FeeUsdtLabel, UsdtMark, UsdtNetworkTitle, UsdtWord } from "@/components/app/UsdtMark";
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
  const sendTag = payMethod === "upi" ? "UPI" : "IMPS";

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
  const assetIcon = (key: GridKey, className?: string) => {
    const c = cn("h-9 w-9 shrink-0", className);
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

  const payIconSlot = (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-1.5",
        "border border-cyan-500/25 bg-background/80 shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)]"
      )}
    >
      {payMethod === "upi" ? (
        <UpiMark className="h-full w-full max-h-10 max-w-10 object-contain" />
      ) : (
        <BankImpsMark className="h-full w-full max-h-10 max-w-10 object-contain" />
      )}
    </div>
  );

  const receiveIconSlot = (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-1.5",
        "border border-fuchsia-500/25 bg-background/80 shadow-[0_0_20px_-4px_rgba(217,70,239,0.3)]"
      )}
    >
      {assetKey === "PEX" ? (
        <IconPex className="h-full w-full max-h-10 max-w-10 object-contain" />
      ) : (
        <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center bg-muted/15 rounded-lg p-0.5">
          {assetIcon(assetKey, "h-full w-full max-h-9 max-w-9 object-contain")}
        </div>
      )}
    </div>
  );

  const selectTriggerSend = cn(
    "w-full min-h-[2.75rem] h-11 rounded-xl px-3.5 text-left text-sm font-semibold tracking-tight",
    "border border-cyan-500/20 bg-background/70 backdrop-blur-sm",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
    "hover:border-cyan-500/35 hover:bg-background/85",
    "focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500/40",
    "data-[state=open]:border-cyan-500/45 data-[state=open]:shadow-[0_0_24px_-8px_rgba(34,211,238,0.45)]",
    "transition-all pr-10"
  );

  const selectTriggerReceive = cn(
    "w-full min-h-[2.75rem] h-11 rounded-xl px-3.5 text-left text-sm font-semibold tracking-tight",
    "border border-fuchsia-500/20 bg-background/70 backdrop-blur-sm",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
    "hover:border-fuchsia-500/35 hover:bg-background/85",
    "focus:ring-2 focus:ring-fuchsia-500/25 focus:border-fuchsia-500/40",
    "data-[state=open]:border-fuchsia-500/45 data-[state=open]:shadow-[0_0_24px_-8px_rgba(217,70,239,0.4)]",
    "transition-all pr-10"
  );

  const selectContentPanel = cn(
    "rounded-xl border border-border/60 bg-popover/95 backdrop-blur-md p-1.5 shadow-xl shadow-black/40 z-[200]",
    "min-w-[var(--radix-select-trigger-width)] w-[min(calc(100vw-1.25rem),24rem)] max-w-[24rem] max-h-[min(70vh,28rem)]"
  );

  const selectItemRow = cn(
    "rounded-lg py-2.5 px-2.5 my-0.5 cursor-pointer border border-transparent",
    "items-center text-left [&>span]:w-full",
    "data-[highlighted]:bg-muted/90 data-[highlighted]:text-foreground",
    "data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary/25",
    "pl-2.5 pr-9 min-h-[3.25rem]"
  );

  return (
    <div className="rounded-2xl p-px bg-gradient-to-br from-cyan-500/45 via-primary/35 to-fuchsia-500/45 shadow-lg shadow-cyan-950/20">
      <div className="rounded-[15px] bg-card/92 border border-white/[0.06] backdrop-blur-md">
        <div
          className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
          aria-hidden
        />
        <div className="p-4 sm:p-5 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">You send</h3>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1",
                  "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-100",
                  "border border-cyan-400/30 shadow-[0_0_12px_-4px_rgba(34,211,238,0.5)]"
                )}
              >
                From
              </span>
            </div>
            <div className="flex items-center gap-3">
              {payIconSlot}
              <div className="min-w-0 flex-1">
                <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PayMethod)}>
                  <SelectTrigger className={selectTriggerSend}>
                    <SelectValue>{payTitle}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} className={selectContentPanel}>
                    <SelectItem value="upi" textValue="UPI" className={selectItemRow}>
                      <div className="flex w-full items-center gap-3">
                        <UpiMark className="h-10 w-10 shrink-0 object-contain" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-foreground">UPI</div>
                          <div className="text-[11px] text-muted-foreground">QR or link · no method fee</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank" textValue="Bank IMPS" className={selectItemRow}>
                      <div className="flex w-full items-center gap-3">
                        <BankImpsMark className="h-10 w-10 shrink-0 object-contain" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-foreground">Bank IMPS</div>
                          <div className="text-[11px] text-muted-foreground">IMPS / NEFT · no method fee</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between gap-2 text-[10px] text-muted-foreground/85 tabular-nums px-0.5">
              <span>
                Min {fmtLim(minInr)} {sendTag}
              </span>
              <span>
                Max {fmtLim(DISPLAY_MAX_INR)} {sendTag}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold tabular-nums",
                "bg-muted/25 text-foreground/90 border border-cyan-500/20",
                "shadow-[0_0_16px_-6px_rgba(34,211,238,0.35)]"
              )}
            >
              <span className="inline-flex items-center gap-1">
                1 <UsdtWord size="xs" />
              </span>{" "}
              = ₹{price.toFixed(2)} INR
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">You receive</h3>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1",
                  "bg-fuchsia-500/15 text-fuchsia-100 border border-fuchsia-400/35",
                  "shadow-[0_0_12px_-4px_rgba(217,70,239,0.45)]"
                )}
              >
                To
              </span>
            </div>
            <div className="flex items-center gap-3">
              {receiveIconSlot}
              <div className="min-w-0 flex-1">
                <Select value={assetKey} onValueChange={(v) => pickAsset(v as GridKey)}>
                  <SelectTrigger className={selectTriggerReceive}>
                    <SelectValue>
                      {buyAsset === "pex" ? (
                        site.coinName
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <UsdtMark size="sm" />
                          <span>
                            USDT ({network})
                          </span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} className={selectContentPanel}>
                    <SelectItem value="TRC20" textValue="USDT (TRC20)" className={selectItemRow}>
                      <div className="flex w-full items-center gap-3">
                        <IconTron className="h-9 w-9 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <UsdtNetworkTitle network="TRC20" />
                          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1 flex-wrap">
                            <FeeUsdtLabel fee={fees.TRC20} /> · ₹{price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="ERC20" textValue="USDT (ERC20)" className={selectItemRow}>
                      <div className="flex w-full items-center gap-3">
                        <IconEth className="h-9 w-9 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <UsdtNetworkTitle network="ERC20" />
                          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1 flex-wrap">
                            <FeeUsdtLabel fee={fees.ERC20} /> · ₹{price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="BEP20" textValue="USDT (BEP20)" className={selectItemRow}>
                      <div className="flex w-full items-center gap-3">
                        <IconBsc className="h-9 w-9 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <UsdtNetworkTitle network="BEP20" />
                          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1 flex-wrap">
                            <FeeUsdtLabel fee={fees.BEP20} /> · ₹{price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="PEX" textValue={site.coinName} className={selectItemRow}>
                      <div className="flex w-full items-center gap-3">
                        <IconPex className="h-9 w-9 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-foreground">{site.coinName}</div>
                          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1 flex-wrap">
                            <FeeUsdtLabel fee={0} /> · in-app · ₹{price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between gap-2 text-[10px] text-muted-foreground/85 tabular-nums px-0.5">
              <span className="inline-flex items-center gap-1 flex-wrap">
                Est. min {fmtLim(minNetUsdt)}{" "}
                {buyAsset === "pex" ? (
                  site.coinSymbol
                ) : (
                  <>
                    <UsdtMark size="2xs" />
                    <span>USDT ({network})</span>
                  </>
                )}
              </span>
              <span className="inline-flex items-center gap-1 flex-wrap">
                Est. max {fmtLim(maxNetUsdt)}{" "}
                {buyAsset === "pex" ? (
                  site.coinSymbol
                ) : (
                  <>
                    <UsdtMark size="2xs" />
                    <span>USDT ({network})</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={onStartExchange}
            className={cn(
              "w-full h-12 rounded-full font-semibold text-sm border-0",
              "bg-gradient-to-r from-cyan-500 via-primary to-violet-600 text-white",
              "shadow-[0_0_28px_-6px_rgba(34,211,238,0.55),0_0_24px_-8px_rgba(139,92,246,0.45)]",
              "hover:brightness-110 hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.6)] transition-all"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowRight className="h-4 w-4 opacity-90" />
              Start exchange
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
