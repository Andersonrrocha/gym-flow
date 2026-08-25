"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SessionExercise } from "@/types/workouts";
import { SetRow } from "./set-row";
import { Check, ChevronDown, History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptic";
import { useUnits } from "@/lib/units/context";
import { kgToDisplay } from "@/lib/units/convert";

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
  setUnitReps = "reps",
  setWeightDownAria = "Decrease weight",
  setWeightUpAria = "Increase weight",
  setRepsDownAria = "Decrease reps",
  setRepsUpAria = "Increase reps",
  className,
}: ExerciseBlockProps) {
  const tCatalog = useTranslations("Exercises.catalog");
  const reduced = useReducedMotion();
  const { unit } = useUnits();
  const displayName = resolveExerciseDisplayName(
    tCatalog,
    exercise.exerciseCatalogKey,
    exercise.nameSnapshot,
  );
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const allSetsCompleted = totalSets > 0 && completedSets === totalSets;
  const lastCompleted = [...exercise.sets].reverse().find((s) => s.completed);

  const panelVariants = reduced
    ? {
        open: { height: "auto" as const, opacity: 1 },
        closed: { height: 0, opacity: 0 },
      }
    : {
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

  const handleComplete = () => {
    haptic("success");
    onComplete?.(exercise.id);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-3 transition-[border-color,box-shadow,background-color] duration-200 ease-out",
        isCompleted
          ? "border-success/40 bg-success-soft"
          : isActive
            ? "border-primary/50 bg-card shadow-sm ring-2 ring-primary/15"
            : "cursor-pointer border-border/40 bg-card/60 hover:border-border-strong",
        className,
      )}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-expanded={isActive}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span
                aria-hidden
                className="inline-flex size-5 items-center justify-center rounded-full bg-success text-success-foreground"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : null}
            <h3
              className={cn(
                "min-w-0 flex-1 truncate font-display text-base font-semibold tracking-tight",
                isCompleted ? "text-success" : "text-foreground",
              )}
            >
              {displayName}
            </h3>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px]">
            <span
              className={cn(
                "font-mono font-semibold tabular-nums",
                allSetsCompleted ? "text-success" : "text-muted-foreground",
              )}
            >
              {completedSets}/{totalSets}
            </span>
            {exercise.plannedReps ? (
              <>
                <span aria-hidden className="text-muted-foreground/50">
                  ·
                </span>
                <span className="text-muted-foreground">
                  {exercise.plannedSets} × {exercise.plannedReps}
                </span>
              </>
            ) : null}
            {!isActive && lastCompleted ? (
              <>
                <span aria-hidden className="text-muted-foreground/50">
                  ·
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {kgToDisplay(lastCompleted.weight, unit)}
                  {unit} × {lastCompleted.reps}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenHistory?.(exercise.exerciseId, displayName);
          }}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft hover:text-primary"
          aria-label={historyLabel}
          title={historyLabel}
        >
          <History className="size-4" strokeWidth={2} aria-hidden />
        </button>
        <span
          aria-hidden
          className={cn(
            "ml-1 shrink-0 text-muted-foreground transition-transform duration-200",
            isActive ? "rotate-180" : "rotate-0",
          )}
        >
          <ChevronDown className="size-4" strokeWidth={2} />
        </span>
      </div>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="active-panel"
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden"
          >
            <div
              role="presentation"
              className="mt-3 flex flex-col gap-2"
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
                  repsUnitLabel={setUnitReps}
                  weightDecreaseAria={setWeightDownAria}
                  weightIncreaseAria={setWeightUpAria}
                  repsDecreaseAria={setRepsDownAria}
                  repsIncreaseAria={setRepsUpAria}
                  motionDelay={reduced ? 0 : index * 0.04}
                />
              ))}

              <div className="mt-1 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddSet?.(exercise.id)}
                  className="text-primary hover:bg-primary-soft hover:text-primary"
                >
                  <Plus className="size-3.5" strokeWidth={2.4} aria-hidden />
                  <span>{addSetLabel}</span>
                </Button>

                {allSetsCompleted && !isCompleted && (
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    onClick={handleComplete}
                  >
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    <span>{completeLabel}</span>
                  </Button>
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
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={reduced ? false : { opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-1 text-[11px] font-medium text-success/80"
          >
            {completedLabel}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
