"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import type { WorkoutExercise } from "@/types/workouts";

type WorkoutBuilderItemProps = {
  item: WorkoutExercise;
  onRemove?: (id: string) => void;
  className?: string;
};

export function WorkoutBuilderItem({
  item,
  onRemove,
  className,
}: WorkoutBuilderItemProps) {
  const tCatalog = useTranslations("Exercises.catalog");
  const title = resolveExerciseDisplayName(
    tCatalog,
    item.exercise.catalogKey,
    item.exercise.name,
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5",
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted font-mono text-[10px] font-bold text-muted-foreground">
        {item.order}
      </span>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {item.plannedSets} × {item.plannedReps}
          {item.restSeconds ? ` · ${item.restSeconds}s rest` : ""}
        </p>
      </div>

      {onRemove && (
        <button
          onClick={() => onRemove(item.id)}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
