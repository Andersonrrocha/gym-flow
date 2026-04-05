"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PrimaryButton } from "@/components/workouts/primary-button";
import { formatNumber } from "@/lib/number-format";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import { computeSessionMetrics } from "@/lib/workout-metrics";
import { getWorkoutSessionByIdApi } from "@/lib/api/session-api";
import { getWorkoutSessionById } from "@/lib/session-storage";
import { PageHeader } from "@/components/navigation/PageHeader";
import type { WorkoutSessionSummary } from "@/types/workouts";

export default function WorkoutSummaryPage() {
  return (
    <Suspense>
      <SummaryPageContent />
    </Suspense>
  );
}

function SummaryPageContent() {
  const t = useTranslations("WorkoutSummary");
  const tCatalog = useTranslations("Exercises.catalog");
  const locale = useLocale();
  const router = useRouter();
  const client = useApolloClient();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [summary, setSummary] = useState<WorkoutSessionSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      queueMicrotask(() => setLoaded(true));
      return;
    }

    let cancelled = false;

    void (async () => {
      const remote = await getWorkoutSessionByIdApi(client, sessionId);

      if (!cancelled && remote) {
        setSummary(computeSessionMetrics(remote));
        setLoaded(true);
        return;
      }

      const local = getWorkoutSessionById(sessionId);

      if (!cancelled) {
        setSummary(local ? computeSessionMetrics(local) : null);
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, client]);

  if (!loaded) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </main>
    );
  }

  if (!sessionId || !summary) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
          <button
            onClick={() => router.push(`/${locale}/workouts`)}
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            {t("backToWorkouts")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-2 sm:px-4">
      <div className="mx-auto w-full max-w-sm pt-4 lg:max-w-2xl">
        <PageHeader href="/workouts" title={summary.workoutName} />
      </div>
      <div className="flex flex-1 items-center justify-center">
      <motion.div
        className="w-full max-w-sm lg:max-w-2xl"
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

        <div className="mt-6 flex justify-center gap-8 lg:gap-12">
          <SummaryStat
            value={String(summary.totalSets)}
            label={t("sets")}
            delay={0.3}
          />
          <SummaryStat
            value={formatNumber(summary.totalVolume, locale)}
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
          <ul className="flex flex-col gap-1.5 lg:grid lg:grid-cols-2 lg:gap-x-6">
            {summary.completedExercises.map((line, i) => (
              <motion.li
                key={`${line.nameSnapshot}-${line.exerciseCatalogKey ?? i}-${i}`}
                className="flex items-center gap-2 text-sm text-foreground"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <span className="text-success">✓</span>
                {resolveExerciseDisplayName(
                  tCatalog,
                  line.exerciseCatalogKey,
                  line.nameSnapshot,
                )}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 lg:flex-row lg:justify-center">
          <PrimaryButton
            size="lg"
            className="w-full lg:w-auto lg:px-8"
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
      </div>
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
