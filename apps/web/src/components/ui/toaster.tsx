"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={(resolvedTheme as "light" | "dark") ?? "dark"}
      position="top-center"
      closeButton
      richColors={false}
      duration={4000}
      offset={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-card !text-foreground !border-border !rounded-2xl !shadow-lg !font-sans",
          title: "!font-display !font-semibold",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-foreground",
          closeButton:
            "!bg-card !text-muted-foreground hover:!text-foreground !border-border",
          success: "!border-success/50 [&_[data-icon]]:!text-success",
          error: "!border-destructive/50 [&_[data-icon]]:!text-destructive",
          warning: "!border-warning/50 [&_[data-icon]]:!text-warning",
          info: "!border-info/50 [&_[data-icon]]:!text-info",
        },
      }}
    />
  );
}
