import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { SESSION_EXPIRED_FLASH_KEY, USER_AUTH_STORAGE_KEY } from "@/lib/constants";

/**
 * Axios `baseURL` should be `/api` in dev (Vite proxy → backend) or `https://host/api` in production.
 *
 * Backend route map (all under the same origin prefix as `baseURL`):
 * - GET  /settings — public rates, fees, UPI/bank, `minInrLimit`, deposit wallets
 * - PUT  /settings/admin — admin only
 * - POST /auth/register | /auth/login
 * - POST /auth/forgot-password/send-otp | /auth/forgot-password/reset | /auth/resend-otp
 * - GET  /user/profile | PUT /user/update | GET /user/transactions | GET /user/app/routes
 * - POST /user/tracking/buy-step — body { step: 1–4, amountINR? }
 * - POST /buy/create (multipart) | GET /buy/history | GET /buy/:id
 * - POST /buy/cowpay/upi/initiate | /buy/upi/auto/initiate | /buy/upi/auto/confirm (multipart)
 * - POST /sell/create (multipart) | GET /sell/history | GET /sell/:id
 * - POST /withdrawals/create (body: amountUsdt, network TRC20|ERC20|BEP20, walletAddress) | GET /withdrawals/my | GET /withdrawals/:id | POST /withdrawals/attempt
 */
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    "[api] VITE_API_BASE_URL is empty. Use VITE_API_BASE_URL=/api with a Vite proxy to your backend (see .env.example).",
  );
}

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
});

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string } | null;
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

/** JWT `exp` (seconds since epoch), if present and parseable — not cryptographically verified. */
function readJwtExpSeconds(token: string): number | null {
  try {
    const seg = token.split(".")[1];
    if (!seg) return null;
    const json = atob(seg.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) ? payload.exp : null;
  } catch {
    return null;
  }
}

function requestSentBearer(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config?.headers) return false;
  const h = config.headers;
  const auth =
    typeof (h as { get?: (k: string) => unknown }).get === "function"
      ? (h as { get: (k: string) => unknown }).get("Authorization")
      : (h as { Authorization?: unknown }).Authorization;
  return typeof auth === "string" && auth.startsWith("Bearer ");
}

const SESSION_TOAST_TITLE = "You've been signed out";
const SESSION_TOAST_DESCRIPTION = "Your session expired. Please sign in again to continue.";

let sessionInvalidationInFlight = false;

async function invalidateSessionAndNotify() {
  if (typeof window === "undefined" || sessionInvalidationInFlight) return;
  sessionInvalidationInFlight = true;
  try {
    const { logout } = await import("@/lib/store");
    logout();
    const path = window.location.pathname;
    const onAuthPage =
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/forgot-password");
    if (onAuthPage) {
      toast.info(SESSION_TOAST_TITLE, {
        description: SESSION_TOAST_DESCRIPTION,
        duration: 6500,
      });
    } else {
      try {
        sessionStorage.setItem(SESSION_EXPIRED_FLASH_KEY, "1");
      } catch {
        /* ignore quota / private mode */
      }
      window.location.assign("/login");
    }
  } finally {
    window.setTimeout(() => {
      sessionInvalidationInFlight = false;
    }, 1500);
  }
}

export function clearUserAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_AUTH_STORAGE_KEY);
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readToken();
  if (token) {
    const expSec = readJwtExpSeconds(token);
    if (expSec != null && expSec * 1000 <= Date.now()) {
      void invalidateSessionAndNotify();
      return Promise.reject(
        new axios.AxiosError("Session expired", "ERR_BAD_REQUEST", config, undefined, undefined),
      );
    }
  }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    if (status !== 401 || typeof window === "undefined") {
      return Promise.reject(error);
    }

    if (!requestSentBearer(error.config)) {
      return Promise.reject(error);
    }

    await invalidateSessionAndNotify();
    return Promise.reject(error);
  },
);

export function apiGet<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return api.get<T>(url, config);
}

export function apiPost<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return api.post<T>(url, data, config);
}

export function apiPut<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return api.put<T>(url, data, config);
}

interface ApiErrorBody {
  message?: string;
  error?: string;
}

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined;
    return data?.message || data?.error || err.message || "Something went wrong";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export type PublicSettingsData = {
  price: number;
  /** INR per USDT for sell (payout). Falls back to `price` if omitted. */
  sellPriceInr?: number;
  /** Saved admin addresses; may be empty when using env fallback — use primeExchUsdtWallets for display. */
  sellDepositWallets?: { TRC20?: string; BEP20?: string };
  /** From server env; omitted on older backends — treat as 2000 client-side. */
  minInrLimit?: number;
  exchangeFees: { TRC20: number; ERC20: number; BEP20: number };
  upiMode: string;
  upiAutoProvider: string;
  manualUpiId: string;
  bankDetails: {
    holderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
  };
  /** Buy flow bank IMPS: `normal` = show bank fields; `whatsapp` = open chat with details */
  buyBankImpsInstructions?: "normal" | "whatsapp";
  whatsappNumber?: string;
  whatsappMessage?: string;
  primeExchUsdtWallets: { TRC20?: string; ERC20?: string; BEP20?: string };
};

export async function fetchPublicSettings(): Promise<PublicSettingsData> {
  const { data } = await api.get<{ success: boolean; data: PublicSettingsData }>("/settings");
  return data.data;
}

export type ApiUser = {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  createdAt?: string;
  primeExchUsdtBalance?: number;
  /** Per-user floor; omit, null, or 0 → platform default (25 USDT) on server. */
  withdrawalMinLimitUsdt?: number;
};

export async function apiLogin(identifier: string, password: string) {
  return apiPost<{ success: boolean; token: string; data: { user: ApiUser } }>("/auth/login", {
    identifier,
    password,
  });
}

export async function apiRegister(body: {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}) {
  return apiPost<{ success: boolean; token: string; data: { user: ApiUser } }>(
    "/auth/register",
    body,
  );
}

export async function apiSendPasswordResetOtp(identifier: string) {
  return apiPost<{
    success: boolean;
    message: string;
    data?: { phone: string; maskedPhone: string };
  }>("/auth/forgot-password/send-otp", { identifier });
}

export async function apiResetPasswordWithOtp(body: {
  identifier: string;
  otp: string;
  newPassword: string;
}) {
  return apiPost<{ success: boolean; message: string }>("/auth/forgot-password/reset", body);
}

export async function apiResendResetOtp(identifier: string) {
  return apiPost<{
    success: boolean;
    message: string;
    data?: { phone: string; maskedPhone: string };
  }>("/auth/resend-otp", { identifier, purpose: "reset_password" });
}

export async function apiFetchProfile() {
  return apiGet<{ success: boolean; data: ApiUser }>("/user/profile");
}

export async function apiUpdateProfile(body: { fullName?: string; mobile?: string }) {
  return apiPut<{ success: boolean; data: ApiUser }>("/user/update", body);
}

/** Tracks buy funnel steps (1–4). Step ≥ 4 clears server-side tracking. */
export async function apiTrackBuyStep(body: { step: number; amountINR?: number }) {
  return apiPost<{ success: boolean; message?: string; data?: unknown }>(
    "/user/tracking/buy-step",
    body,
  );
}

export async function apiFetchTransactions(page = 1, limit = 100) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(100, Math.max(1, limit))),
  });
  return apiGet<{
    success: boolean;
    data: unknown[];
    pagination?: { page: number; limit: number; total: number };
  }>(`/user/transactions?${q}`);
}

export type BuyTransactionResponse = {
  _id?: string;
  orderId?: string;
  amountINR?: number;
  usdtAmount?: number;
  status?: string;
  [key: string]: unknown;
};

export type BuyHistoryItem = {
  _id: string;
  orderId?: string;
  amountINR?: number;
  usdtAmount?: number;
  network?: string;
  paymentMethod?: "UPI" | "BANK" | string;
  paymentChannel?: string;
  utrNumber?: string;
  status?: "pending" | "completed" | "rejected" | string;
  createdAt?: string;
};

export async function apiCreateBuy(form: FormData) {
  return apiPost<{ success: boolean; data: BuyTransactionResponse }>("/buy/create", form);
}

export async function apiGetBuyHistory(page = 1, limit = 200) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(200, Math.max(1, limit))),
  });
  return apiGet<{
    success: boolean;
    data: BuyHistoryItem[];
    pagination?: { page: number; limit: number; total: number };
  }>(`/buy/history?${q}`);
}

/** Creates a draft and returns gateway URL (Cowpay or SilkPay per server settings). */
export async function apiInitiateAutoUpi(body: {
  amountINR: number;
  network: string;
  walletAddress: string;
  buyAsset: string;
}) {
  return apiPost<{
    success: boolean;
    data: { provider: string; orderId: string; redirectUrl: string };
  }>("/buy/upi/auto/initiate", body);
}

/** After user pays on gateway: UTR + screenshot → final buy transaction. */
export async function apiConfirmAutoUpi(form: FormData) {
  return apiPost<{ success: boolean; data: BuyTransactionResponse }>("/buy/upi/auto/confirm", form);
}

export async function apiCreateSell(form: FormData) {
  return apiPost<{ success: boolean; data: { _id: string } }>("/sell/create", form);
}

export async function apiGetBuyById(id: string) {
  return apiGet<{ success: boolean; data: Record<string, unknown> }>(
    `/buy/${encodeURIComponent(id)}`,
  );
}

export async function apiGetSellById(id: string) {
  return apiGet<{ success: boolean; data: Record<string, unknown> }>(
    `/sell/${encodeURIComponent(id)}`,
  );
}

export async function apiGetWithdrawalById(id: string) {
  return apiGet<{ success: boolean; data: Record<string, unknown> }>(
    `/withdrawals/${encodeURIComponent(id)}`,
  );
}

export async function apiCreateWithdrawal(body: {
  amountUsdt: number;
  network: "TRC20" | "ERC20" | "BEP20";
  walletAddress: string;
}) {
  return apiPost<{ success: boolean; data: unknown }>("/withdrawals/create", body);
}

export type RefundMethod = "original" | "bank";

export type RefundRequest = {
  _id: string;
  buyTransactionId: string;
  refundMethod: RefundMethod;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
  processedAt?: string | null;
  orderId?: string;
  amountINR?: number;
  utrNumber?: string;
  paymentMethod?: string;
};

export async function apiCreateRefundRequest(body: {
  buyTransactionId: string;
  refundMethod: RefundMethod;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
}) {
  return apiPost<{ success: boolean; data: RefundRequest }>("/refunds", body);
}

export async function apiListMyRefundRequests(page = 1, limit = 200) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(200, Math.max(1, limit))),
  });
  return apiGet<{
    success: boolean;
    data: RefundRequest[];
    pagination?: { page: number; limit: number; total: number };
  }>(`/refunds/my?${q}`);
}

export default api;
