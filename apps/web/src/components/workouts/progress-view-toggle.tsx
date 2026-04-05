"use client";

import { cn } from "@/lib/utils";

export type ProgressViewMode = "week" | "month";

type ProgressViewToggleProps = {
  value: ProgressViewMode;
  onChange: (value: ProgressViewMode) => void;
  groupAriaLabel: string;
  weekLabel: string;
  monthLabel: string;
  weekAriaLabel: string;
  monthAriaLabel: string;
  className?: string;
};

export function ProgressViewToggle({
  value,
  onChange,
  groupAriaLabel,
  weekLabel,
  monthLabel,
  weekAriaLabel,
  monthAriaLabel,
  className,
}: ProgressViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex gap-0.5 rounded-md bg-muted/60 p-0.5",
        className,
      )}
      role="radiogroup"
      aria-label={groupAriaLabel}
    >
      {(
        [
          { mode: "week" as ProgressViewMode, label: weekLabel, aria: weekAriaLabel },
          { mode: "month" as ProgressViewMode, label: monthLabel, aria: monthAriaLabel },
        ] as const
      ).map(({ mode, label, aria }) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          aria-label={aria}
          onClick={() => onChange(mode)}
          className={cn(
            "rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-all",
            value === mode
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground/70 hover:text-muted-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
