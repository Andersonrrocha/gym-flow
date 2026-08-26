"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useApolloClient } from "@apollo/client/react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
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
    <>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-3 py-3.5 lg:hidden">
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
            <ArrowUp className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(item.id)}
            disabled={isLast}
            aria-label={t("moveDown")}
            className={`${actionBtnBase} hover:bg-muted hover:text-foreground active:scale-[0.98]`}
          >
            <ArrowDown className="size-3.5" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={t("removeExercise")}
          className={`${actionBtnBase} text-muted-foreground hover:bg-destructive/15 hover:text-destructive active:scale-[0.98]`}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
      <div className="hidden grid-cols-[3rem_minmax(0,1fr)_6.5rem_6.5rem_8rem] items-center gap-4 border-border border-b px-5 py-4 lg:grid">
        <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">{item.order.toString().padStart(2, "0")}</span>
        <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
        <input
          type="number"
          inputMode="numeric"
          value={localSets}
          onChange={(e) => setLocalSets(e.target.value)}
          onBlur={() => onBlurSets(item.id, localSets)}
          placeholder={t("setsPlaceholder")}
          className="h-9 w-full rounded-md border border-border bg-background px-2 text-center text-sm tabular-nums text-foreground outline-none transition-colors focus:border-primary"
          min={1}
          max={99}
          aria-label={t("setsLabel")}
        />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={localReps}
          onChange={(e) => setLocalReps(e.target.value)}
          onBlur={() => onBlurReps(item.id, localReps)}
          placeholder={t("repsPlaceholder")}
          className="h-9 w-full rounded-md border border-border bg-background px-2 text-center text-sm tabular-nums text-foreground outline-none transition-colors focus:border-primary"
          aria-label={t("repsLabel")}
        />
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => onMoveUp(item.id)} disabled={isFirst} aria-label={t("moveUp")} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30">
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => onMoveDown(item.id)} disabled={isLast} aria-label={t("moveDown")} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30">
            <ArrowDown className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => onRemove(item.id)} aria-label={t("removeExercise")} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </>
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
          <PageHeader
            href="/workouts"
            title={t("editTitle")}
            className="mb-3"
          />
          <p className="text-sm text-destructive">{t("saveError")}</p>
        </div>
      </main>
    );
  }

  const exercises = workout.exercises;
  const plannedSets = exercises.reduce(
    (total, exercise) => total + (exercise.plannedSets ?? 0),
    0,
  );

  return (
    <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col px-3 py-5 sm:px-5 lg:px-8 lg:py-9 xl:px-10">
        <div className="lg:hidden">
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
                    <Trash2 className="size-[22px]" strokeWidth={2} aria-hidden />
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
        </div>

        <header className="hidden items-end justify-between gap-6 lg:flex">
          <div>
            <p className="text-sm font-medium text-primary">{t("builderEyebrow")}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">{t("editTitle")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("editWorkoutDescription")}</p>
          </div>
          <ConfirmDialog
            trigger={
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/30 px-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10" aria-label={t("deleteWorkoutAria")}>
                <Trash2 className="size-4" aria-hidden />
                {t("deletePlan")}
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
        </header>

        <div className="mt-3 grid min-h-0 flex-1 gap-5 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
          <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card lg:overflow-hidden">
            <div className="px-3 pt-3 sm:px-4 lg:border-border lg:border-b lg:px-6 lg:py-5">
              <label htmlFor="workout-name" className="sr-only">{t("nameLabel")}</label>
              <input
                id="workout-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameBlur}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base font-semibold text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:text-xl"
                maxLength={100}
              />
              <p className="mt-1 hidden text-sm text-muted-foreground lg:block">{t("exerciseSequenceDescription")}</p>
            </div>

            <div className="mt-4 hidden grid-cols-[3rem_minmax(0,1fr)_6.5rem_6.5rem_8rem] gap-4 border-border border-b bg-muted/30 px-5 py-3 lg:grid">
              <span className="text-xs font-semibold text-muted-foreground">{t("orderColumn")}</span>
              <span className="text-xs font-semibold text-muted-foreground">{t("exerciseSequence")}</span>
              <span className="text-xs font-semibold text-muted-foreground">{t("setsColumn")}</span>
              <span className="text-xs font-semibold text-muted-foreground">{t("repsColumn")}</span>
              <span className="text-right text-xs font-semibold text-muted-foreground">{t("actionsColumn")}</span>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 px-3 pb-4 sm:px-4 lg:mt-0 lg:gap-0 lg:px-0 lg:pb-0">
              {exercises.length === 0 ? (
                <div className="flex min-h-64 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center lg:m-6">
                  <p className="text-base font-semibold text-foreground">{t("noExercisesTitle")}</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{t("noExercisesDescription")}</p>
                  <button type="button" onClick={() => setShowPicker(true)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                    <Plus className="size-4" aria-hidden />
                    {t("emptyStateCta")}
                  </button>
                </div>
              ) : (
                <>
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
                  <button type="button" onClick={() => setShowPicker(true)} className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 lg:mx-5 lg:mb-5 lg:mt-5 lg:w-auto lg:self-start lg:border-solid lg:px-3.5">
                    <Plus className="size-4" aria-hidden />
                    {t("addExerciseShort")}
                  </button>
                </>
              )}
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-7 rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground">{t("planOverview")}</p>
              <div className="mt-5 space-y-4 border-y border-border py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{t("plannedExercises", { count: exercises.length })}</span>
                  <strong className="text-2xl font-semibold tabular-nums text-foreground">{exercises.length}</strong>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{t("plannedSets", { count: plannedSets })}</span>
                  <strong className="text-2xl font-semibold tabular-nums text-foreground">{plannedSets}</strong>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">{t("sequenceHint")}</p>
            </div>
          </aside>
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
