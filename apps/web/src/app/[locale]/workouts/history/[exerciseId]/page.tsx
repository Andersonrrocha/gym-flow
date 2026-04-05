"use client";

import { useEffect, useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/workouts/section-header";
import { PageHeader } from "@/components/navigation/PageHeader";
import { searchExercisesApi } from "@/lib/api/exercise-api";
import {
  listUserSessionsApi,
  mergeRemoteAndLocalSessions,
} from "@/lib/api/session-api";
import { formatRelativeDateWithYear } from "@/lib/date-format";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import {
  deriveExerciseHistory,
  type ExerciseHistoryData,
} from "@/lib/workout-metrics";
import { getWorkoutSessions } from "@/lib/session-storage";
import type { Exercise } from "@/types/workouts";

export default function ExerciseHistoryPage() {
  const t = useTranslations("ExerciseHistory");
  const tCatalog = useTranslations("Exercises.catalog");
  const tEx = useTranslations("Exercises");
  const locale = useLocale();
  const client = useApolloClient();
  const params = useParams<{ exerciseId: string }>();
  const exerciseId = decodeURIComponent(params.exerciseId ?? "");

  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">(
    "loading",
  );
  const [exerciseMeta, setExerciseMeta] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<ExerciseHistoryData | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      queueMicrotask(() => setLoadState("error"));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const [remote, localList, catalog] = await Promise.all([
          listUserSessionsApi(client, "COMPLETED"),
          Promise.resolve(getWorkoutSessions()),
          searchExercisesApi(client),
        ]);
        if (cancelled) return;

        const merged = mergeRemoteAndLocalSessions(remote, localList);
        const meta = catalog.find((e) => e.id === exerciseId) ?? null;

        const picked = merged
          .flatMap((s) => s.exercises)
          .find((e) => e.exerciseId === exerciseId);

        const displayName = meta
          ? resolveExerciseDisplayName(tCatalog, meta.catalogKey, meta.name)
          : picked
            ? resolveExerciseDisplayName(
                tCatalog,
                picked.exerciseCatalogKey ?? null,
                picked.nameSnapshot,
              )
            : exerciseId;

        const hist = deriveExerciseHistory(exerciseId, displayName, merged);
        if (cancelled) return;
        setExerciseMeta(meta);
        setHistory(hist);
        setLoadState("ready");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, exerciseId, tCatalog]);

  const subtitle = useMemo(() => {
    if (!exerciseMeta?.muscleGroup) return undefined;
    const mg = tEx(exerciseMeta.muscleGroup);
    const eq = exerciseMeta.equipment
      ? tEx(exerciseMeta.equipment)
      : undefined;
    return eq ? `${mg} · ${eq}` : mg;
  }, [exerciseMeta, tEx]);

  if (loadState === "loading") {
    return (
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="mx-auto w-full max-w-lg px-2 py-6 sm:px-4">
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </main>
    );
  }

  if (loadState === "error" || !history) {
    return (
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="mx-auto w-full max-w-lg px-2 py-6 sm:px-4">
          <p className="text-sm text-muted-foreground">{t("errorLoading")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-lg px-2 py-6 sm:px-4">
        <PageHeader
          href="/workouts/history"
          title={history.exerciseName}
          subtitle={subtitle}
          className="mb-4"
        />

        {history.pr && (
          <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {t("pr")}
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-2xl font-black tabular-nums text-foreground">
                {t("weight", { value: history.pr.weight })}
              </span>
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {t("reps", { count: history.pr.reps })}
              </span>
            </div>
            {history.pr.date && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatRelativeDateWithYear(history.pr.date, locale)}
              </p>
            )}
          </div>
        )}

        <div className="mt-6">
          <SectionHeader title={t("sessionTitle")} />

          {history.sessions.length === 0 ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("noHistory")}
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {history.sessions.map((session, i) => (
                <div
                  key={`${session.date}-${i}`}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatRelativeDateWithYear(session.date, locale)}
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {session.sets.map((set) => (
                      <div
                        key={set.setNumber}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-10 font-mono text-xs tabular-nums text-muted-foreground">
                          {t("set", { number: set.setNumber })}
                        </span>
                        <span className="font-mono tabular-nums text-foreground">
                          {set.weight} kg
                        </span>
                        <span className="text-muted-foreground">×</span>
                        <span className="font-mono tabular-nums text-foreground">
                          {set.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
