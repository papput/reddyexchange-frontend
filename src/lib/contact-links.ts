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
