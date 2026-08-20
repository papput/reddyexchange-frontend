import type { PublicSettingsData } from "@/lib/api";
import { site } from "@/config/site";

/** Digits only; 10-digit Indian numbers get leading 91 for wa.me / tel. */
export function normalizeWhatsAppDigits(raw: string): string {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.length === 10) d = `91${d}`;
  return d;
}

export function buildWhatsAppUrl(phoneRaw: string, presetMessage: string): string {
  const n = normalizeWhatsAppDigits(phoneRaw);
  if (!n) return "";
  const text = String(presetMessage || "").trim();
  const base = `https://wa.me/${n}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function buildTelHref(phoneRaw: string): string {
  const n = normalizeWhatsAppDigits(phoneRaw);
  if (!n) return "";
  return `tel:+${n}`;
}

export function mailtoSupport(subject?: string): string {
  const s = subject?.trim();
  const q = s ? `?subject=${encodeURIComponent(s)}` : "";
  return `mailto:${site.supportEmail}${q}`;
}

export function defaultWhatsAppMessage(settings: PublicSettingsData | undefined): string {
  const m = settings?.whatsappMessage?.trim();
  if (m) return m;
  return `Hi ${site.siteName}, I need help with my account.`;
}

/** Build t.me URL from username, phone, or existing t.me / telegram.me link. */
export function buildTelegramUrl(handleRaw: string, presetMessage: string): string {
  const raw = String(handleRaw || "").trim();
  if (!raw) return "";

  const text = String(presetMessage || "").trim();

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (text && !u.searchParams.has("text")) u.searchParams.set("text", text);
      return u.toString();
    } catch {
      return raw;
    }
  }

  let handle = raw.replace(/^@/, "").replace(/^(t\.me|telegram\.me)\//i, "");
  const digits = handle.replace(/\D/g, "");
  const looksLikePhone = /^\+?[\d\s-]+$/.test(raw) && digits.length >= 10;

  if (looksLikePhone) {
    const base = `https://t.me/+${digits}`;
    return text ? `${base}?text=${encodeURIComponent(text)}` : base;
  }

  handle = handle.replace(/[^a-zA-Z0-9_]/g, "");
  if (!handle) return "";
  const base = `https://t.me/${handle}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function defaultTelegramMessage(settings: PublicSettingsData | undefined): string {
  const m = settings?.telegramMessage?.trim();
  if (m) return m;
  return `Hi ${site.siteName}, I need help with my account.`;
}

export type SupportChannels = {
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  whatsappUrl: string;
  telegramUrl: string;
  /** Phone only when WhatsApp channel is on (uses WhatsApp number). */
  telHref: string;
};

/** Resolve admin-gated WhatsApp / Telegram URLs for the public site. */
export function getSupportChannels(
  settings: PublicSettingsData | undefined,
  opts?: { whatsappMessage?: string; telegramMessage?: string },
): SupportChannels {
  const whatsappEnabled = settings?.whatsappEnabled !== false;
  const telegramEnabled = Boolean(settings?.telegramEnabled);

  const waMsg = opts?.whatsappMessage ?? defaultWhatsAppMessage(settings);
  const tgMsg = opts?.telegramMessage ?? defaultTelegramMessage(settings);

  const whatsappUrl = whatsappEnabled
    ? buildWhatsAppUrl(settings?.whatsappNumber ?? "", waMsg)
    : "";
  const telegramUrl = telegramEnabled
    ? buildTelegramUrl(settings?.telegramHandle ?? "", tgMsg)
    : "";
  const telHref =
    whatsappEnabled && settings?.whatsappNumber
      ? buildTelHref(settings.whatsappNumber)
      : "";

  return {
    whatsappEnabled: Boolean(whatsappUrl),
    telegramEnabled: Boolean(telegramUrl),
    whatsappUrl,
    telegramUrl,
    telHref,
  };
}

/** Human label for a single support CTA based on which channels are available. */
export function supportContactLabel(channels: SupportChannels): string {
  const { whatsappUrl, telegramUrl } = channels;
  if (whatsappUrl && telegramUrl) return "Chat with us";
  if (telegramUrl) return "Telegram";
  if (whatsappUrl) return "WhatsApp";
  return "Contact";
}

/** Open the only available channel, or return `"chooser"` when both exist. */
export function resolveSupportAction(channels: SupportChannels): "whatsapp" | "telegram" | "chooser" | "none" {
  const { whatsappUrl, telegramUrl } = channels;
  if (whatsappUrl && telegramUrl) return "chooser";
  if (telegramUrl) return "telegram";
  if (whatsappUrl) return "whatsapp";
  return "none";
}

export function openSupportChannel(url: string) {
  if (!url || typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}
