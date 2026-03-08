"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function PrimaryButton({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-all active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-40",
        {
          "bg-primary text-primary-foreground hover:brightness-110":
            variant === "primary",
          "bg-transparent text-foreground hover:bg-muted":
            variant === "ghost",
          "border border-border text-foreground hover:bg-muted":
            variant === "outline",
        },
        {
          "h-8 px-3 text-xs": size === "sm",
          "h-10 px-5 text-sm": size === "md",
          "h-12 px-6 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
