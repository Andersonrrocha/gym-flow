"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { SessionSet } from "@/types/workouts";

type SetRowProps = {
  set: SessionSet;
  onToggle?: (setId: string) => void;
  onUpdateWeight?: (setId: string, weight: number) => void;
  onUpdateReps?: (setId: string, reps: number) => void;
};

export function SetRow({
  set,
  onToggle,
  onUpdateWeight,
  onUpdateReps,
}: SetRowProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
        set.completed ? "bg-primary/10" : "bg-muted/40",
      )}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <span className="w-6 text-center font-mono text-xs font-bold tabular-nums text-muted-foreground">
        {set.setNumber}
      </span>

      <input
        type="number"
        inputMode="decimal"
        value={set.weight || ""}
        onChange={(e) =>
          onUpdateWeight?.(set.id, parseFloat(e.target.value) || 0)
        }
        className="h-8 w-16 rounded-md border border-border bg-background px-2 text-center font-mono text-sm tabular-nums text-foreground outline-none focus:border-primary"
        placeholder="kg"
      />

      <span className="text-xs text-muted-foreground">×</span>

      <input
        type="number"
        inputMode="numeric"
        value={set.reps || ""}
        onChange={(e) =>
          onUpdateReps?.(set.id, parseInt(e.target.value) || 0)
        }
        className="h-8 w-14 rounded-md border border-border bg-background px-2 text-center font-mono text-sm tabular-nums text-foreground outline-none focus:border-primary"
        placeholder="reps"
      />

      <button
        onClick={() => onToggle?.(set.id)}
        className={cn(
          "ml-auto flex h-7 w-7 items-center justify-center rounded-md border text-xs transition-all",
          set.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:border-primary/50",
        )}
      >
        {set.completed ? "✓" : ""}
      </button>
    </motion.div>
  );
}
