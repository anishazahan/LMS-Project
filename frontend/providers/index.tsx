"use client";

import { ReduxProvider } from "./redux-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </ReduxProvider>
  );
}
