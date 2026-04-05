"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { SessionSet } from "@/types/workouts";

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M18 15l-6-6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const noSpinnerClass =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

type NumericStepFieldProps = {
  value: number;
  onChange: (n: number) => void;
  step: number;
  inputMode: "decimal" | "numeric";
  unit: string;
  ariaDecrease: string;
  ariaIncrease: string;
  completed: boolean;
  inputWidthClass?: string;
};

const valueTypography =
  "font-mono text-base font-semibold tabular-nums leading-none sm:text-sm";

function NumericStepField({
  value,
  onChange,
  step,
  inputMode,
  unit,
  ariaDecrease,
  ariaIncrease,
  completed,
  inputWidthClass = "w-[3.5ch]",
}: NumericStepFieldProps) {
  const base = value || 0;

  const bump = (delta: number) => {
    if (inputMode === "decimal") {
      const next = Math.round((base + delta) * 2) / 2;
      onChange(Math.max(0, next));
    } else {
      onChange(Math.max(0, Math.round(base + delta)));
    }
  };

  const display = value === 0 ? "" : String(value);

  const valueColor = completed ? "text-success" : "text-foreground";
  const stepperColor = completed
    ? "text-success hover:bg-success/15 active:bg-success/25"
    : "text-primary hover:bg-primary/15 active:bg-primary/25";

  return (
    <div
      className={cn(
        "flex h-7 shrink-0 items-stretch overflow-hidden rounded-md border bg-background transition-colors sm:h-8",
        completed
          ? "border-success/40 focus-within:border-success focus-within:ring-1 focus-within:ring-success/35"
          : "border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 px-1 sm:gap-1 sm:px-1.5">
        <input
          type="number"
          inputMode={inputMode}
          value={display}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(0);
              return;
            }
            const n =
              inputMode === "decimal" ? parseFloat(raw) : parseInt(raw, 10);
            if (Number.isNaN(n)) return;
            onChange(Math.max(0, n));
          }}
          className={cn(
            noSpinnerClass,
            inputWidthClass,
            "min-w-0 shrink-0 border-0 bg-transparent py-0 text-center outline-none",
            valueTypography,
            valueColor,
          )}
        />
        <span
          className={cn(
            "pointer-events-none shrink-0 select-none",
            valueTypography,
            valueColor,
          )}
        >
          {unit}
        </span>
      </div>
      <div
        className={cn(
          "flex w-6 shrink-0 flex-col sm:w-7",
          completed
            ? "divide-y divide-success/25 border-l border-success/25"
            : "divide-y divide-border/80 border-l border-border/80",
        )}
      >
        <button
          type="button"
          onClick={() => bump(step)}
          className={cn(
            "flex flex-1 items-center justify-center transition-colors",
            stepperColor,
          )}
          aria-label={ariaIncrease}
        >
          <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => bump(-step)}
          className={cn(
            "flex flex-1 items-center justify-center transition-colors",
            stepperColor,
          )}
          aria-label={ariaDecrease}
        >
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>
    </div>
  );
}

type SetRowProps = {
  set: SessionSet;
  canRemove?: boolean;
  removeLabel?: string;
  onToggle?: (setId: string) => void;
  onRemove?: (setId: string) => void;
  onUpdateWeight?: (setId: string, weight: number) => void;
  onUpdateReps?: (setId: string, reps: number) => void;
  weightUnitLabel?: string;
  repsUnitLabel?: string;
  weightDecreaseAria?: string;
  weightIncreaseAria?: string;
  repsDecreaseAria?: string;
  repsIncreaseAria?: string;
  motionDelay?: number;
};

export function SetRow({
  set,
  canRemove = true,
  removeLabel = "Remove set",
  onToggle,
  onRemove,
  onUpdateWeight,
  onUpdateReps,
  weightUnitLabel = "kg",
  repsUnitLabel = "reps",
  weightDecreaseAria = "Decrease weight",
  weightIncreaseAria = "Increase weight",
  repsDecreaseAria = "Decrease reps",
  repsIncreaseAria = "Increase reps",
  motionDelay = 0,
}: SetRowProps) {
  return (
    <motion.div
      className={cn(
        "flex min-w-0 items-center gap-1 rounded-md px-1 py-1.5 transition-colors sm:gap-2 sm:px-2 sm:py-2 md:gap-3 md:px-3",
        set.completed ? "bg-success/10" : "bg-muted/40",
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: motionDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <span
        className={cn(
          "w-4 shrink-0 text-center font-mono text-[10px] font-bold tabular-nums sm:w-5 sm:text-xs md:w-6",
          set.completed ? "text-success" : "text-muted-foreground",
        )}
      >
        {set.setNumber}
      </span>

      <NumericStepField
        value={set.weight}
        onChange={(n) => onUpdateWeight?.(set.id, n)}
        step={0.5}
        inputMode="decimal"
        unit={weightUnitLabel}
        ariaDecrease={weightDecreaseAria}
        ariaIncrease={weightIncreaseAria}
        completed={set.completed}
        inputWidthClass="w-[4ch]"
      />

      <span
        className={cn(
          "shrink-0 px-0.5 text-[10px] sm:text-xs",
          set.completed ? "text-success/80" : "text-muted-foreground",
        )}
      >
        ×
      </span>

      <NumericStepField
        value={set.reps}
        onChange={(n) => onUpdateReps?.(set.id, n)}
        step={1}
        inputMode="numeric"
        unit={repsUnitLabel}
        ariaDecrease={repsDecreaseAria}
        ariaIncrease={repsIncreaseAria}
        completed={set.completed}
        inputWidthClass="w-[2.25ch] sm:w-[2.5ch]"
      />

      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove?.(set.id)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-[10px] text-muted-foreground transition-all hover:border-destructive/50 hover:text-destructive sm:h-7 sm:w-7 sm:text-[11px]"
          aria-label={removeLabel}
          title={removeLabel}
        >
          -
        </button>
      )}

      <button
        type="button"
        onClick={() => onToggle?.(set.id)}
        aria-label={set.completed ? "Unmark set" : "Complete set"}
        className={cn(
          "ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] transition-all sm:h-7 sm:w-7 sm:text-xs",
          set.completed
            ? "border-success bg-success text-success-foreground"
            : "border-border text-muted-foreground hover:border-primary/50",
        )}
      >
        {set.completed ? "✓" : ""}
      </button>
    </motion.div>
  );
}
