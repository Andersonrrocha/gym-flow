"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatRelativeDate } from "@/lib/date-format";
import { getWorkoutSessions } from "@/lib/session-storage";
import { computeSessionMetrics } from "@/lib/workout-metrics";
import type { WorkoutSession } from "@/types/workouts";

export default function WorkoutHistoryPage() {
  const t = useTranslations("WorkoutHistory");
  const locale = useLocale();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    setSessions(getWorkoutSessions());
  }, []);

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>

        {sessions.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
            {sessions.map((session) => {
              const metrics = computeSessionMetrics(session);
              return (
                <button
                  key={session.id}
                  onClick={() =>
                    router.push(
                      `/${locale}/workouts/session/${session.id}`,
                    )
                  }
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {metrics.workoutName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatRelativeDate(session.startedAt, locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono tabular-nums">
                      {metrics.durationMinutes} {t("min")}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      {metrics.totalSets} {t("sets")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
