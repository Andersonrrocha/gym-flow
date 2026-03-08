"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { WorkoutHeader } from "@/components/workouts/workout-header";
import { ProgressBar } from "@/components/workouts/progress-bar";
import { ExerciseRow } from "@/components/workouts/exercise-row";
import { PrimaryButton } from "@/components/workouts/primary-button";
import { activeWorkoutMock } from "@/mocks/workouts";
import type { WorkoutSession } from "@/types/workouts";

export default function ActiveWorkoutPage() {
  const t = useTranslations("WorkoutActive");
  const locale = useLocale();
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession>(activeWorkoutMock);
  const [activeIndex, setActiveIndex] = useState(0);

  const completedExercises = session.exercises.filter((ex) =>
    ex.sets.every((s) => s.completed),
  ).length;

  const handleToggleSet = useCallback(
    (setId: string) => {
      setSession((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, completed: !s.completed } : s,
          ),
        })),
      }));
    },
    [],
  );

  const handleUpdateWeight = useCallback(
    (setId: string, weight: number) => {
      setSession((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, weight } : s,
          ),
        })),
      }));
    },
    [],
  );

  const handleUpdateReps = useCallback(
    (setId: string, reps: number) => {
      setSession((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, reps } : s,
          ),
        })),
      }));
    },
    [],
  );

  const handleAddSet = useCallback(
    (exerciseId: string) => {
      setSession((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          const nextNum = ex.sets.length + 1;
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: `new-${Date.now()}`,
                setNumber: nextNum,
                reps: 0,
                weight: ex.sets[ex.sets.length - 1]?.weight ?? 0,
                completed: false,
              },
            ],
          };
        }),
      }));
    },
    [],
  );

  const handleFinish = () => {
    router.push(`/${locale}/workouts`);
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg">
        <WorkoutHeader
          workoutName={session.workoutName ?? "Workout"}
          startedAt={session.startedAt}
        />

        <div className="px-4">
          <ProgressBar
            current={completedExercises}
            total={session.exercises.length}
            label={t("progress")}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 px-4 pb-32">
          {session.exercises.map((ex, idx) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              isActive={idx === activeIndex}
              onToggleSet={handleToggleSet}
              onUpdateWeight={handleUpdateWeight}
              onUpdateReps={handleUpdateReps}
              onAddSet={handleAddSet}
            />
          ))}

          {activeIndex < session.exercises.length - 1 && (
            <button
              onClick={() => setActiveIndex((i) => i + 1)}
              className="mt-2 self-center text-xs font-medium text-primary hover:underline"
            >
              {t("nextExercise")} →
            </button>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto max-w-lg">
            <PrimaryButton
              size="lg"
              className="w-full"
              onClick={handleFinish}
            >
              {t("finishWorkout")}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </main>
  );
}
