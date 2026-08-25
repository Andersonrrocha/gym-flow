"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  showPasswordLabel: string;
  hidePasswordLabel: string;
  label?: string;
  error?: string | null;
  description?: string;
  showLockIcon?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      className,
      showPasswordLabel,
      hidePasswordLabel,
      label,
      description,
      error,
      disabled,
      id,
      showLockIcon = true,
      ...props
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? `password-${reactId}`;
    const helpId = description ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [helpId, errorId].filter(Boolean).join(" ") || undefined;
    const [visible, setVisible] = useState(false);

    const toggle = useCallback(() => {
      setVisible((v) => !v);
    }, []);

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
            "flex h-12 items-center gap-2 rounded-xl border bg-muted/40 px-3 transition-colors",
            invalid
              ? "border-destructive focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/30"
              : "border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
            disabled && "opacity-60",
          )}
        >
          {showLockIcon ? (
            <Lock
              className={cn(
                "size-4 shrink-0",
                invalid ? "text-destructive" : "text-muted-foreground",
              )}
              aria-hidden
            />
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={toggle}
            disabled={disabled}
            aria-pressed={visible}
            aria-label={visible ? hidePasswordLabel : showPasswordLabel}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {visible ? (
              <EyeOff className="size-4" strokeWidth={2} aria-hidden />
            ) : (
              <Eye className="size-4" strokeWidth={2} aria-hidden />
            )}
          </button>
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
