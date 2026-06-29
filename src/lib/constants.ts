/** localStorage key for user JWT + profile (must match backend-integrated clients). */
export const USER_AUTH_STORAGE_KEY = "fx.auth";

/** One-shot flag so `/login` can show a toast after a hard redirect (toast would otherwise be lost). */
export const SESSION_EXPIRED_FLASH_KEY = "fx.sessionExpiredFlash";

/** Set when user returns from UPI gateway — suppress scary “session expired” redirect to login. */
export const GATEWAY_RETURN_PENDING_KEY = "fx.gatewayReturnPending";
