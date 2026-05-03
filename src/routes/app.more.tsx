import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  FileText,
  HelpCircle,
  Shield,
  ScrollText,
  RefreshCcw,
  Mail,
  Receipt,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { site } from "@/config/site";
import { UsdtWord } from "@/components/app/UsdtMark";
import type { ReactNode } from "react";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl, defaultWhatsAppMessage } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";

export const Route = createFileRoute("/app/more")({
  head: () => ({ meta: [{ title: `More — ${site.siteName}` }] }),
  component: MorePage,
});

function MorePage() {
  const { data: settings } = usePublicSettings();
  const wa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    defaultWhatsAppMessage(settings)
  );

  const items: { icon: LucideIcon; label: ReactNode; to: string }[] = [
    {
      icon: Wallet,
      label: (
        <span className="inline-flex items-center gap-1">
          Withdraw <UsdtWord size="xs" />
        </span>
      ),
      to: "/app/withdraw",
    },
    { icon: Receipt, label: "Transactions", to: "/app/transactions" },
    { icon: HelpCircle, label: "Help & Support", to: "/contact" },
    { icon: Mail, label: "Contact us", to: "/contact" },
    { icon: Shield, label: "Privacy Policy", to: "/privacy" },
    { icon: ScrollText, label: "Terms of Service", to: "/terms" },
    { icon: RefreshCcw, label: "Refund Policy", to: "/refund" },
    { icon: FileText, label: `About ${site.siteName}`, to: "/about" },
  ];

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight mb-4">More</h1>
      <div className="glass rounded-2xl divide-y divide-border/60 overflow-hidden">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-surface/60 transition"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 grid place-items-center">
              <img src={whatsappIcon} alt="" className="h-5 w-5" width={20} height={20} />
            </div>
            <span className="flex-1 text-sm font-medium">WhatsApp support</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        ) : null}
        {items.map((it) => (
          <Link key={it.to} to={it.to} className="flex items-center gap-3 p-4 hover:bg-surface/60 transition">
            <div className="h-9 w-9 rounded-xl bg-surface grid place-items-center">
              <it.icon className="h-4 w-4 text-accent" />
            </div>
            <span className="flex-1 text-sm font-medium">{it.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground pt-6">{site.siteName} · v1.0.0</div>
    </div>
  );
}
