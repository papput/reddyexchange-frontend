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
