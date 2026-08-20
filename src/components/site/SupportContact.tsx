import { useState, type MouseEvent, type ReactNode } from "react";
import type { PublicSettingsData } from "@/lib/api";
import {
  getSupportChannels,
  openSupportChannel,
  resolveSupportAction,
  supportContactLabel,
  type SupportChannels,
} from "@/lib/contact-links";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import whatsappIcon from "@/assets/whatsapp.svg";
import telegramIcon from "@/assets/telegram.png";
import { cn } from "@/lib/utils";

type MessageOpts = { whatsappMessage?: string; telegramMessage?: string };

export function useSupportChannels(
  settings: PublicSettingsData | undefined,
  opts?: MessageOpts,
): SupportChannels {
  return getSupportChannels(settings, opts);
}

/** Shared chooser when both WhatsApp and Telegram are enabled. */
export function SupportChannelChooser({
  open,
  onOpenChange,
  channels,
  title = "Choose how to contact us",
  description = "Pick WhatsApp or Telegram — whichever is easier for you.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: SupportChannels;
  title?: string;
  description?: string;
}) {
  const pick = (url: string) => {
    openSupportChannel(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 pt-1">
          {channels.whatsappUrl ? (
            <button
              type="button"
              onClick={() => pick(channels.whatsappUrl)}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 px-4 py-3 text-left hover:bg-surface transition"
            >
              <img src={whatsappIcon} alt="" className="h-10 w-10 shrink-0" width={40} height={40} />
              <div>
                <div className="font-semibold text-sm text-foreground">WhatsApp</div>
                <div className="text-xs text-muted-foreground">Continue on WhatsApp</div>
              </div>
            </button>
          ) : null}
          {channels.telegramUrl ? (
            <button
              type="button"
              onClick={() => pick(channels.telegramUrl)}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 px-4 py-3 text-left hover:bg-surface transition"
            >
              <img
                src={telegramIcon}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
                width={40}
                height={40}
              />
              <div>
                <div className="font-semibold text-sm text-foreground">Telegram</div>
                <div className="text-xs text-muted-foreground">Continue on Telegram</div>
              </div>
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SupportContactButtonProps = {
  settings: PublicSettingsData | undefined;
  className?: string;
  children?: ReactNode;
  /** Custom message(s) for the chat deep link. */
  messageOpts?: MessageOpts;
  title?: string;
  fallbackHref?: string;
};

/**
 * One CTA for support chat:
 * - only WhatsApp → open WhatsApp
 * - only Telegram → open Telegram
 * - both → chooser popup
 * - neither → optional fallback (e.g. /contact) or nothing
 */
export function SupportContactButton({
  settings,
  className,
  children,
  messageOpts,
  title,
  fallbackHref,
}: SupportContactButtonProps) {
  const channels = getSupportChannels(settings, messageOpts);
  const action = resolveSupportAction(channels);
  const [chooserOpen, setChooserOpen] = useState(false);
  const label = children ?? supportContactLabel(channels);

  if (action === "none") {
    if (!fallbackHref) return null;
    return (
      <a href={fallbackHref} className={className}>
        {label}
      </a>
    );
  }

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    if (action === "chooser") {
      setChooserOpen(true);
      return;
    }
    openSupportChannel(action === "telegram" ? channels.telegramUrl : channels.whatsappUrl);
  };

  return (
    <>
      <button type="button" onClick={onClick} className={className} title={title}>
        {label}
      </button>
      <SupportChannelChooser open={chooserOpen} onOpenChange={setChooserOpen} channels={channels} />
    </>
  );
}

/** Imperative helper for places that already have their own button UI. */
export function useSupportContactAction(
  settings: PublicSettingsData | undefined,
  opts?: MessageOpts,
) {
  const channels = getSupportChannels(settings, opts);
  const [chooserOpen, setChooserOpen] = useState(false);
  const action = resolveSupportAction(channels);

  const trigger = () => {
    if (action === "chooser") {
      setChooserOpen(true);
      return;
    }
    if (action === "telegram") openSupportChannel(channels.telegramUrl);
    else if (action === "whatsapp") openSupportChannel(channels.whatsappUrl);
  };

  const chooser = (
    <SupportChannelChooser open={chooserOpen} onOpenChange={setChooserOpen} channels={channels} />
  );

  return { channels, action, trigger, chooser, label: supportContactLabel(channels) };
}

export function SupportChannelIcons({
  channels,
  className,
  size = 16,
}: {
  channels: SupportChannels;
  className?: string;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {channels.whatsappUrl ? (
        <img src={whatsappIcon} alt="" width={size} height={size} className="shrink-0" />
      ) : null}
      {channels.telegramUrl ? (
        <img
          src={telegramIcon}
          alt=""
          width={size}
          height={size}
          className="shrink-0 rounded-full object-cover"
        />
      ) : null}
    </span>
  );
}
