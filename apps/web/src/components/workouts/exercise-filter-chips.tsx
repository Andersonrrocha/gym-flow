"use client";

import { cn } from "@/lib/utils";

type ExerciseFilterChipsProps = {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  className?: string;
};

export function ExerciseFilterChips({
  options,
  selected,
  onSelect,
  className,
}: ExerciseFilterChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          !selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80",
        )}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt === selected ? null : opt)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
            opt === selected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
