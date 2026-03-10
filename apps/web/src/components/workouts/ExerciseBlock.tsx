"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { SessionExercise } from "@/types/workouts";
import { SetRow } from "./set-row";

type ExerciseBlockProps = {
  exercise: SessionExercise;
  isActive: boolean;
  isCompleted: boolean;
  onSelect?: () => void;
  onOpenHistory?: (exerciseId: string, exerciseName: string) => void;
  onToggleSet?: (setId: string) => void;
  onUpdateWeight?: (setId: string, weight: number) => void;
  onUpdateReps?: (setId: string, reps: number) => void;
  onRemoveSet?: (setId: string) => void;
  onAddSet?: (exerciseId: string) => void;
  onComplete?: (exerciseId: string) => void;
  addSetLabel?: string;
  removeSetLabel?: string;
  historyLabel?: string;
  completeLabel?: string;
  completedLabel?: string;
  className?: string;
};

export function ExerciseBlock({
  exercise,
  isActive,
  isCompleted,
  onSelect,
  onOpenHistory,
  onToggleSet,
  onUpdateWeight,
  onUpdateReps,
  onRemoveSet,
  onAddSet,
  onComplete,
  addSetLabel = "+ Add Set",
  removeSetLabel = "Remove set",
  historyLabel = "History",
  completeLabel = "Complete Exercise",
  completedLabel = "Completed",
  className,
}: ExerciseBlockProps) {
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const allSetsCompleted = totalSets > 0 && completedSets === totalSets;

  return (
    <motion.div
      className={cn(
        "cursor-pointer rounded-xl border p-3 transition-colors",
        isActive && isCompleted
          ? "border-primary/40 bg-success/10 ring-1 ring-primary/20"
          : isCompleted
            ? "border-success/30 bg-success/5"
            : isActive
            ? "border-primary/30 bg-card"
            : "border-transparent bg-card/50",
        className,
      )}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      layout
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-bold tracking-tight",
            isCompleted ? "text-success" : "text-foreground",
          )}
        >
          {isCompleted && "✓ "}
          {exercise.nameSnapshot}
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenHistory?.(exercise.exerciseId, exercise.nameSnapshot);
          }}
          className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          {historyLabel}
        </button>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
          {completedSets}/{totalSets}
        </span>
      </div>

      {exercise.plannedReps && (
        <p className="mb-2 text-[11px] text-muted-foreground">
          {exercise.plannedSets} × {exercise.plannedReps}
        </p>
      )}

      {isActive && (
        <div className="flex flex-col gap-1.5">
          {exercise.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              canRemove={exercise.sets.length > 1}
              removeLabel={removeSetLabel}
              onToggle={onToggleSet}
              onRemove={onRemoveSet}
              onUpdateWeight={onUpdateWeight}
              onUpdateReps={onUpdateReps}
            />
          ))}

          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => onAddSet?.(exercise.id)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {addSetLabel}
            </button>

            {allSetsCompleted && !isCompleted && (
              <button
                onClick={() => onComplete?.(exercise.id)}
                className="rounded-md bg-success px-3 py-1 text-xs font-semibold text-success-foreground transition-all hover:brightness-110 active:scale-[0.97]"
              >
                {completeLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {isCompleted && !isActive && (
        <p className="text-[11px] font-medium text-success/70">
          {completedLabel}
        </p>
      )}
    </motion.div>
  );
}
