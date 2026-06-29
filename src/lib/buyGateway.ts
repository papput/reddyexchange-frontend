import type { Network } from "@/lib/store";
import { GATEWAY_RETURN_PENDING_KEY } from "@/lib/constants";

export const BUY_AUTO_SESSION_KEY = "neon_buy_auto_order_v1";

export type BuyAsset = "standard" | "pex";

export type BuyAutoSession = {
  orderId: string;
  /** Owner of this pending order — prevents cross-account step-4 bleed */
  userId?: string;
  awaitingReturn?: boolean;
  /** After gateway return or re-login — resume buy flow at proof step */
  resumeStep?: number;
  network?: Network;
  buyAsset?: BuyAsset;
  inr?: number;
};

export type GatewayReturnParse = {
  orderId: string | null;
  isGatewayReturn: boolean;
};

function searchToUrlSearchParams(search: unknown): URLSearchParams {
  if (typeof search === "string") {
    const s = search.startsWith("?") ? search.slice(1) : search;
    return new URLSearchParams(s);
  }
  if (search && typeof search === "object" && !Array.isArray(search)) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(search as Record<string, unknown>)) {
      if (v != null && v !== "") qs.set(k, String(v));
    }
    return qs;
  }
  if (typeof window !== "undefined") return new URLSearchParams(window.location.search);
  return new URLSearchParams();
}

function isSuccessQuery(qs: URLSearchParams): boolean {
  return (
    qs.get("success") === "true" ||
    qs.get("success") === "1" ||
    qs.get("payment_status") === "success" ||
    qs.get("status") === "success"
  );
}

function hasOrderInQuery(qs: URLSearchParams): boolean {
  return (
    qs.has("order_id") ||
    qs.has("orderId") ||
    qs.has("mOrderId") ||
    qs.has("m_order_id")
  );
}

export function markGatewayReturnPending() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GATEWAY_RETURN_PENDING_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearGatewayReturnPending() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(GATEWAY_RETURN_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function isGatewayReturnPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(GATEWAY_RETURN_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function isGatewayReturnPath(pathname: string, search?: unknown): boolean {
  if (pathname === "/buy" || pathname === "/app/buy" || pathname.endsWith("/buy")) {
    const parsed = parseGatewayReturn(search ?? (typeof window !== "undefined" ? window.location.search : ""));
    if (parsed.isGatewayReturn) return true;
  }
  return isGatewayReturnPending();
}

export function readBuyAutoSession(): BuyAutoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BUY_AUTO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuyAutoSession;
    if (!parsed?.orderId) return null;
    return {
      orderId: String(parsed.orderId),
      userId: parsed.userId ? String(parsed.userId) : undefined,
      awaitingReturn: Boolean(parsed.awaitingReturn),
      resumeStep: typeof parsed.resumeStep === "number" ? parsed.resumeStep : undefined,
      network: parsed.network,
      buyAsset: parsed.buyAsset,
      inr: typeof parsed.inr === "number" ? parsed.inr : undefined,
    };
  } catch {
    return null;
  }
}

export function writeBuyAutoSession(data: BuyAutoSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BUY_AUTO_SESSION_KEY, JSON.stringify(data));
}

export function clearBuyAutoSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BUY_AUTO_SESSION_KEY);
  clearGatewayReturnPending();
}

/** Drop stale resume data when another account is signed in. */
export function clearBuyAutoSessionIfWrongUser(currentUserId: string | null | undefined) {
  const session = readBuyAutoSession();
  if (!session?.userId || !currentUserId) return;
  if (session.userId !== currentUserId) {
    clearBuyAutoSession();
  }
}

export function sessionBelongsToUser(userId: string | null | undefined): boolean {
  const session = readBuyAutoSession();
  if (!session) return false;
  if (!session.userId) return true;
  if (!userId) return false;
  return session.userId === userId;
}

export function hasPendingBuyResume(userId?: string | null): boolean {
  const s = readBuyAutoSession();
  if (!s?.orderId || !(s.resumeStep === 4 || s.awaitingReturn)) return false;
  if (userId != null && s.userId && s.userId !== userId) return false;
  return true;
}

/** Parse SilkPay / Cowpay / bridge return query params. */
export function parseGatewayReturn(search: unknown): GatewayReturnParse {
  const qs = searchToUrlSearchParams(search);
  const resume = qs.get("resume") === "auto";
  const successFlag = isSuccessQuery(qs);
  const session = readBuyAutoSession();
  const storedOid = session?.orderId ?? null;

  let oid =
    qs.get("orderId") ||
    qs.get("order_id") ||
    qs.get("mOrderId") ||
    qs.get("m_order_id");

  if (!oid && (resume || successFlag) && storedOid) oid = storedOid;
  if (!oid && session?.awaitingReturn && storedOid) oid = storedOid;

  const fromGateway = Boolean(oid) && (resume || successFlag);
  const fromCowpayReturn = Boolean(oid) && Boolean(session?.awaitingReturn);
  const fromStoredResume = Boolean(oid) && session?.resumeStep === 4;
  const sessionMatches =
    Boolean(oid) &&
    Boolean(storedOid) &&
    String(oid) === String(storedOid) &&
    (hasOrderInQuery(qs) || resume || successFlag);

  const isGatewayReturn = fromGateway || fromCowpayReturn || fromStoredResume || sessionMatches;

  return {
    orderId: oid ? String(oid) : null,
    isGatewayReturn,
  };
}

/**
 * Persist gateway return before auth guards run (e.g. expired JWT).
 * Call from `/buy`, `/app/buy`, or parent `/app` beforeLoad.
 */
export function captureGatewayReturnIfPresent(pathname: string, search: unknown): GatewayReturnParse | null {
  const isBuyPath = pathname === "/app/buy" || pathname === "/buy" || pathname.endsWith("/buy");
  if (!isBuyPath || typeof window === "undefined") return null;

  const parsed = parseGatewayReturn(search);
  if (!parsed.isGatewayReturn || !parsed.orderId) return parsed;

  markGatewayReturnPending();
  const session = readBuyAutoSession();
  writeBuyAutoSession({
    orderId: parsed.orderId,
    userId: session?.userId,
    awaitingReturn: false,
    resumeStep: 4,
    network: session?.network,
    buyAsset: session?.buyAsset,
    inr: session?.inr,
  });

  return parsed;
}

export function getInitialBuyGatewayState(userId?: string | null): {
  step: number;
  autoPayOrderId: string | null;
} {
  if (typeof window === "undefined") return { step: 1, autoPayOrderId: null };

  const parsed = parseGatewayReturn(window.location.search);
  if (parsed.isGatewayReturn && parsed.orderId) {
    return { step: 4, autoPayOrderId: parsed.orderId };
  }

  const session = readBuyAutoSession();
  if (session?.resumeStep === 4 && session.orderId) {
    if (session.userId && userId && session.userId !== userId) {
      return { step: 1, autoPayOrderId: null };
    }
    if (session.userId && !userId) {
      return { step: 1, autoPayOrderId: null };
    }
    return { step: 4, autoPayOrderId: session.orderId };
  }

  return { step: 1, autoPayOrderId: null };
}

export function stripGatewayQueryFromUrl() {
  if (typeof window === "undefined") return;
  const qs = new URLSearchParams(window.location.search);
  const resume = qs.get("resume") === "auto";
  const successFlag = isSuccessQuery(qs);
  const hasOrderInQs = hasOrderInQuery(qs);
  if (resume || successFlag || hasOrderInQs) {
    window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  }
}

/** True when `/buy` should host the public gateway-return flow (not redirect to /app/buy). */
export function shouldUsePublicBuyReturnRoute(search: unknown): boolean {
  const parsed = parseGatewayReturn(search);
  if (parsed.isGatewayReturn) return true;
  const session = readBuyAutoSession();
  return Boolean(session?.awaitingReturn || (session?.resumeStep === 4 && session.orderId));
}
