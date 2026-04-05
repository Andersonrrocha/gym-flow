"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useApolloClient } from "@apollo/client/react";
import { ExercisePicker } from "@/components/workouts/ExercisePicker";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import {
  getWorkoutDetailsApi,
  updateWorkoutApi,
  addExerciseToWorkoutApi,
  removeWorkoutExerciseApi,
  updateWorkoutExerciseApi,
  reorderWorkoutExercisesApi,
  deleteWorkoutApi,
} from "@/lib/api/workout-api";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Workout, WorkoutExercise, Exercise } from "@/types/workouts";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

type ExerciseRowProps = {
  item: WorkoutExercise;
  isFirst: boolean;
  isLast: boolean;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onBlurSets: (id: string, value: string) => void;
  onBlurReps: (id: string, value: string) => void;
};

function ExerciseRow({
  item,
  isFirst,
  isLast,
  onRemove,
  onMoveUp,
  onMoveDown,
  onBlurSets,
  onBlurReps,
}: ExerciseRowProps) {
  const t = useTranslations("WorkoutBuilder");
  const tCatalog = useTranslations("Exercises.catalog");
  const displayName = resolveExerciseDisplayName(
    tCatalog,
    item.exercise.catalogKey,
    item.exercise.name,
  );

  const [localSets, setLocalSets] = useState(String(item.plannedSets ?? ""));
  const [localReps, setLocalReps] = useState(item.plannedReps ?? "");

  const planInputClass =
    "box-border h-9 w-10 shrink-0 rounded-md border border-border bg-background px-1 py-1.5 text-center text-sm tabular-nums leading-none text-foreground outline-none focus:border-primary sm:h-10 sm:w-10 sm:text-base sm:py-2";

  const actionBtnBase =
    "flex h-9 w-7 shrink-0 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors disabled:opacity-30 sm:h-10 sm:w-8 sm:text-base";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-3 py-3.5">
      <p className="min-w-0 text-sm font-semibold leading-snug text-foreground">
        {displayName}
      </p>

      <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 md:gap-4">
        <span className="flex h-9 min-w-6 shrink-0 items-center justify-center rounded-md bg-muted px-2 py-1 font-mono text-xs font-bold tabular-nums text-muted-foreground sm:h-10 sm:min-w-8 sm:px-1.5 sm:text-sm">
          {item.order}
        </span>

        <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground sm:gap-2 sm:text-[13px]">
          <span className="shrink-0">{t("setsLabel")}</span>
          <input
            type="number"
            inputMode="numeric"
            value={localSets}
            onChange={(e) => setLocalSets(e.target.value)}
            onBlur={() => onBlurSets(item.id, localSets)}
            placeholder={t("setsPlaceholder")}
            className={planInputClass}
            min={1}
            max={99}
          />
        </label>

        <span className="px-0.5 text-sm text-muted-foreground" aria-hidden>
          ×
        </span>

        <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground sm:gap-2 sm:text-[13px]">
          <span className="shrink-0">{t("repsLabel")}</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            onBlur={() => onBlurReps(item.id, localReps)}
            placeholder={t("repsPlaceholder")}
            className={planInputClass}
          />
        </label>

        <span
          className="mx-0.5 hidden h-8 w-px shrink-0 self-center bg-border sm:mx-1 sm:block"
          aria-hidden
        />

        <div className="flex shrink-0 items-center gap-px">
          <button
            type="button"
            onClick={() => onMoveUp(item.id)}
            disabled={isFirst}
            aria-label={t("moveUp")}
            className={`${actionBtnBase} hover:bg-muted hover:text-foreground active:scale-[0.98]`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(item.id)}
            disabled={isLast}
            aria-label={t("moveDown")}
            className={`${actionBtnBase} hover:bg-muted hover:text-foreground active:scale-[0.98]`}
          >
            ▼
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={t("removeExercise")}
          className={`${actionBtnBase} text-muted-foreground hover:bg-destructive/15 hover:text-destructive active:scale-[0.98]`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function BuilderEditPageContent({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("WorkoutBuilder");
  const client = useApolloClient();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [showPicker, setShowPicker] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const persistedNameRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getWorkoutDetailsApi(client, workoutId);
      if (cancelled) return;
      if (!data) {
        setLoadState("error");
        return;
      }
      setWorkout(data);
      setNameInput(data.name);
      persistedNameRef.current = data.name;
      setLoadState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [client, workoutId]);

  const handleNameBlur = useCallback(async () => {
    if (!workout) return;
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === persistedNameRef.current) return;

    const updated = await updateWorkoutApi(client, workout.id, {
      name: trimmed,
    });
    if (updated) {
      setWorkout(updated);
      persistedNameRef.current = updated.name;
      setNameInput(updated.name);
    }
  }, [client, nameInput, workout]);

  const handleAddExercise = useCallback(
    async (exercise: Exercise) => {
      if (!workout) return;
      setShowPicker(false);
      const updated = await addExerciseToWorkoutApi(
        client,
        workout.id,
        exercise.id,
        { plannedSets: 3, plannedReps: "8" },
      );
      if (updated) setWorkout(updated);
    },
    [client, workout],
  );

  const handleRemove = useCallback(
    async (workoutExerciseId: string) => {
      const updated = await removeWorkoutExerciseApi(client, workoutExerciseId);
      if (updated) setWorkout(updated);
    },
    [client],
  );

  const handleMoveUp = useCallback(
    async (workoutExerciseId: string) => {
      if (!workout) return;
      const ids = workout.exercises.map((e) => e.id);
      const idx = ids.indexOf(workoutExerciseId);
      if (idx <= 0) return;
      const newIds = [...ids];
      [newIds[idx - 1], newIds[idx]] = [newIds[idx], newIds[idx - 1]];
      const updated = await reorderWorkoutExercisesApi(
        client,
        workout.id,
        newIds,
      );
      if (updated) setWorkout(updated);
    },
    [client, workout],
  );

  const handleMoveDown = useCallback(
    async (workoutExerciseId: string) => {
      if (!workout) return;
      const ids = workout.exercises.map((e) => e.id);
      const idx = ids.indexOf(workoutExerciseId);
      if (idx >= ids.length - 1) return;
      const newIds = [...ids];
      [newIds[idx], newIds[idx + 1]] = [newIds[idx + 1], newIds[idx]];
      const updated = await reorderWorkoutExercisesApi(
        client,
        workout.id,
        newIds,
      );
      if (updated) setWorkout(updated);
    },
    [client, workout],
  );

  const handleBlurSets = useCallback(
    async (workoutExerciseId: string, value: string) => {
      const num = parseInt(value, 10);
      if (!num || num < 1) return;
      const current = workout?.exercises.find(
        (e) => e.id === workoutExerciseId,
      );
      if (current?.plannedSets === num) return;
      const updated = await updateWorkoutExerciseApi(
        client,
        workoutExerciseId,
        {
          plannedSets: num,
        },
      );
      if (updated) setWorkout(updated);
    },
    [client, workout],
  );

  const handleBlurReps = useCallback(
    async (workoutExerciseId: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      const current = workout?.exercises.find(
        (e) => e.id === workoutExerciseId,
      );
      if (current?.plannedReps === trimmed) return;
      const updated = await updateWorkoutExerciseApi(
        client,
        workoutExerciseId,
        {
          plannedReps: trimmed,
        },
      );
      if (updated) setWorkout(updated);
    },
    [client, workout],
  );

  const handleConfirmDeleteWorkout = useCallback(async () => {
    if (!workout) return;
    setDeleteError(null);
    const ok = await deleteWorkoutApi(client, workout.id);
    if (!ok) {
      setDeleteError(t("deleteWorkoutError"));
      throw new Error("delete failed");
    }
    router.push(`/${locale}/workouts`);
  }, [client, locale, router, t, workout]);

  if (loadState === "loading") {
    return (
      <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col bg-background">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-5 sm:px-4 lg:max-w-3xl">
          <p className="text-sm text-muted-foreground animate-pulse">
            {t("pickerLoading")}
          </p>
        </div>
      </main>
    );
  }

  if (loadState === "error" || !workout) {
    return (
      <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col bg-background">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-5 sm:px-4 lg:max-w-3xl">
          <PageHeader href="/workouts" title={t("editTitle")} className="mb-3" />
          <p className="text-sm text-destructive">{t("saveError")}</p>
        </div>
      </main>
    );
  }

  const exercises = workout.exercises;

  return (
    <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-3 py-5 sm:px-4 lg:max-w-3xl">
        <PageHeader
          href="/workouts"
          title={t("editTitle")}
          className="mb-3 shrink-0"
          right={
            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"
                  aria-label={t("deleteWorkoutAria")}
                >
                  <TrashIcon />
                </button>
              }
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                setDeleteDialogOpen(open);
                setDeleteError(null);
              }}
              title={t("deleteWorkoutAria")}
              description={t("deleteWorkoutConfirm")}
              confirmLabel={t("deleteConfirmButton")}
              cancelLabel={t("pickerCancel")}
              loadingLabel={t("deletingWorkout")}
              variant="destructive"
              errorMessage={deleteError}
              onConfirm={handleConfirmDeleteWorkout}
            />
          }
        />

        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={handleNameBlur}
          placeholder={t("namePlaceholder")}
          className="mt-3 w-full shrink-0 rounded-lg border border-border bg-card px-3 py-3 text-base font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          maxLength={100}
        />

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 pb-4">
          {exercises.length === 0 ? (
            <div className="flex w-full flex-col">
              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center sm:py-8">
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {t("emptyState")}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="w-full max-w-xs rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.99]"
                >
                  {t("emptyStateCta")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              {exercises.map((item, idx) => (
                <ExerciseRow
                  key={`${item.id}-${String(item.plannedSets ?? "")}-${item.plannedReps ?? ""}`}
                  item={item}
                  isFirst={idx === 0}
                  isLast={idx === exercises.length - 1}
                  onRemove={handleRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onBlurSets={handleBlurSets}
                  onBlurReps={handleBlurReps}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="mt-1 self-start text-sm font-medium text-primary hover:underline"
              >
                + {t("addExercise")}
              </button>
            </div>
          )}
        </div>
      </div>

      {showPicker && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </main>
  );
}

export default function BuilderEditPage() {
  const params = useParams();
  const workoutId = Array.isArray(params.workoutId)
    ? params.workoutId[0]
    : (params.workoutId as string);
  return <BuilderEditPageContent key={workoutId} workoutId={workoutId} />;
}
