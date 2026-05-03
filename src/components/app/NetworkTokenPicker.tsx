import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import type { Network } from "@/lib/store";
import { FeeUsdtLabel, PerUsdt, UsdtWord } from "@/components/app/UsdtMark";
import trcSvg from "@/assets/networks/trc.svg";
import ercSvg from "@/assets/networks/erc.svg";
import bepSvg from "@/assets/networks/bep.svg";
import pexLogo from "@/assets/brand/reddy-exchange-logo.png";

type BuyAsset = "standard" | "pex";

export type GridKey = "TRC20" | "ERC20" | "BEP20" | "PEX";

export function formatFeeUsdt(f: number): string {
  if (f === 0) return "No exchange fee";
  const n = Number(f.toFixed(4));
  const s = n % 1 === 0 ? String(n) : String(n).replace(/\.?0+$/, "");
  return `${s} USDT exchange fee`;
}

function chainImg(src: string, className?: string) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

/** TRC20 / Tron — asset from swift-usdt `frontend/src/assets/networks/trc.svg`. */
export function IconTron({ className }: { className?: string }) {
  return chainImg(trcSvg, className);
}

/** ERC20 / Ethereum — asset from swift-usdt `frontend/src/assets/networks/erc.svg`. */
export function IconEth({ className }: { className?: string }) {
  return chainImg(ercSvg, className);
}

/** BEP20 / BNB Chain — asset from swift-usdt `frontend/src/assets/networks/bep.svg`. */
export function IconBsc({ className }: { className?: string }) {
  return chainImg(bepSvg, className);
}

/** Reddy Exch USDT (in-app / PEX) — same mark as site brand. */
export function IconPex({ className }: { className?: string }) {
  return (
    <img
      src={pexLogo}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("shrink-0 object-contain", className)}
      width={128}
      height={128}
    />
  );
}

export function selectedGridKey(network: Network, buyAsset: BuyAsset): GridKey {
  if (buyAsset === "pex") return "PEX";
  return network;
}

type Props = {
  network: Network;
  buyAsset: BuyAsset;
  setNetwork: (n: Network) => void;
  setBuyAsset: (a: BuyAsset) => void;
  fees: { TRC20: number; ERC20: number; BEP20: number };
};

export function NetworkTokenPicker({ network, buyAsset, setNetwork, setBuyAsset, fees }: Props) {
  const active = selectedGridKey(network, buyAsset);

  const pick = (key: GridKey) => {
    if (key === "PEX") {
      setBuyAsset("pex");
      setNetwork("TRC20");
      return;
    }
    setBuyAsset("standard");
    setNetwork(key);
  };

  const cards: {
    key: GridKey;
    title: ReactNode;
    fee: number;
    icon: ReactNode;
    zeroFeeGreen?: boolean;
  }[] = [
    {
      key: "TRC20",
      title: (
        <span className="inline-flex items-center gap-1">
          TRC20 <UsdtWord size="xs" />
        </span>
      ),
      fee: fees.TRC20,
      icon: <IconTron className="h-10 w-10" />,
    },
    {
      key: "ERC20",
      title: (
        <span className="inline-flex items-center gap-1">
          ERC20 <UsdtWord size="xs" />
        </span>
      ),
      fee: fees.ERC20,
      icon: <IconEth className="h-10 w-10" />,
    },
    {
      key: "BEP20",
      title: (
        <span className="inline-flex items-center gap-1">
          BEP20 <UsdtWord size="xs" />
        </span>
      ),
      fee: fees.BEP20,
      icon: <IconBsc className="h-10 w-10" />,
    },
    {
      key: "PEX",
      title: (
        <span className="inline-flex items-center gap-1 flex-wrap">
          Reddy Exchange <UsdtWord size="xs" />
        </span>
      ),
      fee: 0,
      icon: <IconPex className="h-10 w-10" />,
      zeroFeeGreen: true,
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Choose network for{" "}
        {site.standardUsdtLabel === "USDT" ? <UsdtWord size="2xs" /> : site.standardUsdtLabel} or {site.coinSymbol}{" "}
        (in-app, no chain fee) — credited after verification.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {cards.map(({ key, title, fee, icon, zeroFeeGreen }) => {
          const isOn = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => pick(key)}
              className={cn(
                "rounded-2xl border-2 p-4 sm:p-5 text-left transition-all duration-200",
                "bg-surface/80 hover:bg-surface",
                isOn
                  ? "border-primary bg-primary/10 ring-2 ring-primary/35 ring-offset-2 ring-offset-background"
                  : "border-border/70 hover:border-primary/35"
              )}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl p-0.5">{icon}</div>
              <div className="text-base font-bold tracking-tight text-foreground">{title}</div>
              <div
                className={cn(
                  "mt-1 text-sm font-medium",
                  zeroFeeGreen
                    ? "text-emerald-600 dark:text-emerald-400"
                    : fee > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground"
                )}
              >
                <FeeUsdtLabel fee={fee} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Four stacked rows: compact height, rate on the right (mobile-friendly). */
export function BuyAssetRowList({
  network,
  buyAsset,
  setNetwork,
  setBuyAsset,
  fees,
  inrPerUsdt,
}: Props & { inrPerUsdt: number }) {
  const active = selectedGridKey(network, buyAsset);

  const pick = (key: GridKey) => {
    if (key === "PEX") {
      setBuyAsset("pex");
      setNetwork("TRC20");
      return;
    }
    setBuyAsset("standard");
    setNetwork(key);
  };

  const rows: {
    key: GridKey;
    title: ReactNode;
    subtitle: ReactNode;
    icon: ReactNode;
  }[] = [
    {
      key: "TRC20",
      title: (
        <span className="inline-flex items-center gap-1">
          TRC20 <UsdtWord size="xs" />
        </span>
      ),
      subtitle: <FeeUsdtLabel fee={fees.TRC20} />,
      icon: <IconTron className="h-8 w-8 shrink-0" />,
    },
    {
      key: "ERC20",
      title: (
        <span className="inline-flex items-center gap-1">
          ERC20 <UsdtWord size="xs" />
        </span>
      ),
      subtitle: <FeeUsdtLabel fee={fees.ERC20} />,
      icon: <IconEth className="h-8 w-8 shrink-0" />,
    },
    {
      key: "BEP20",
      title: (
        <span className="inline-flex items-center gap-1">
          BEP20 <UsdtWord size="xs" />
        </span>
      ),
      subtitle: <FeeUsdtLabel fee={fees.BEP20} />,
      icon: <IconBsc className="h-8 w-8 shrink-0" />,
    },
    {
      key: "PEX",
      title: site.coinName,
      subtitle: <FeeUsdtLabel fee={0} />,
      icon: <IconPex className="h-8 w-8 shrink-0" />,
    },
  ];

  const rateTxt = `₹${inrPerUsdt.toFixed(2)}`;

  return (
    <div className="space-y-2">
      {rows.map(({ key, title, subtitle, icon }) => {
        const on = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => pick(key)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 min-h-[3.25rem] text-left transition-all",
              "bg-surface/80 hover:bg-surface",
              on
                ? "border-primary bg-primary/10 ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
                : "border-border/70 hover:border-primary/35"
            )}
          >
            {icon}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground leading-tight truncate">{title}</div>
              <div
                className={cn(
                  "text-[11px] mt-0.5 font-medium",
                  key === "PEX" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}
              >
                {subtitle}
              </div>
            </div>
            <div className="shrink-0 text-right pl-2">
              <div className="text-xs font-semibold tabular-nums text-foreground">{rateTxt}</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                <PerUsdt size="2xs" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
