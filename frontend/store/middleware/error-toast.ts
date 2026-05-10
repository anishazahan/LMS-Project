import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

const AUTH_ENDPOINTS = new Set(["login", "register"]);

interface RtkRejectedAction {
  payload?: { status?: number | string; data?: { message?: string } };
  meta?: { arg?: { endpointName?: string } };
}

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload, meta } = action as RtkRejectedAction;
    const status = payload?.status;
    const message = payload?.data?.message;
    const endpointName = meta?.arg?.endpointName;
    const isAuthAttempt = endpointName ? AUTH_ENDPOINTS.has(endpointName) : false;

    if (status === "FETCH_ERROR" || status === 0) {
      toast.error("Network error", { description: message || "Please try again." });
    } else if (status === 401 && !isAuthAttempt) {
      // Only treat 401 as session expiry for protected requests, not for login attempts.
      toast.error("Session expired", { description: "Please log in again." });
    } else if (typeof status === "number" && status >= 500) {
      toast.error("Server error", { description: message || "Something went wrong." });
    } else if (message) {
      // 4xx (including login 401) — show server-provided message.
      toast.error(message);
    }
  }
  return next(action);
};
