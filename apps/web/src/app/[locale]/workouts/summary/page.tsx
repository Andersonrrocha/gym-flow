"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PrimaryButton } from "@/components/workouts/primary-button";
import { getWorkoutSessions } from "@/lib/session-storage";
import { computeSessionMetrics } from "@/lib/workout-metrics";
import { workoutSessionSummaryMock } from "@/mocks/workouts";
import type { WorkoutSessionSummary } from "@/types/workouts";

function loadSummary(): WorkoutSessionSummary {
  const sessions = getWorkoutSessions();
  const last = sessions[0];
  if (last) return computeSessionMetrics(last);
  return workoutSessionSummaryMock;
}

export default function WorkoutSummaryPage() {
  const t = useTranslations("WorkoutSummary");
  const locale = useLocale();
  const router = useRouter();
  const summary = loadSummary();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <span className="text-2xl">✓</span>
          </motion.div>

          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.workoutName}
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-6">
          <SummaryStat
            value={String(summary.totalSets)}
            label={t("sets")}
            delay={0.3}
          />
          <SummaryStat
            value={summary.totalVolume.toLocaleString()}
            unit="kg"
            label={t("volume")}
            delay={0.4}
          />
          <SummaryStat
            value={String(summary.durationMinutes)}
            unit="min"
            label={t("duration")}
            delay={0.5}
          />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("exercisesCompleted")}
          </p>
          <ul className="flex flex-col gap-1.5">
            {summary.completedExercises.map((name, i) => (
              <motion.li
                key={name}
                className="flex items-center gap-2 text-sm text-foreground"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <span className="text-success">✓</span>
                {name}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <PrimaryButton
            size="lg"
            className="w-full"
            onClick={() => router.push(`/${locale}/workouts`)}
          >
            {t("backToWorkouts")}
          </PrimaryButton>
          <button
            onClick={() => router.push(`/${locale}/workouts/history`)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("viewHistory")}
          </button>
        </div>
      </motion.div>
    </main>
  );
}

function SummaryStat({
  value,
  unit,
  label,
  delay = 0,
}: {
  value: string;
  unit?: string;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-0.5 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
      <span className="mt-0.5 text-[11px] text-muted-foreground">{label}</span>
    </motion.div>
  );
}
