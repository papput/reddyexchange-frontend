import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, CreditCard, HelpCircle, Send } from "lucide-react";
import type { PublicSettingsData } from "@/lib/api";
import { site } from "@/config/site";
import {
  defaultTelegramMessage,
  defaultWhatsAppMessage,
  getSupportChannels,
  mailtoSupport,
} from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";
import telegramIcon from "@/assets/telegram.png";
import { BankImpsMark, UpiMark } from "@/components/app/ExchangeMark";

type Props = {
  settings?: PublicSettingsData;
  /** Show UPI / bank from settings (admin). */
  showPaymentChannels?: boolean;
  /** Set false on /contact to hide “Contact page” card. */
  includeContactPageLink?: boolean;
};

export function ContactChannels({
  settings,
  showPaymentChannels = true,
  includeContactPageLink = true,
}: Props) {
  const channels = getSupportChannels(settings);
  const waPreset = defaultWhatsAppMessage(settings);
  const tgPreset = defaultTelegramMessage(settings);
  const upi = settings?.manualUpiId?.trim();
  const bank = settings?.bankDetails;

  const cards: {
    key: string;
    label: string;
    description?: string;
    node: ReactNode;
  }[] = [
    {
      key: "email",
      label: "Email",
      description: "We reply on business days",
      node: (
        <a
          href={mailtoSupport(`Question for ${site.siteName}`)}
          className="font-medium text-accent hover:underline break-all"
        >
          {site.supportEmail}
        </a>
      ),
    },
  ];

  if (channels.whatsappUrl) {
    cards.push({
      key: "whatsapp",
      label: "WhatsApp",
      description: "Fastest way to reach us",
      node: (
        <a
          href={channels.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
        >
          <img src={whatsappIcon} alt="" className="h-5 w-5 shrink-0" width={20} height={20} />
          Chat now
        </a>
      ),
    });
  }

  if (channels.telegramUrl) {
    cards.push({
      key: "telegram",
      label: "Telegram",
      description: "Message us on Telegram",
      node: (
        <a
          href={channels.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
        >
          <img
            src={telegramIcon}
            alt=""
            className="h-5 w-5 shrink-0 rounded-full object-cover"
            width={20}
            height={20}
          />
          Chat now
        </a>
      ),
    });
  }

  if (channels.telHref) {
    cards.push({
      key: "phone",
      label: "Phone / call",
      node: (
        <a href={channels.telHref} className="font-medium text-accent hover:underline">
          {settings?.whatsappNumber?.trim() || channels.telHref.replace(/^tel:/, "")}
        </a>
      ),
    });
  }

  if (includeContactPageLink) {
    cards.push({
      key: "contact-page",
      label: "All contact options",
      node: (
        <Link to="/contact" className="font-medium text-accent hover:underline">
          Open contact page →
        </Link>
      ),
    });
  }

  const channelIcon = (key: string) => {
    if (key === "email") return <Mail className="h-5 w-5 text-accent" />;
    if (key === "whatsapp") return <MessageCircle className="h-5 w-5 text-accent" />;
    if (key === "telegram") return <Send className="h-5 w-5 text-accent" />;
    if (key === "phone") return <Phone className="h-5 w-5 text-accent" />;
    return <HelpCircle className="h-5 w-5 text-accent" />;
  };

  return (
    <div className="not-prose space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div
            key={c.key}
            className="rounded-2xl bg-surface p-5 border border-border/40 hover-lift flex gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
              {channelIcon(c.key)}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{c.label}</div>
              {c.description ? (
                <div className="text-[11px] text-muted-foreground/90 mt-0.5">{c.description}</div>
              ) : null}
              <div className="mt-1.5 text-foreground">{c.node}</div>
            </div>
          </div>
        ))}
      </div>

      {channels.whatsappUrl ? (
        <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Default WhatsApp message: </span>
          <span className="italic">&ldquo;{waPreset}&rdquo;</span>
        </div>
      ) : null}
      {channels.telegramUrl ? (
        <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Default Telegram message: </span>
          <span className="italic">&ldquo;{tgPreset}&rdquo;</span>
        </div>
      ) : null}

      {showPaymentChannels && (upi || bank?.accountNumber) ? (
        <div className="rounded-2xl border border-border/50 bg-surface/60 p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-accent" /> Payment support (from admin)
          </p>
          {upi ? (
            <p className="text-sm flex items-start gap-2">
              <UpiMark className="h-8 w-8 shrink-0 object-contain mt-0.5" />
              <span>
                <span className="text-muted-foreground">UPI ID: </span>
                <span className="font-mono text-foreground">{upi}</span>
              </span>
            </p>
          ) : null}
          {bank?.accountNumber ? (
            <div className="text-sm space-y-1">
              <p className="flex items-center gap-2 text-muted-foreground">
                <BankImpsMark className="h-8 w-8 shrink-0 object-contain" /> Bank (IMPS / NEFT)
              </p>
              <p>
                {bank.holderName ? <span className="text-foreground">{bank.holderName}</span> : null}
                {bank.bankName ? (
                  <span className="text-muted-foreground"> · {bank.bankName}</span>
                ) : null}
              </p>
              <p className="font-mono text-xs break-all">A/C {bank.accountNumber}</p>
              {bank.ifsc ? <p className="font-mono text-xs">IFSC {bank.ifsc}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
