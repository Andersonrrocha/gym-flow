"use client";

import { useState, useEffect, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/use-logout";
import { SectionHeader } from "@/components/workouts/section-header";
import { TrainingStreak } from "@/components/workouts/training-streak";
import { TrainingProgressSection } from "@/components/workouts/training-progress-section";
import {
  PlayIcon,
  PlusIcon,
  PencilIcon,
  ClockIcon,
  LogoutIcon,
} from "@/components/workouts/dashboard-action-icons";
import { StatItem } from "@/components/stats/StatItem";
import {
  saveActiveSession,
  getActiveSession,
  getLatestSessionByWorkoutId,
  getWorkoutSessions,
} from "@/lib/session-storage";
import { formatNumber } from "@/lib/number-format";
import { normalizeSession } from "@/lib/session-normalize";
import {
  mergeSessionWithLocalPrefill,
  startSessionFromWorkoutApi,
  listUserSessionsApi,
  mergeRemoteAndLocalSessions,
} from "@/lib/api/session-api";
import { listUserWorkoutsApi } from "@/lib/api/workout-api";
import {
  buildHomeDashboard,
  type HomeDashboard,
} from "@/lib/home-dashboard-stats";
import { AppLogo } from "@/components/ui/app-logo";
import type { Workout, SessionSet, WorkoutSession } from "@/types/workouts";

function prefillSets(
  exerciseId: string,
  previousSession: WorkoutSession | null,
): SessionSet[] {
  if (!previousSession) return [];
  const prevExercise = previousSession.exercises.find(
    (ex) => ex.exerciseId === exerciseId,
  );
  if (!prevExercise) return [];
  return prevExercise.sets.map((s, idx) => ({
    id: crypto.randomUUID(),
    setNumber: idx + 1,
    weight: s.weight,
    reps: s.reps,
    completed: false,
    createdAt: new Date().toISOString(),
  }));
}

function createLocalSession(workout: Workout): WorkoutSession {
  const previousSession = getLatestSessionByWorkoutId(workout.id);
  return {
    id: crypto.randomUUID(),
    workoutId: workout.id,
    workoutName: workout.name,
    status: "IN_PROGRESS",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exercises: workout.exercises.map((we) => ({
      id: crypto.randomUUID(),
      exerciseId: we.exercise.id,
      nameSnapshot: we.exercise.name,
      exerciseCatalogKey: we.exercise.catalogKey ?? null,
      plannedSets: we.plannedSets,
      plannedReps: we.plannedReps,
      order: we.order,
      completed: false,
      sets: prefillSets(we.exercise.id, previousSession),
    })),
  };
}

type TemplateLoadState = "loading" | "empty" | "error" | "success";
type DashboardLoadState = "loading" | "ready";

export default function WorkoutsPage() {
  const t = useTranslations("WorkoutHome");
  const locale = useLocale();
  const router = useRouter();
  const client = useApolloClient();
  const { logout } = useLogout();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templateLoadState, setTemplateLoadState] =
    useState<TemplateLoadState>("loading");
  const [startingId, setStartingId] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [dashboardLoadState, setDashboardLoadState] =
    useState<DashboardLoadState>("loading");

  useEffect(() => {
    setHasActiveSession(getActiveSession() !== null);
  }, []);

  const fetchWorkouts = useCallback(async () => {
    setTemplateLoadState("loading");
    const data = await listUserWorkoutsApi(client);
    if (data === null) {
      setTemplateLoadState("error");
    } else if (data.length === 0) {
      setWorkouts([]);
      setTemplateLoadState("empty");
    } else {
      setWorkouts(data);
      setTemplateLoadState("success");
    }
  }, [client]);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoadState("loading");

    let completedSessions: WorkoutSession[] = [];

    try {
      const remote = await listUserSessionsApi(client, "COMPLETED");
      const local = getWorkoutSessions().filter(
        (s) => s.status === "COMPLETED",
      );
      completedSessions = mergeRemoteAndLocalSessions(remote, local).filter(
        (s) => s.status === "COMPLETED",
      );
    } catch {
      completedSessions = getWorkoutSessions().filter(
        (s) => s.status === "COMPLETED",
      );
    }

    completedSessions.sort((a, b) => {
      const aRef = a.finishedAt ?? a.startedAt;
      const bRef = b.finishedAt ?? b.startedAt;
      return new Date(bRef).getTime() - new Date(aRef).getTime();
    });

    setDashboard(
      buildHomeDashboard(completedSessions, { localeForLabels: locale }),
    );
    setDashboardLoadState("ready");
  }, [client, locale]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStartWorkout = useCallback(
    async (workout: Workout) => {
      setStartingId(workout.id);
      try {
        const previousSession = getLatestSessionByWorkoutId(workout.id);
        const remote = await startSessionFromWorkoutApi(client, workout.id);
        const session = remote
          ? normalizeSession(
              mergeSessionWithLocalPrefill(remote, previousSession),
            )
          : normalizeSession(createLocalSession(workout));

        saveActiveSession(session);
        router.push(`/${locale}/workouts/active`);
      } finally {
        setStartingId(null);
      }
    },
    [client, locale, router],
  );

  const statsReady = dashboardLoadState === "ready" && dashboard !== null;

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background w-full">
      <div className="mx-auto w-full max-w-5xl px-2 py-6 sm:px-4">
        <div className="flex items-center justify-between">
          <AppLogo variant="inline" iconSize={40} />
          <div className="flex items-center gap-3">
            {!statsReady ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
            ) : dashboard.streak > 0 ? (
              <TrainingStreak
                count={dashboard.streak}
                label={t("streakLabel")}
              />
            ) : null}
            <button
              type="button"
              onClick={logout}
              aria-label={t("logout")}
              title={t("logout")}
              className="rounded-lg p-2 text-primary opacity-90 transition-colors hover:bg-primary/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3 flex flex-col gap-5">
            {hasActiveSession && (
              <button
                type="button"
                onClick={() => router.push(`/${locale}/workouts/active`)}
                className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10"
              >
                <PlayIcon className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 text-sm font-semibold text-primary">
                  {t("resumeWorkout")}
                </span>
              </button>
            )}

            <div>
              <SectionHeader
                title={t("myWorkouts")}
                action={
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/workouts/builder`)}
                    className="inline-flex items-center gap-1 rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 sm:px-2 sm:py-1.5"
                    aria-label={t("createWorkout")}
                    title={t("createWorkout")}
                  >
                    <PlusIcon className="shrink-0" />
                    <span className="hidden text-xs font-medium sm:inline">
                      {t("createWorkout")}
                    </span>
                  </button>
                }
              />

              <div className="mt-2">
                {templateLoadState === "loading" && (
                  <div className="flex items-center justify-center rounded-xl border border-border bg-card p-6">
                    <span className="text-sm text-muted-foreground animate-pulse">
                      {t("workoutsLoading")}
                    </span>
                  </div>
                )}

                {templateLoadState === "error" && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                    <p className="text-sm text-destructive">
                      {t("workoutsError")}
                    </p>
                    <button
                      onClick={fetchWorkouts}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {t("tryAgain")}
                    </button>
                  </div>
                )}

                {templateLoadState === "empty" && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("workoutsEmpty")}
                    </p>
                    <button
                      onClick={() => router.push(`/${locale}/workouts/builder`)}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {t("createWorkout")}
                    </button>
                  </div>
                )}

                {templateLoadState === "success" && (
                  <ul className="flex flex-col gap-2">
                    {workouts.map((workout) => (
                      <li
                        key={workout.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {workout.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("exercises", {
                              count: workout.exercises.length,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/${locale}/workouts/builder/${workout.id}`,
                              )
                            }
                            className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                            aria-label={t("edit")}
                            title={t("edit")}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartWorkout(workout)}
                            disabled={startingId !== null}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                          >
                            <PlayIcon className="shrink-0 text-primary-foreground" />
                            <span>
                              {startingId === workout.id
                                ? t("starting")
                                : t("startWorkout")}
                            </span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <TrainingProgressSection
              loading={!statsReady}
              progress={statsReady ? dashboard.progress : null}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <div>
              <SectionHeader title={t("quickStats")} />
              {statsReady ? (
                <div className="mt-2 flex gap-6 rounded-xl border border-border bg-card p-3">
                  <StatItem
                    value={String(dashboard.weeklySummary.workoutsThisWeek)}
                    label={t("workoutsThisWeek", {
                      count: dashboard.weeklySummary.workoutsThisWeek,
                    })}
                  />
                  <StatItem
                    value={formatNumber(
                      dashboard.weeklySummary.totalVolumeThisWeek,
                      locale,
                    )}
                    label={t("volumeThisWeek", {
                      value: formatNumber(
                        dashboard.weeklySummary.totalVolumeThisWeek,
                        locale,
                      ),
                    })}
                  />
                </div>
              ) : (
                <div className="mt-2 h-16 animate-pulse rounded-xl bg-muted" />
              )}
            </div>

            <div>
              <SectionHeader
                title={t("lastWorkout")}
                action={
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/workouts/history`)}
                    className="inline-flex max-w-[min(100%,11rem)] items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs font-medium text-primary transition-colors hover:bg-primary/10 sm:max-w-none"
                    aria-label={t("sessionHistory")}
                    title={t("sessionHistory")}
                  >
                    <ClockIcon className="size-3.5 shrink-0" />
                    <span className="min-w-0 truncate leading-tight">
                      {t("sessionHistory")}
                    </span>
                  </button>
                }
              />

              {!statsReady && (
                <div className="mt-2 h-16 animate-pulse rounded-xl bg-muted" />
              )}

              {statsReady && dashboard.lastSession === null && (
                <div className="mt-2 flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    {t("lastSessionEmpty")}
                  </p>
                  <button
                    onClick={() => router.push(`/${locale}/workouts/history`)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("lastSessionEmptyCta")}
                  </button>
                </div>
              )}

              {statsReady && dashboard.lastSession !== null && (
                <div className="mt-2 rounded-xl border border-border bg-card p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {dashboard.lastSession.workoutName}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono tabular-nums">
                      {t("totalSets", {
                        count: dashboard.lastSession.totalSets,
                      })}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      {t("totalVolume", {
                        value: formatNumber(
                          dashboard.lastSession.totalVolume,
                          locale,
                        ),
                      })}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      {t("duration", {
                        minutes: dashboard.lastSession.durationMinutes,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
