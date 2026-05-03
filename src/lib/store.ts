// Auth state + formatting helpers (transactions load from API via React Query).
import { useEffect, useState, useSyncExternalStore } from "react";
import { USER_AUTH_STORAGE_KEY } from "@/lib/constants";
import { apiFetchProfile, type ApiUser } from "@/lib/api";

const DEFAULT_RATE = 91;

export function inrToUsdt(inr: number, rate = DEFAULT_RATE) {
  return inr / rate;
}
export function usdtToInr(usdt: number, rate = DEFAULT_RATE) {
  return usdt * rate;
}

function chainFeeUsdt(
  network: "TRC20" | "ERC20" | "BEP20",
  fees: { TRC20: number; ERC20: number; BEP20: number }
) {
  const fee = network === "ERC20" ? fees.ERC20 : network === "BEP20" ? fees.BEP20 : fees.TRC20;
  return Number.isFinite(fee) && fee > 0 ? fee : 0;
}

/** Net USDT for a buy (matches backend: `pex` has 0 platform fee; `standard` uses settings fees). */
export function estimateBuyUsdt(
  amountINR: number,
  price: number,
  network: "TRC20" | "ERC20" | "BEP20",
  fees: { TRC20: number; ERC20: number; BEP20: number },
  buyAsset: "standard" | "pex" = "standard"
) {
  const gross = Number((amountINR / price).toFixed(6));
  if (buyAsset === "pex") return gross;
  const exchangeFeeUsdt = chainFeeUsdt(network, fees);
  return Number(Math.max(0, gross - exchangeFeeUsdt).toFixed(6));
}

/** INR required to receive `netUsdt` after chain fee (inverse of `estimateBuyUsdt` for standard). */
export function estimateInrFromNetUsdt(
  netUsdt: number,
  price: number,
  network: "TRC20" | "ERC20" | "BEP20",
  fees: { TRC20: number; ERC20: number; BEP20: number },
  buyAsset: "standard" | "pex" = "standard"
) {
  if (!Number.isFinite(netUsdt) || netUsdt < 0 || !Number.isFinite(price) || price <= 0) return 0;
  if (buyAsset === "pex") return Number((netUsdt * price).toFixed(2));
  const exchangeFeeUsdt = chainFeeUsdt(network, fees);
  const gross = netUsdt + exchangeFeeUsdt;
  return Number((gross * price).toFixed(2));
}

export function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
}
export function fmtUSDT(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USDT`;
}

export type User = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  createdAt: string | number;
  primeExchUsdtBalance?: number;
  withdrawalMinLimitUsdt?: number;
};

/** Matches backend `PLATFORM_DEFAULT_MIN_WITHDRAW_USDT` when user limit is unset or 0. */
export const PLATFORM_DEFAULT_MIN_WITHDRAW_USDT = 25;

export function effectiveWithdrawalMinUsdt(user: Pick<User, "withdrawalMinLimitUsdt">): number {
  const raw = Number(user.withdrawalMinLimitUsdt);
  if (Number.isFinite(raw) && raw > 0) return raw;
  return PLATFORM_DEFAULT_MIN_WITHDRAW_USDT;
}

export type TxnType = "buy" | "sell" | "withdrawal";
export type TxnStatus = "pending" | "completed" | "failed";
export type Network = "TRC20" | "ERC20" | "BEP20";
export type PayMethod = "upi" | "bank";

/** MongoDB document id — required for GET /buy/:id, /sell/:id, /withdrawals/:id */
export function toDocumentId(raw: Record<string, unknown>): string {
  const id = raw._id;
  if (id == null) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && id !== null && "$oid" in id) {
    return String((id as { $oid: string }).$oid);
  }
  return String(id);
}

export type Txn = {
  /** Mongo _id for detail API + navigation */
  documentId: string;
  /** Display id: buy orderId, else documentId */
  id: string;
  type: TxnType;
  inr: number;
  usdt: number;
  network: Network;
  /** Buy only: `pex` = on-platform token; `standard` = USDT. */
  buyAsset?: "standard" | "pex";
  walletAddress?: string;
  payMethod: PayMethod;
  payDetails?: { upiId?: string; accountName?: string; accountNumber?: string; ifsc?: string; bank?: string };
  utr?: string;
  proofName?: string;
  status: TxnStatus;
  createdAt: number;
};

type Subscriber = () => void;
const subs = new Set<Subscriber>();
function emit() {
  subs.forEach((s) => s());
}
function subscribe(cb: Subscriber) {
  subs.add(cb);
  return () => subs.delete(cb);
}

/**
 * useSyncExternalStore requires a stable snapshot when storage did not change.
 * JSON.parse on every getAuth() call returns a new object → React sees endless updates.
 */
let authSnapshot: { raw: string | null; value: AuthState } = {
  raw: "__init__",
  value: null,
};

export type AuthState = { token: string; user: User } | null;

export function normalizeApiUser(u: ApiUser): User {
  return {
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    mobile: u.mobile,
    createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
    primeExchUsdtBalance: u.primeExchUsdtBalance,
    withdrawalMinLimitUsdt: u.withdrawalMinLimitUsdt,
  };
}

export function getAuth(): AuthState {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_AUTH_STORAGE_KEY);
  if (raw === authSnapshot.raw) {
    return authSnapshot.value;
  }
  if (!raw) {
    authSnapshot = { raw: null, value: null };
    return null;
  }
  try {
    const value = JSON.parse(raw) as AuthState;
    authSnapshot = { raw, value };
    return value;
  } catch {
    authSnapshot = { raw, value: null };
    return null;
  }
}

function persistAuth(next: AuthState) {
  if (typeof window === "undefined") return;
  if (next == null) {
    localStorage.removeItem(USER_AUTH_STORAGE_KEY);
    authSnapshot = { raw: null, value: null };
  } else {
    const raw = JSON.stringify(next);
    localStorage.setItem(USER_AUTH_STORAGE_KEY, raw);
    authSnapshot = { raw, value: next };
  }
  emit();
}

export function setAuth(token: string, user: User) {
  persistAuth({ token, user });
}

export function updateAuthUser(partial: Partial<User>) {
  const auth = getAuth();
  if (!auth) return;
  const nextUser = { ...auth.user, ...partial };
  const prev = auth.user;
  const unchanged =
    prev.id === nextUser.id &&
    prev.fullName === nextUser.fullName &&
    prev.email === nextUser.email &&
    prev.mobile === nextUser.mobile &&
    prev.createdAt === nextUser.createdAt &&
    prev.primeExchUsdtBalance === nextUser.primeExchUsdtBalance &&
    prev.withdrawalMinLimitUsdt === nextUser.withdrawalMinLimitUsdt;
  if (unchanged) return;
  setAuth(auth.token, nextUser);
}

export async function refreshProfile() {
  const { data } = await apiFetchProfile();
  if (!data.success || !data.data) return;
  updateAuthUser(normalizeApiUser(data.data));
}

export function logout() {
  persistAuth(null);
}

export function useAuth() {
  return useSyncExternalStore(subscribe, getAuth, () => null);
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

/** Map `/api/user/transactions` merged item to UI row. */
export function mapMergedApiTxn(raw: Record<string, unknown>): Txn | null {
  const t = String(raw.type || "");
  const createdAt = raw.createdAt ? new Date(String(raw.createdAt)).getTime() : Date.now();
  const documentId = toDocumentId(raw);
  if (!documentId) return null;

  if (t === "withdrawal") {
    const st = String(raw.status || "pending");
    const status: TxnStatus = st === "approved" ? "completed" : st === "rejected" ? "failed" : "pending";
    const net = String(raw.network || "TRC20") as Network;
    return {
      documentId,
      id: documentId,
      type: "withdrawal",
      inr: 0,
      usdt: Number(raw.amountUsdt ?? 0),
      network: net,
      payMethod: "bank",
      status,
      createdAt,
    };
  }

  if (t === "buy") {
    const st = String(raw.status || "pending");
    const status: TxnStatus = st === "completed" ? "completed" : st === "rejected" ? "failed" : "pending";
    const net = String(raw.network || "TRC20") as Network;
    const ba = raw.buyAsset === "pex" || raw.buyAsset === "standard" ? raw.buyAsset : undefined;
    const orderId = raw.orderId != null ? String(raw.orderId) : "";
    return {
      documentId,
      id: orderId || documentId,
      type: "buy",
      inr: Number(raw.amountINR ?? 0),
      usdt: Number(raw.usdtAmount ?? 0),
      network: net,
      buyAsset: ba,
      payMethod: String(raw.paymentMethod || "UPI") === "BANK" ? "bank" : "upi",
      utr: raw.utrNumber ? String(raw.utrNumber) : undefined,
      status,
      createdAt,
    };
  }

  if (t === "sell") {
    const st = String(raw.status || "pending");
    const status: TxnStatus =
      st === "paid" ? "completed" : st === "rejected" ? "failed" : st === "processing" ? "pending" : "pending";
    const net = String(raw.network || "TRC20") as Network;
    return {
      documentId,
      id: documentId,
      type: "sell",
      inr: Number(raw.amountINR ?? 0),
      usdt: Number(raw.usdtAmount ?? 0),
      network: net,
      payMethod: String(raw.payoutMethod || "UPI") === "BANK" ? "bank" : "upi",
      status,
      createdAt,
    };
  }

  return null;
}
