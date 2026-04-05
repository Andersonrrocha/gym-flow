"use client";

import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import { formatDate } from "@/lib/date-format";
import { formatNumber } from "@/lib/number-format";
import { getWorkoutSessionById } from "@/lib/session-storage";
import { computeSessionMetrics } from "@/lib/workout-metrics";
import { getWorkoutSessionByIdApi } from "@/lib/api/session-api";
import { PageHeader } from "@/components/navigation/PageHeader";
import type { WorkoutSession } from "@/types/workouts";

export default function SessionDetailPage() {
  const t = useTranslations("SessionDetail");
  const tCatalog = useTranslations("Exercises.catalog");
  const locale = useLocale();
  const router = useRouter();
  const client = useApolloClient();
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const remote = await getWorkoutSessionByIdApi(client, params.id);
      if (remote && !cancelled) {
        setSession(remote);
        setLoaded(true);
        return;
      }
      const local = getWorkoutSessionById(params.id);
      if (!cancelled) {
        setSession(local);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, client]);

  if (!loaded) return null;

  if (!session) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
          <button
            onClick={() => router.push(`/${locale}/workouts/history`)}
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            {t("backToHistory")}
          </button>
        </div>
      </main>
    );
  }

  const metrics = computeSessionMetrics(session);
  const date = formatDate(session.startedAt, locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl px-2 py-6 sm:px-4">
        <PageHeader
          href="/workouts/history"
          title={metrics.workoutName}
          subtitle={date}
          className="mb-4"
        />

        <div className="flex gap-6">
          <MetricBadge
            value={String(metrics.totalSets)}
            label={t("sets")}
          />
          <MetricBadge
            value={formatNumber(metrics.totalVolume, locale)}
            unit="kg"
            label={t("volume")}
          />
          <MetricBadge
            value={String(metrics.durationMinutes)}
            unit="min"
            label={t("duration")}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {session.exercises.map((ex) => (
            <div
              key={ex.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <h3 className="text-sm font-bold text-foreground">
                {resolveExerciseDisplayName(
                  tCatalog,
                  ex.exerciseCatalogKey,
                  ex.nameSnapshot,
                )}
              </h3>

              {ex.sets.length === 0 ? (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {t("noSets")}
                </p>
              ) : (
                <div className="mt-2 flex flex-col gap-1">
                  {ex.sets.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center gap-3 text-xs text-muted-foreground"
                    >
                      <span className="w-14 font-mono tabular-nums">
                        {t("setLabel", { number: set.setNumber })}
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {set.weight}kg × {set.reps}
                      </span>
                      {set.completed && (
                        <span className="text-success">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function MetricBadge({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-lg font-bold tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
