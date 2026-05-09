import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = (action as { payload?: { status?: number | string; data?: { message?: string } } })
      .payload;
    const status = payload?.status;
    const message = payload?.data?.message;

    if (status === "FETCH_ERROR" || status === 0) {
      toast.error("Network error", { description: message || "Please try again." });
    } else if (status === 401) {
      toast.error("Session expired", { description: "Please log in again." });
    } else if (typeof status === "number" && status >= 500) {
      toast.error("Server error", { description: message || "Something went wrong." });
    } else if (message) {
      // 4xx — show server-provided message (validation, duplicate, etc.)
      toast.error(message);
    }
  }
  return next(action);
};
