export type ClientGatewayPay = {
  action: string;
  fields: Record<string, string>;
};

/**
 * POST signed pay-in fields from the user's browser (OSPAY allows CORS *).
 * Bypasses Cloudflare blocks on server datacenter IPs (e.g. Render).
 */
export async function launchClientGatewayPay(clientPay: ClientGatewayPay): Promise<void> {
  const action = String(clientPay?.action || "").trim();
  if (!action) throw new Error("Invalid payment response");

  const fields = clientPay.fields || {};
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    body.set(key, String(value));
  }

  const res = await fetch(action, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  let parsed: { code?: number; data?: string; message?: string } | null = null;
  try {
    parsed = JSON.parse(text) as { code?: number; data?: string; message?: string };
  } catch {
    if (/cloudflare|attention required|<!doctype html>/i.test(text)) {
      throw new Error("Payment gateway temporarily unavailable. Please try again.");
    }
    throw new Error("Payment gateway returned an invalid response");
  }

  if (Number(parsed?.code) !== 0 || !parsed?.data) {
    throw new Error(String(parsed?.message || "Payment could not be started"));
  }

  window.location.assign(String(parsed.data));
}
