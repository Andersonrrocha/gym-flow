"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useCallback,
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
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      className,
      showPasswordLabel,
      hidePasswordLabel,
      disabled,
      id,
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);

    const toggle = useCallback(() => {
      setVisible((v) => !v);
    }, []);

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          disabled={disabled}
          className={cn(
            "h-12 w-full rounded-lg border border-input bg-muted py-0 pl-4 pr-11 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
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
          className="absolute right-0 top-0 flex h-12 w-11 shrink-0 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="size-5" strokeWidth={2} aria-hidden />
          ) : (
            <Eye className="size-5" strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>
    );
  },
);
