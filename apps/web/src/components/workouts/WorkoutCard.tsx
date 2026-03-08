"use client";

import { SectionHeader } from "./section-header";
import { PrimaryButton } from "./primary-button";
import type { TodayWorkout } from "@/types/workouts";

type WorkoutCardProps = {
  workout: TodayWorkout;
  labels: {
    title: string;
    exercises: string;
    estimatedTime: string;
    startWorkout: string;
  };
  onStart: () => void;
};

export function WorkoutCard({ workout, labels, onStart }: WorkoutCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeader title={labels.title} />
      <div className="mt-3">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {workout.name}
        </h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{labels.exercises}</span>
          <span>·</span>
          <span>{labels.estimatedTime}</span>
        </div>
      </div>
      <PrimaryButton size="lg" className="mt-4 w-full" onClick={onStart}>
        {labels.startWorkout}
      </PrimaryButton>
    </div>
  );
}
