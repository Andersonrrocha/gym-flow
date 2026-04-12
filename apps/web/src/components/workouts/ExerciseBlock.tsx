"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import { AnimatePresence, motion } from "motion/react";
import type { SessionExercise } from "@/types/workouts";
import { SetRow } from "./set-row";
import { Clock } from "lucide-react";

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
  setUnitKg?: string;
  setUnitReps?: string;
  setWeightDownAria?: string;
  setWeightUpAria?: string;
  setRepsDownAria?: string;
  setRepsUpAria?: string;
  className?: string;
};

function stopProp(e: React.MouseEvent | React.KeyboardEvent) {
  e.stopPropagation();
}

const activePanelVariants = {
  open: {
    height: "auto" as const,
    opacity: 1,
    transition: {
      height: {
        type: "spring" as const,
        stiffness: 400,
        damping: 36,
        mass: 0.9,
      },
      opacity: { duration: 0.22, ease: "easeOut" as const },
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.26, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.14, ease: "easeIn" as const },
    },
  },
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
  setUnitKg = "kg",
  setUnitReps = "reps",
  setWeightDownAria = "Decrease weight",
  setWeightUpAria = "Increase weight",
  setRepsDownAria = "Decrease reps",
  setRepsUpAria = "Increase reps",
  className,
}: ExerciseBlockProps) {
  const tCatalog = useTranslations("Exercises.catalog");
  const displayName = resolveExerciseDisplayName(
    tCatalog,
    exercise.exerciseCatalogKey,
    exercise.nameSnapshot,
  );
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const allSetsCompleted = totalSets > 0 && completedSets === totalSets;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-[border-color,box-shadow,background-color] duration-200 ease-out",
        isCompleted
          ? "border-success/30 bg-success/5"
          : isActive
            ? "border-primary/40 bg-card ring-2 ring-primary/20 shadow-sm"
            : "cursor-pointer border-transparent bg-card/50 hover:border-border/50",
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
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3
          className={cn(
            "min-w-0 flex-1 truncate font-bold tracking-tight",
            isActive ? "text-sm" : "text-sm",
            isCompleted ? "text-success" : "text-foreground",
          )}
        >
          {isCompleted && "✓ "}
          {displayName}
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenHistory?.(exercise.exerciseId, displayName);
          }}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-primary transition-colors hover:border-primary/50 hover:bg-primary/10"
          aria-label={historyLabel}
          title={historyLabel}
        >
          <Clock className="size-4" strokeWidth={2} aria-hidden />
        </button>
        <span
          className={cn(
            "shrink-0 font-mono text-[11px] tabular-nums",
            allSetsCompleted && totalSets > 0
              ? "font-semibold text-success"
              : "text-muted-foreground",
          )}
        >
          {completedSets}/{totalSets}
        </span>
      </div>

      {exercise.plannedReps && (
        <p className="mb-2 text-[11px] text-muted-foreground">
          {exercise.plannedSets} × {exercise.plannedReps}
        </p>
      )}

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="active-panel"
            variants={activePanelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden"
          >
            <div
              role="presentation"
              className="flex flex-col gap-1.5 pt-1"
              onClick={stopProp}
              onKeyDown={stopProp}
            >
              {exercise.sets.map((set, index) => (
                <SetRow
                  key={set.id}
                  set={set}
                  canRemove={exercise.sets.length > 1}
                  removeLabel={removeSetLabel}
                  onToggle={onToggleSet}
                  onRemove={onRemoveSet}
                  onUpdateWeight={onUpdateWeight}
                  onUpdateReps={onUpdateReps}
                  weightUnitLabel={setUnitKg}
                  repsUnitLabel={setUnitReps}
                  weightDecreaseAria={setWeightDownAria}
                  weightIncreaseAria={setWeightUpAria}
                  repsDecreaseAria={setRepsDownAria}
                  repsIncreaseAria={setRepsUpAria}
                  motionDelay={index * 0.04}
                />
              ))}

              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onAddSet?.(exercise.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {addSetLabel}
                </button>

                {allSetsCompleted && !isCompleted && (
                  <button
                    type="button"
                    onClick={() => onComplete?.(exercise.id)}
                    className="rounded-md bg-success px-3 py-1 text-xs font-semibold text-success-foreground transition-all hover:brightness-110 active:scale-[0.97]"
                  >
                    {completeLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isCompleted && !isActive && (
          <motion.p
            key="completed-hint"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="text-[11px] font-medium text-success/70"
          >
            {completedLabel}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
