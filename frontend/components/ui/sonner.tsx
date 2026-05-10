"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast rounded-xs shadow-lg",
          description: "group-[.toast]:opacity-90",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground rounded-xs",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground rounded-xs",
          success: "!bg-emerald-50 !text-emerald-900 !border-emerald-200 dark:!bg-emerald-950 dark:!text-emerald-100 dark:!border-emerald-900",
          error: "!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-950 dark:!text-red-100 dark:!border-red-900",
          warning: "!bg-amber-50 !text-amber-900 !border-amber-200 dark:!bg-amber-950 dark:!text-amber-100 dark:!border-amber-900",
          info: "!bg-sky-50 !text-sky-900 !border-sky-200 dark:!bg-sky-950 dark:!text-sky-100 dark:!border-sky-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
