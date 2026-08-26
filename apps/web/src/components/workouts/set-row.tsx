"use client";

import { Check, ChevronDown, ChevronUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { SessionSet } from "@/types/workouts";
import { haptic } from "@/lib/haptic";
import { useUnits } from "@/lib/units/context";
import { displayToKg, kgToDisplay } from "@/lib/units/convert";

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

  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-stretch overflow-hidden rounded-xl border bg-background transition-colors",
        completed
          ? "border-success/40 focus-within:border-success focus-within:ring-2 focus-within:ring-success/30"
          : "border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-2">
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
            "min-w-0 shrink-0 border-0 bg-transparent py-0 text-center font-display text-lg font-bold tabular-nums leading-none outline-none",
            completed ? "text-success" : "text-foreground",
          )}
        />
        <span
          className={cn(
            "pointer-events-none shrink-0 select-none text-[11px] font-semibold uppercase tracking-wider",
            completed ? "text-success/80" : "text-muted-foreground",
          )}
        >
          {unit}
        </span>
      </div>
      <div
        className={cn(
          "flex w-9 shrink-0 flex-col border-l",
          completed
            ? "divide-y divide-success/30 border-success/30"
            : "divide-y divide-border border-border",
        )}
      >
        <button
          type="button"
          onClick={() => bump(step)}
          className={cn(
            "flex flex-1 items-center justify-center transition-colors",
            completed
              ? "text-success hover:bg-success/15"
              : "text-primary hover:bg-primary/10",
          )}
          aria-label={ariaIncrease}
        >
          <ChevronUp className="size-4" strokeWidth={2.4} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => bump(-step)}
          className={cn(
            "flex flex-1 items-center justify-center transition-colors",
            completed
              ? "text-success hover:bg-success/15"
              : "text-primary hover:bg-primary/10",
          )}
          aria-label={ariaDecrease}
        >
          <ChevronDown className="size-4" strokeWidth={2.4} aria-hidden />
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
  repsUnitLabel = "reps",
  weightDecreaseAria = "Decrease weight",
  weightIncreaseAria = "Increase weight",
  repsDecreaseAria = "Decrease reps",
  repsIncreaseAria = "Increase reps",
  motionDelay = 0,
}: SetRowProps) {
  const reduced = useReducedMotion();
  const { unit } = useUnits();
  const displayedWeight = kgToDisplay(set.weight, unit);
  const handleWeightChange = (next: number) => {
    onUpdateWeight?.(set.id, displayToKg(next, unit));
  };

  return (
    <motion.div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border px-2 py-2 transition-colors sm:gap-3 sm:px-3",
        set.completed
          ? "border-success/30 bg-success-soft"
          : "border-transparent bg-muted/40",
      )}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={reduced ? false : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: reduced ? 0 : motionDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <span
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold tabular-nums",
          set.completed
            ? "bg-success/20 text-success"
            : "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        {set.setNumber}
      </span>

      <NumericStepField
        value={displayedWeight}
        onChange={handleWeightChange}
        step={unit === "kg" ? 0.5 : 1}
        inputMode="decimal"
        unit={unit}
        ariaDecrease={weightDecreaseAria}
        ariaIncrease={weightIncreaseAria}
        completed={set.completed}
        inputWidthClass="w-[4ch]"
      />

      <span
        className={cn(
          "shrink-0 text-base font-semibold",
          set.completed ? "text-success/70" : "text-muted-foreground",
        )}
        aria-hidden
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
        inputWidthClass="w-[2.75ch]"
      />

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove?.(set.id)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:bg-destructive-soft hover:text-destructive"
            aria-label={removeLabel}
            title={removeLabel}
          >
            <Minus className="size-4" strokeWidth={2.4} aria-hidden />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (!set.completed) haptic("success");
            onToggle?.(set.id);
          }}
          aria-label={set.completed ? "Unmark set" : "Complete set"}
          aria-pressed={set.completed}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-[0.94]",
            set.completed
              ? "border-success bg-success text-success-foreground shadow-md"
              : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary",
          )}
        >
          <Check
            className={cn("size-4 transition-transform", {
              "scale-100": set.completed,
              "scale-0": !set.completed,
            })}
            strokeWidth={3}
            aria-hidden
          />
        </button>
      </div>
    </motion.div>
  );
}
