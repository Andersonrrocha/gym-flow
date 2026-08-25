"use client";

import { useState, useEffect, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  History,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";
import { SectionHeader } from "@/components/workouts/section-header";
import { TrainingStreak } from "@/components/workouts/training-streak";
import { TrainingProgressSection } from "@/components/workouts/training-progress-section";
import { StatItem } from "@/components/stats/StatItem";
import { WorkoutListItem } from "@/components/workouts/workout-list-item";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow, Heading, Mono, Text } from "@/components/ui/typography";
import { AppLogo } from "@/components/ui/app-logo";
import { UserMenu } from "@/components/navigation/user-menu";
import { DesktopWorkoutDashboard } from "@/components/workouts/desktop-workout-dashboard";
import { toastError } from "@/lib/toast";
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

type GreetingKey =
  | "greeting"
  | "greetingMorning"
  | "greetingAfternoon"
  | "greetingEvening";

function pickGreetingKey(date = new Date()): GreetingKey {
  const h = date.getHours();
  if (h < 12) return "greetingMorning";
  if (h < 18) return "greetingAfternoon";
  return "greetingEvening";
}

type TemplateLoadState = "loading" | "empty" | "error" | "success";
type DashboardLoadState = "loading" | "ready";

export default function WorkoutsPage() {
  const t = useTranslations("WorkoutHome");
  const tToast = useTranslations("Toast");
  const locale = useLocale();
  const router = useRouter();
  const client = useApolloClient();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templateLoadState, setTemplateLoadState] =
    useState<TemplateLoadState>("loading");
  const [startingId, setStartingId] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionMeta, setActiveSessionMeta] = useState<{
    workoutName: string | null;
    startedAt: string;
  } | null>(null);

  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [dashboardLoadState, setDashboardLoadState] =
    useState<DashboardLoadState>("loading");
  const [greetingKey, setGreetingKey] = useState<GreetingKey>("greeting");

  useEffect(() => {
    setGreetingKey(pickGreetingKey());
    const session = getActiveSession();
    setHasActiveSession(session !== null);
    if (session) {
      setActiveSessionMeta({
        workoutName: session.workoutName,
        startedAt: session.startedAt,
      });
    }
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
      const work = (async () => {
        const previousSession = getLatestSessionByWorkoutId(workout.id);
        const remote = await startSessionFromWorkoutApi(client, workout.id);
        const session = remote
          ? normalizeSession(
              mergeSessionWithLocalPrefill(remote, previousSession),
            )
          : normalizeSession(createLocalSession(workout));
        saveActiveSession(session);
        return session;
      })();

      try {
        await work;
        router.push(`/${locale}/workouts/active`);
      } catch {
        toastError(tToast("workoutStartFailed"));
      } finally {
        setStartingId(null);
      }
    },
    [client, locale, router, tToast],
  );

  const statsReady = dashboardLoadState === "ready" && dashboard !== null;
  const navigateBuilder = () => router.push(`/${locale}/workouts/builder`);
  const navigateHistory = () => router.push(`/${locale}/workouts/history`);
  const navigateActive = () => router.push(`/${locale}/workouts/active`);

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <DesktopWorkoutDashboard
        workouts={workouts}
        templateLoadState={templateLoadState}
        dashboard={dashboard}
        dashboardLoading={dashboardLoadState === "loading"}
        hasActiveSession={hasActiveSession}
        startingId={startingId}
        locale={locale}
        onCreateWorkout={navigateBuilder}
        onEditWorkout={(workout) =>
          router.push(`/${locale}/workouts/builder/${workout.id}`)
        }
        onStartWorkout={handleStartWorkout}
        onResumeWorkout={navigateActive}
        onViewHistory={navigateHistory}
        onRetry={fetchWorkouts}
      />

      <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-6 lg:hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <AppLogo variant="inline" iconSize={36} />
          <div className="flex items-center gap-2">
            {!statsReady ? (
              <Skeleton className="h-9 w-20 rounded-full" />
            ) : dashboard.streak > 0 ? (
              <TrainingStreak
                count={dashboard.streak}
                label={t("streakLabel")}
              />
            ) : null}
            <UserMenu />
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-6">
          <Eyebrow>{t(greetingKey)}</Eyebrow>
          <Heading level="h1" className="mt-1">
            {t("welcomeBack")}
          </Heading>
        </div>

        {/* Hero */}
        <section className="mt-5">
          {hasActiveSession ? (
            <Card
              variant="primary"
              padding="lg"
              interactive
              role="button"
              tabIndex={0}
              onClick={navigateActive}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigateActive();
                }
              }}
              className="group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Eyebrow className="text-primary-soft-foreground/80">
                    {t("activeSessionTag")}
                  </Eyebrow>
                  <CardTitle className="mt-1 truncate text-xl text-primary-soft-foreground">
                    {activeSessionMeta?.workoutName ?? t("resumeWorkout")}
                  </CardTitle>
                  <Text
                    size="xs"
                    className="mt-1 text-primary-soft-foreground/80"
                  >
                    {t("resumeWorkoutDescription")}
                  </Text>
                </div>
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                  <Timer className="size-5" strokeWidth={2.2} aria-hidden />
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-primary-soft-foreground">
                <span className="text-sm font-semibold">
                  {t("resumeWorkout")}
                </span>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </div>
            </Card>
          ) : (
            <Card
              variant="elevated"
              padding="lg"
              className="relative overflow-hidden"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-primary/15 blur-3xl"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Eyebrow>{t("greeting")}</Eyebrow>
                  <CardTitle className="mt-1 text-xl">
                    {t("startNewWorkout")}
                  </CardTitle>
                  <Text size="xs" tone="muted" className="mt-1">
                    {t("startNewWorkoutDescription")}
                  </Text>
                </div>
                <span
                  aria-hidden
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                >
                  <Sparkles className="size-5" strokeWidth={2.2} />
                </span>
              </div>
            </Card>
          )}
        </section>

        {/* Two-column grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="flex flex-col gap-5 lg:col-span-3">
            {/* My Workouts */}
            <section>
              <SectionHeader
                title={t("myWorkouts")}
                action={
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={navigateBuilder}
                    aria-label={t("createWorkout")}
                  >
                    <Plus className="size-3.5" strokeWidth={2.4} aria-hidden />
                    <span className="hidden sm:inline">
                      {t("createWorkout")}
                    </span>
                  </Button>
                }
              />

              <div className="mt-3">
                {templateLoadState === "loading" && (
                  <ul className="flex flex-col gap-2">
                    {[0, 1, 2].map((i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                      >
                        <Skeleton className="h-10 w-1.5" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="mt-2 h-3 w-1/3" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                      </li>
                    ))}
                  </ul>
                )}

                {templateLoadState === "error" && (
                  <EmptyState
                    tone="destructive"
                    title={t("workoutsError")}
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchWorkouts}
                      >
                        {t("tryAgain")}
                      </Button>
                    }
                  />
                )}

                {templateLoadState === "empty" && (
                  <EmptyState
                    icon={Plus}
                    title={t("workoutsEmpty")}
                    action={
                      <Button onClick={navigateBuilder} size="md">
                        <Plus
                          className="size-4"
                          strokeWidth={2.4}
                          aria-hidden
                        />
                        <span>{t("createWorkout")}</span>
                      </Button>
                    }
                  />
                )}

                {templateLoadState === "success" && (
                  <ul className="flex flex-col gap-2">
                    {workouts.map((workout) => (
                      <WorkoutListItem
                        key={workout.id}
                        workout={workout}
                        exercisesLabel={t("exercises", {
                          count: workout.exercises.length,
                        })}
                        startLabel={t("startWorkout")}
                        startingLabel={t("starting")}
                        editLabel={t("edit")}
                        isStarting={startingId === workout.id}
                        disableStart={
                          startingId !== null && startingId !== workout.id
                        }
                        onStart={() => handleStartWorkout(workout)}
                        onEdit={() =>
                          router.push(
                            `/${locale}/workouts/builder/${workout.id}`,
                          )
                        }
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Training progress (teaser for /progress) */}
            <Card padding="md">
              <TrainingProgressSection
                loading={!statsReady}
                progress={statsReady ? dashboard.progress : null}
              />
            </Card>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Quick stats */}
            <Card padding="md">
              <CardHeader>
                <CardTitle>{t("quickStats")}</CardTitle>
              </CardHeader>
              {statsReady ? (
                <div className="grid grid-cols-2 gap-3">
                  <StatItem
                    icon={<Clock className="size-3.5" />}
                    value={String(dashboard.weeklySummary.workoutsThisWeek)}
                    label={t("workoutsThisWeek", {
                      count: dashboard.weeklySummary.workoutsThisWeek,
                    })}
                  />
                  <StatItem
                    icon={<Sparkles className="size-3.5" />}
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
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              )}
            </Card>

            {/* Last workout */}
            <Card padding="md">
              <CardHeader>
                <CardTitle>{t("lastWorkout")}</CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  onClick={navigateHistory}
                  className="h-auto px-0 text-xs"
                  aria-label={t("sessionHistory")}
                >
                  <History className="size-3.5" aria-hidden />
                  <span>{t("sessionHistory")}</span>
                </Button>
              </CardHeader>

              {!statsReady && <Skeleton className="h-20" />}

              {statsReady && dashboard.lastSession === null && (
                <EmptyState
                  title={t("lastSessionEmpty")}
                  action={
                    <Button
                      variant="link"
                      size="sm"
                      onClick={navigateHistory}
                      className="h-auto px-0"
                    >
                      {t("lastSessionEmptyCta")}
                    </Button>
                  }
                />
              )}

              {statsReady && dashboard.lastSession !== null && (
                <div>
                  <p className="font-display text-base font-semibold text-foreground">
                    {dashboard.lastSession.workoutName}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mono>
                        {t("totalSets", {
                          count: dashboard.lastSession.totalSets,
                        })}
                      </Mono>
                    </span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Mono>
                        {t("totalVolume", {
                          value: formatNumber(
                            dashboard.lastSession.totalVolume,
                            locale,
                          ),
                        })}
                      </Mono>
                    </span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Mono>
                        {t("duration", {
                          minutes: dashboard.lastSession.durationMinutes,
                        })}
                      </Mono>
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
