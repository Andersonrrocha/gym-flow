"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { WorkoutHeader } from "@/components/workouts/workout-header";
import { WorkoutProgress } from "@/components/workouts/WorkoutProgress";
import { ExerciseBlock } from "@/components/workouts/ExerciseBlock";
import { ExerciseHistoryModal } from "@/components/workouts/ExerciseHistoryModal";
import { PrimaryButton } from "@/components/workouts/primary-button";
import { activeWorkoutSessionMock } from "@/mocks/workouts";
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
import type { WorkoutSession } from "@/types/workouts";

export default function ActiveWorkoutPage() {
  const t = useTranslations("WorkoutActive");
  const locale = useLocale();
  const router = useRouter();

  // Keep first render deterministic for SSR/client hydration.
  const [session, setSession] = useState<WorkoutSession>(activeWorkoutSessionMock);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    data: ExerciseHistoryData | null;
  }>({ isOpen: false, data: null });

  const handleOpenHistory = useCallback(
    (exerciseId: string, exerciseName: string) => {
      const sessions = getWorkoutSessions();
      const data = deriveExerciseHistory(exerciseId, exerciseName, sessions);
      setHistoryModal({ isOpen: true, data });
    },
    [],
  );

  const handleCloseHistory = useCallback(() => {
    setHistoryModal({ isOpen: false, data: null });
  }, []);

  useEffect(() => {
    const storedSession = getActiveSession();
    if (storedSession) {
      setSession(storedSession);
    }
    setSessionHydrated(true);
  }, []);

  useEffect(() => {
    if (!sessionHydrated) return;
    saveActiveSession(session);
  }, [session, sessionHydrated]);

  const autoActiveIndex = useMemo(() => {
    const idx = session.exercises.findIndex((ex) => !ex.completed);
    return idx === -1 ? session.exercises.length - 1 : idx;
  }, [session.exercises]);

  useEffect(() => {
    if (session.exercises.length === 0) {
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

  const handleToggleSet = useCallback((setId: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) =>
          s.id === setId ? { ...s, completed: !s.completed } : s,
        ),
      })),
    }));
  }, []);

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

  const handleCompleteExercise = useCallback(
    (exerciseId: string) => {
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
    },
    [],
  );

  const handleFinish = () => {
    const completedSession: WorkoutSession = {
      ...session,
      status: "COMPLETED",
      finishedAt: new Date().toISOString(),
    };
    saveWorkoutSession(completedSession);
    clearActiveSession();
    router.push(`/${locale}/workouts/summary`);
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-5xl">
        <WorkoutHeader
          workoutName={session.workoutName ?? "Workout"}
          startedAt={session.startedAt}
        />

        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:px-4">
          {/* Exercise list — main column */}
          <div className="lg:col-span-2">
            <div className="px-4 lg:px-0">
              <WorkoutProgress
                completed={completedCount}
                total={totalExercises}
                label={t("progress")}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t("tapToEdit")}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2 px-4 pb-32 lg:px-0 lg:pb-6">
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
                />
              ))}
            </div>
          </div>

          {/* Sidebar — desktop only sticky panel */}
          <div className="hidden lg:block">
            <div className="sticky top-6 flex flex-col gap-4">
              {nextExercise && (
                <div className="rounded-lg border border-dashed border-border/50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t("upNext")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground/80">
                    {nextExercise.nameSnapshot}
                  </p>
                </div>
              )}

              <PrimaryButton
                size="lg"
                className="w-full"
                onClick={handleFinish}
                disabled={!allExercisesDone}
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

        {/* Mobile — up next + sticky bottom bar */}
        {nextExercise && (
          <div className="mx-4 -mt-28 mb-2 rounded-lg border border-dashed border-border/50 p-3 lg:hidden">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("upNext")}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground/80">
              {nextExercise.nameSnapshot}
            </p>
          </div>
        )}

        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 border-t border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto max-w-lg">
            <PrimaryButton
              size="lg"
              className="w-full"
              onClick={handleFinish}
              disabled={!allExercisesDone}
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
