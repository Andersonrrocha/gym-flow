"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { WorkoutHeader } from "@/components/workouts/workout-header";
import { WorkoutProgress } from "@/components/workouts/WorkoutProgress";
import { ExerciseBlock } from "@/components/workouts/ExerciseBlock";
import { ExerciseHistoryModal } from "@/components/workouts/ExerciseHistoryModal";
import { PrimaryButton } from "@/components/workouts/primary-button";
import {
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  saveWorkoutSession,
  getWorkoutSessions,
} from "@/lib/session-storage";
import {
  deriveExerciseHistory,
  type ExerciseHistoryData,
} from "@/lib/workout-metrics";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import { normalizeSession } from "@/lib/session-normalize";
import { reconcileActiveSession } from "@/lib/session-reconcile";
import {
  finishWorkoutSessionApi,
  getWorkoutSessionByIdApi,
  listUserSessionsApi,
  logSessionSetApi,
  mergeRemoteAndLocalSessions,
} from "@/lib/api/session-api";
import type { WorkoutSession } from "@/types/workouts";

const PLACEHOLDER_SESSION: WorkoutSession = {
  id: "",
  workoutId: "",
  workoutName: null,
  status: "IN_PROGRESS",
  startedAt: new Date(0).toISOString(),
  finishedAt: null,
  exercises: [],
};

export default function ActiveWorkoutPage() {
  const t = useTranslations("WorkoutActive");
  const tCatalog = useTranslations("Exercises.catalog");
  const locale = useLocale();
  const router = useRouter();
  const client = useApolloClient();

  const [session, setSession] = useState<WorkoutSession>(PLACEHOLDER_SESSION);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [sessionReconciled, setSessionReconciled] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    data: ExerciseHistoryData | null;
  }>({ isOpen: false, data: null });

  const handleOpenHistory = useCallback(
    async (exerciseId: string, exerciseName: string) => {
      const local = getWorkoutSessions();
      const remote = await listUserSessionsApi(client, "COMPLETED");
      const sessions = mergeRemoteAndLocalSessions(remote, local);
      const data = deriveExerciseHistory(exerciseId, exerciseName, sessions);
      setHistoryModal({ isOpen: true, data });
    },
    [client],
  );

  const handleCloseHistory = useCallback(() => {
    setHistoryModal({ isOpen: false, data: null });
  }, []);

  useEffect(() => {
    const storedSession = getActiveSession();
    if (storedSession) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe localStorage hydration
      setSession(normalizeSession(storedSession));
    }
    setSessionHydrated(true);
  }, []);

  useEffect(() => {
    if (!sessionHydrated || sessionReconciled) return;

    const stored = getActiveSession();
    let cancelled = false;

    if (!stored?.backendSynced) {
      queueMicrotask(() => setSessionReconciled(true));
      return;
    }

    queueMicrotask(() => setSessionReconciled(true));

    void (async () => {
      const remote = await getWorkoutSessionByIdApi(client, stored.id);
      if (!cancelled && remote) {
        setSession((prev) => reconcileActiveSession(prev, remote));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionHydrated, sessionReconciled, client]);

  useEffect(() => {
    if (!sessionHydrated) return;
    saveActiveSession(normalizeSession(session));
  }, [session, sessionHydrated]);

  const autoActiveIndex = useMemo(() => {
    const idx = session.exercises.findIndex((ex) => !ex.completed);
    return idx === -1 ? session.exercises.length - 1 : idx;
  }, [session.exercises]);

  useEffect(() => {
    if (session.exercises.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync derived state after hydration
      setSelectedExerciseId(null);
      return;
    }

    const hasSelected = selectedExerciseId
      ? session.exercises.some((ex) => ex.id === selectedExerciseId)
      : false;

    if (hasSelected) return;

    const fallbackExercise =
      session.exercises.find((ex) => !ex.completed) ?? session.exercises[0];
    setSelectedExerciseId(fallbackExercise.id);
  }, [session.exercises, selectedExerciseId]);

  const activeExerciseId =
    selectedExerciseId ?? session.exercises[autoActiveIndex]?.id ?? null;

  const activeIndex = useMemo(
    () => session.exercises.findIndex((ex) => ex.id === activeExerciseId),
    [session.exercises, activeExerciseId],
  );

  const completedCount = session.exercises.filter((ex) => ex.completed).length;
  const totalExercises = session.exercises.length;
  const allExercisesDone = completedCount === totalExercises;

  const nextExercise =
    !allExercisesDone && activeIndex < totalExercises - 1
      ? session.exercises[activeIndex + 1]
      : null;

  const nextExerciseLabel = nextExercise
    ? resolveExerciseDisplayName(
        tCatalog,
        nextExercise.exerciseCatalogKey,
        nextExercise.nameSnapshot,
      )
    : null;

  const handleToggleSet = useCallback(
    (setId: string) => {
      setSession((prev) => {
        let sync:
          | {
              sessionExerciseId: string;
              reps: number;
              weight: number;
              setNumber: number;
              localSetId: string;
            }
          | undefined;

        for (const ex of prev.exercises) {
          const s = ex.sets.find((x) => x.id === setId);
          if (!s) continue;
          const nextCompleted = !s.completed;
          if (nextCompleted && prev.backendSynced && !s.syncedToBackend) {
            sync = {
              sessionExerciseId: ex.id,
              reps: s.reps,
              weight: s.weight,
              setNumber: s.setNumber,
              localSetId: setId,
            };
          }
          break;
        }

        const next: WorkoutSession = {
          ...prev,
          exercises: prev.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === setId ? { ...s, completed: !s.completed } : s,
            ),
          })),
        };

        if (sync) {
          const payload = sync;
          queueMicrotask(() => {
            void logSessionSetApi(client, {
              sessionExerciseId: payload.sessionExerciseId,
              reps: payload.reps,
              weight: payload.weight,
              setNumber: payload.setNumber,
            }).then((row) => {
              if (!row) return;
              setSession((p) => ({
                ...p,
                exercises: p.exercises.map((ex) => ({
                  ...ex,
                  sets: ex.sets.map((s) =>
                    s.id === payload.localSetId
                      ? {
                          ...row,
                          completed: true,
                          syncedToBackend: true,
                        }
                      : s,
                  ),
                })),
              }));
            });
          });
        }

        return next;
      });
    },
    [client],
  );

  const handleUpdateWeight = useCallback((setId: string, weight: number) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, weight } : s)),
      })),
    }));
  }, []);

  const handleUpdateReps = useCallback((setId: string, reps: number) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, reps } : s)),
      })),
    }));
  }, []);

  const handleAddSet = useCallback((exerciseId: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: crypto.randomUUID(),
              setNumber: ex.sets.length + 1,
              weight: lastSet?.weight ?? 0,
              reps: lastSet?.reps ?? 0,
              completed: false,
              createdAt: new Date().toISOString(),
              syncedToBackend: false,
            },
          ],
        };
      }),
    }));
  }, []);

  const handleRemoveSet = useCallback((setId: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        const hasSet = ex.sets.some((set) => set.id === setId);
        if (!hasSet || ex.sets.length <= 1) return ex;

        const nextSets = ex.sets
          .filter((set) => set.id !== setId)
          .map((set, index) => ({
            ...set,
            setNumber: index + 1,
          }));

        return { ...ex, sets: nextSets };
      }),
    }));
  }, []);

  const handleCompleteExercise = useCallback((exerciseId: string) => {
    setSession((prev) => {
      const updated = {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, completed: true } : ex,
        ),
      };

      const nextToSelect =
        updated.exercises.find((ex) => !ex.completed) ?? null;
      if (nextToSelect) {
        setSelectedExerciseId(nextToSelect.id);
      }

      return updated;
    });
  }, []);

  const handleFinish = async () => {
    const completedSession: WorkoutSession = {
      ...session,
      status: "COMPLETED",
      finishedAt: new Date().toISOString(),
    };

    if (session.backendSynced) {
      await finishWorkoutSessionApi(client, session.id);
    }

    saveWorkoutSession(completedSession);
    clearActiveSession();
    router.push(`/${locale}/workouts/summary?sessionId=${session.id}`);
  };

  return (
    <main className="fixed inset-0 z-0 flex flex-col bg-background pt-[var(--app-safe-top)] lg:relative lg:inset-auto lg:z-auto lg:flex-1 lg:min-h-0 lg:pt-0">
      <header className="shrink-0 border-b border-border/50 bg-background">
        <div className="mx-auto w-full max-w-5xl px-2 pb-3 pt-2 sm:px-4">
          <WorkoutHeader
            workoutName={session.workoutName ?? "Workout"}
            startedAt={session.startedAt}
            backHref="/workouts"
            backAriaLabel={t("leaveWorkout")}
          />
          <WorkoutProgress
            className="mt-2"
            completed={completedCount}
            total={totalExercises}
            label={t("progress")}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t("tapToEdit")}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto w-full max-w-5xl px-2 sm:px-4">
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <div className="mt-4 flex flex-col gap-2 pb-40 lg:pb-6">
                {session.exercises.map((ex) => (
                  <ExerciseBlock
                    key={ex.id}
                    exercise={ex}
                    isActive={ex.id === activeExerciseId}
                    isCompleted={ex.completed}
                    onSelect={() => setSelectedExerciseId(ex.id)}
                    onOpenHistory={handleOpenHistory}
                    onToggleSet={handleToggleSet}
                    onUpdateWeight={handleUpdateWeight}
                    onUpdateReps={handleUpdateReps}
                    onRemoveSet={handleRemoveSet}
                    onAddSet={handleAddSet}
                    onComplete={handleCompleteExercise}
                    addSetLabel={t("addSet")}
                    removeSetLabel={t("removeSet")}
                    historyLabel={t("historyButton")}
                    completeLabel={t("completeExercise")}
                    completedLabel={t("completed")}
                    setUnitKg={t("setUnitKg")}
                    setUnitReps={t("setUnitReps")}
                    setWeightDownAria={t("setWeightDown")}
                    setWeightUpAria={t("setWeightUp")}
                    setRepsDownAria={t("setRepsDown")}
                    setRepsUpAria={t("setRepsUp")}
                  />
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-6 flex flex-col gap-4">
                {nextExercise && (
                  <div className="rounded-lg border border-dashed border-border/50 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t("upNext")}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground/80">
                      {nextExerciseLabel}
                    </p>
                  </div>
                )}

                <PrimaryButton
                  size="lg"
                  className="w-full"
                  onClick={handleFinish}
                  disabled={!allExercisesDone}
                  aria-disabled={!allExercisesDone}
                >
                  {allExercisesDone
                    ? t("finishWorkout")
                    : t("exercisesRemaining", {
                        count: totalExercises - completedCount,
                      })}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[calc(3.5rem+var(--app-safe-bottom))] left-0 right-0 z-30 border-t border-border bg-background/80 backdrop-blur-md lg:hidden">
        {nextExercise && (
          <div className="border-b border-border/30 px-2 py-2 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("upNext")}
            </p>
            <p className="text-sm font-semibold text-foreground/80">
              {nextExerciseLabel}
            </p>
          </div>
        )}
        <div className="w-full px-2 py-3 sm:px-4">
          <PrimaryButton
            size="lg"
            className="w-full"
            onClick={handleFinish}
            disabled={!allExercisesDone}
            aria-disabled={!allExercisesDone}
          >
            {allExercisesDone
              ? t("finishWorkout")
              : t("exercisesRemaining", {
                  count: totalExercises - completedCount,
                })}
          </PrimaryButton>
        </div>
      </div>

      <ExerciseHistoryModal
        isOpen={historyModal.isOpen}
        data={historyModal.data}
        locale={locale}
        onClose={handleCloseHistory}
        formatSetLabel={(number) => t("historySet", { number })}
        labels={{
          close: t("historyClose"),
          pr: t("historyPr"),
          empty: t("historyEmpty"),
        }}
      />
    </main>
  );
}
