"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { hydrate } from "@/store/slices/auth.slice";
import { onApiError } from "@/lib/api/axios";
import { toast } from "sonner";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    storeRef.current!.dispatch(hydrate());

    const unsub = onApiError((status, message) => {
      if (status === 0) {
        toast.error("Network error", { description: message });
      } else if (status === 401) {
        toast.error("Session expired", { description: "Please log in again." });
      } else if (status >= 500) {
        toast.error("Server error", { description: message });
      }
    });
    return () => {
      unsub();
    };
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
