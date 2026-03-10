"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/workouts/section-header";
import { WorkoutBuilderItem } from "@/components/workouts/workout-builder-item";
import { PrimaryButton } from "@/components/workouts/primary-button";
import { workoutBuilderMock } from "@/mocks/workouts";
import type { Workout } from "@/types/workouts";

export default function BuilderPage() {
  const t = useTranslations("WorkoutBuilder");
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout>(workoutBuilderMock);

  const handleRemove = (id: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises
        .filter((e) => e.id !== id)
        .map((e, idx) => ({ ...e, order: idx + 1 })),
    }));
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <button
          onClick={() => router.back()}
          className="mb-4 text-xs font-medium text-primary hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>

        {/* Workout name */}
        <input
          type="text"
          value={workout.name}
          onChange={(e) =>
            setWorkout((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder={t("namePlaceholder")}
          className="mt-4 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
        />

        {/* Exercise list */}
        <div className="mt-5">
          <SectionHeader title={`${workout.exercises.length} exercises`} />
          <div className="mt-2 flex flex-col gap-2">
            {workout.exercises.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("emptyList")}
              </p>
            ) : (
              workout.exercises.map((item) => (
                <WorkoutBuilderItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>
        </div>

        {/* Add exercise button */}
        <button className="mt-3 text-xs font-medium text-primary hover:underline">
          {t("addExercise")}
        </button>

        {/* Save */}
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 border-t border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:bottom-0">
          <div className="mx-auto max-w-lg">
            <PrimaryButton size="lg" className="w-full">
              {t("save")}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </main>
  );
}
