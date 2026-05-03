import siteJson from "./site.json";

export type SiteConfig = {
  siteName: string;
  coinName: string;
  coinSymbol: string;
  standardUsdtLabel: string;
  supportEmail: string;
  upiPayeeName: string;
};

export const site = siteJson as SiteConfig;
