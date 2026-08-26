"use client";

import { Pencil, Play } from "lucide-react";
import type { Workout } from "@/types/workouts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  dominantMuscleGroup,
  muscleGroupCssVar,
} from "@/lib/muscle-group-color";

type WorkoutListItemProps = {
  workout: Workout;
  exercisesLabel: string;
  startLabel: string;
  startingLabel: string;
  editLabel: string;
  isStarting?: boolean;
  disableStart?: boolean;
  onStart: () => void;
  onEdit: () => void;
};

export function WorkoutListItem({
  workout,
  exercisesLabel,
  startLabel,
  startingLabel,
  editLabel,
  isStarting,
  disableStart,
  onStart,
  onEdit,
}: WorkoutListItemProps) {
  const dominant = dominantMuscleGroup(
    workout.exercises.map((we) => we.exercise.muscleGroup),
  );
  const stripColor = muscleGroupCssVar(dominant);

  return (
    <li
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card pr-3 transition-colors hover:border-border-strong",
      )}
    >
      <span
        aria-hidden
        className="block w-1.5 self-stretch shrink-0"
        style={{ background: stripColor }}
      />
      <div className="min-w-0 flex-1 py-3">
        <p className="truncate font-display text-base font-semibold text-foreground">
          {workout.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {exercisesLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={editLabel}
          title={editLabel}
          onClick={onEdit}
        >
          <Pencil className="size-4" strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type="button"
          variant="default"
          size="md"
          onClick={onStart}
          disabled={disableStart}
          loading={isStarting}
        >
          <Play className="size-4" aria-hidden />
          <span>{isStarting ? startingLabel : startLabel}</span>
        </Button>
      </div>
    </li>
  );
}
