"use client";

import { cn } from "@/lib/utils";
import type { SessionExercise } from "@/types/workouts";
import { SetRow } from "./set-row";

type ExerciseRowProps = {
  exercise: SessionExercise;
  isActive: boolean;
  onToggleSet?: (setId: string) => void;
  onUpdateWeight?: (setId: string, weight: number) => void;
  onUpdateReps?: (setId: string, reps: number) => void;
  onAddSet?: (exerciseId: string) => void;
  className?: string;
};

export function ExerciseRow({
  exercise,
  isActive,
  onToggleSet,
  onUpdateWeight,
  onUpdateReps,
  onAddSet,
  className,
}: ExerciseRowProps) {
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        isActive
          ? "border-primary/30 bg-card"
          : "border-transparent bg-card/50",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {exercise.nameSnapshot}
        </h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
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
              onToggle={onToggleSet}
              onUpdateWeight={onUpdateWeight}
              onUpdateReps={onUpdateReps}
            />
          ))}

          <button
            onClick={() => onAddSet?.(exercise.id)}
            className="mt-1 text-xs font-medium text-primary hover:underline"
          >
            + Add Set
          </button>
        </div>
      )}
    </div>
  );
}
