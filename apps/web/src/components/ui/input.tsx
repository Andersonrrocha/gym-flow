"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: string;
  description?: string;
  error?: string | null;
  leftIcon?: LucideIcon;
  rightSlot?: React.ReactNode;
  size?: "md" | "lg";
};

const sizeClasses: Record<NonNullable<InputProps["size"]>, string> = {
  md: "h-11 text-sm",
  lg: "h-12 text-base",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      description,
      error,
      leftIcon: LeftIcon,
      rightSlot,
      size = "lg",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? `input-${reactId}`;
    const helpId = description ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [helpId, errorId].filter(Boolean).join(" ") || undefined;
    const invalid = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </label>
        ) : null}
        <div
          className={cn(
            "group flex items-center gap-2 rounded-xl border bg-muted/40 px-3 transition-colors",
            invalid
              ? "border-destructive focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/30"
              : "border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
            disabled && "opacity-60",
            sizeClasses[size],
          )}
        >
          {LeftIcon ? (
            <LeftIcon
              className={cn(
                "size-4 shrink-0",
                invalid ? "text-destructive" : "text-muted-foreground",
              )}
              aria-hidden
            />
          ) : null}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />
          {rightSlot ? (
            <div className="flex shrink-0 items-center">{rightSlot}</div>
          ) : null}
        </div>
        {description && !error ? (
          <p id={helpId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
