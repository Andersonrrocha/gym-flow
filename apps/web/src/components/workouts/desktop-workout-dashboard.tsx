"use client";

import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  History,
  Layers3,
  Pencil,
  Play,
  Plus,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { TrainingProgressSection } from "@/components/workouts/training-progress-section";
import { formatNumber } from "@/lib/number-format";
import type { HomeDashboard } from "@/lib/home-dashboard-stats";
import type { Workout } from "@/types/workouts";

type TemplateLoadState = "loading" | "empty" | "error" | "success";

type DesktopWorkoutDashboardProps = {
  workouts: Workout[];
  templateLoadState: TemplateLoadState;
  dashboard: HomeDashboard | null;
  dashboardLoading: boolean;
  hasActiveSession: boolean;
  startingId: string | null;
  locale: string;
  onCreateWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onStartWorkout: (workout: Workout) => void;
  onResumeWorkout: () => void;
  onViewHistory: () => void;
  onRetry: () => void;
};

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <div className="h-72 animate-pulse rounded-2xl bg-muted xl:col-span-7" />
      <div className="h-72 animate-pulse rounded-2xl bg-muted xl:col-span-5" />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/35">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function DesktopWorkoutDashboard({
  workouts,
  templateLoadState,
  dashboard,
  dashboardLoading,
  hasActiveSession,
  startingId,
  locale,
  onCreateWorkout,
  onEditWorkout,
  onStartWorkout,
  onResumeWorkout,
  onViewHistory,
  onRetry,
}: DesktopWorkoutDashboardProps) {
  const t = useTranslations("DesktopDashboard");
  const primaryWorkout = workouts[0] ?? null;
  const dashboardReady = !dashboardLoading && dashboard !== null;
  const totalExercises = workouts.reduce(
    (total, workout) => total + workout.exercises.length,
    0,
  );

  return (
    <section className="mx-auto hidden w-full max-w-[90rem] px-8 py-9 lg:block xl:px-10">
      <header className="flex items-start justify-between gap-8">
        <div>
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground xl:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-[52ch] text-sm leading-6 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onViewHistory}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <History className="size-4" aria-hidden />
            {t("viewHistory")}
          </button>
          <button
            type="button"
            onClick={onCreateWorkout}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" aria-hidden />
            {t("buildWorkout")}
          </button>
        </div>
      </header>

      {hasActiveSession ? (
        <button
          type="button"
          onClick={onResumeWorkout}
          className="mt-6 flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 text-left transition-colors hover:bg-primary/12"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Play className="size-4" fill="currentColor" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-foreground">
              {t("activeSession")}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {t("activeSessionDescription")}
            </span>
          </span>
          <ChevronRight className="size-5 text-primary" aria-hidden />
        </button>
      ) : null}

      <div className="mt-8">
        {templateLoadState === "loading" || dashboardLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid gap-4 xl:grid-cols-12">
            <section className="overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 xl:col-span-7">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <CalendarDays className="size-4" aria-hidden />
                    {t("nextUp")}
                  </span>
                  {primaryWorkout ? (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {t("planReady")}
                    </span>
                  ) : null}
                </div>

                {primaryWorkout ? (
                  <>
                    <div className="mt-9">
                      <h2 className="text-3xl font-semibold tracking-[-0.035em] text-foreground">
                        {primaryWorkout.name}
                      </h2>
                      <p className="mt-2 max-w-[48ch] text-sm leading-6 text-muted-foreground">
                        {primaryWorkout.description ?? t("planFallbackDescription")}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {primaryWorkout.exercises.slice(0, 4).map((item) => (
                        <span
                          key={item.id}
                          className="rounded-lg border border-border bg-background/70 px-2.5 py-1.5 text-xs text-muted-foreground"
                        >
                          {item.exercise.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                      <div className="flex items-center gap-5 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Dumbbell className="size-4 text-primary" aria-hidden />
                          {t("exerciseCount", {
                            count: primaryWorkout.exercises.length,
                          })}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Timer className="size-4 text-primary" aria-hidden />
                          {t("reviewBeforeTraining")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditWorkout(primaryWorkout)}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-primary/5"
                        >
                          <Pencil className="size-4" aria-hidden />
                          {t("reviewPlan")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onStartWorkout(primaryWorkout)}
                          disabled={startingId !== null}
                          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Play className="size-4" fill="currentColor" aria-hidden />
                          {startingId === primaryWorkout.id
                            ? t("starting")
                            : t("startSession")}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="my-auto max-w-md">
                    <Layers3 className="size-7 text-primary" aria-hidden />
                    <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                      {t("emptyPlanTitle")}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t("emptyPlanDescription")}
                    </p>
                    <button
                      type="button"
                      onClick={onCreateWorkout}
                      className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Plus className="size-4" aria-hidden />
                      {t("buildWorkout")}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 xl:col-span-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("consistency")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("consistencyDescription")}
                  </p>
                </div>
                <TrendingUp className="size-5 text-primary" aria-hidden />
              </div>

              {dashboardReady ? (
                <>
                  <div className="mt-8 grid grid-cols-7 gap-2" aria-label={t("weekAria")}> 
                    {dashboard.progress.week.days.map((day, index) => (
                      <div key={`${day.label}-${index}`} className="text-center">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {day.label}
                        </span>
                        <span
                          className={
                            day.completed
                              ? "mx-auto mt-3 block size-8 rounded-full bg-primary shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
                              : "mx-auto mt-3 block size-8 rounded-full border border-border bg-muted"
                          }
                          aria-hidden
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 border-t border-border pt-5">
                    <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                      {dashboard.weeklySummary.workoutsThisWeek}
                      <span className="ml-1 text-base font-medium text-muted-foreground">
                        {t("sessions")}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("sessionsThisWeek")}
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted" />
              )}
            </section>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={TrendingUp}
          label={t("weeklyVolume")}
          value={
            dashboardReady
              ? `${formatNumber(dashboard.weeklySummary.totalVolumeThisWeek, locale)} kg`
              : "—"
          }
          detail={t("weeklyVolumeDetail")}
        />
        <Metric
          icon={CalendarDays}
          label={t("sessionsThisWeek")}
          value={dashboardReady ? String(dashboard.weeklySummary.workoutsThisWeek) : "—"}
          detail={t("sessionsDetail")}
        />
        <Metric
          icon={Flame}
          label={t("currentStreak")}
          value={dashboardReady ? String(dashboard.streak) : "—"}
          detail={t("streakDetail")}
        />
        <Metric
          icon={Layers3}
          label={t("plannedExercises")}
          value={templateLoadState === "success" ? String(totalExercises) : "—"}
          detail={t("plannedExercisesDetail")}
        />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-12">
        <section className="rounded-2xl border border-border bg-card p-6 xl:col-span-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {t("trainingPattern")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("trainingPatternDescription")}
              </p>
            </div>
          </div>
          <div className="mt-7">
            <TrainingProgressSection
              loading={!dashboardReady}
              progress={dashboardReady ? dashboard.progress : null}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 xl:col-span-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {t("lastSession")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("lastSessionDescription")}
              </p>
            </div>
            <Clock3 className="size-5 text-primary" aria-hidden />
          </div>
          {dashboardReady && dashboard.lastSession ? (
            <button
              type="button"
              onClick={onViewHistory}
              className="mt-8 w-full rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-base font-semibold text-foreground">
                  {dashboard.lastSession.workoutName}
                </p>
                <ArrowRight className="size-4 text-primary" aria-hidden />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <span>
                  <strong className="block font-semibold text-foreground tabular-nums">
                    {dashboard.lastSession.totalSets}
                  </strong>
                  <span className="text-xs text-muted-foreground">{t("sets")}</span>
                </span>
                <span>
                  <strong className="block font-semibold text-foreground tabular-nums">
                    {formatNumber(dashboard.lastSession.totalVolume, locale)} kg
                  </strong>
                  <span className="text-xs text-muted-foreground">{t("volume")}</span>
                </span>
                <span>
                  <strong className="block font-semibold text-foreground tabular-nums">
                    {dashboard.lastSession.durationMinutes}
                  </strong>
                  <span className="text-xs text-muted-foreground">{t("minutes")}</span>
                </span>
              </div>
            </button>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">
              {t("lastSessionEmpty")}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t("workoutLibrary")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("workoutLibraryDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateWorkout}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-primary/5"
          >
            <Plus className="size-4" aria-hidden />
            {t("buildWorkout")}
          </button>
        </div>

        {templateLoadState === "loading" ? (
          <div className="mt-6 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : null}

        {templateLoadState === "error" ? (
          <div className="mt-6 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
            <div className="flex items-center justify-between gap-4">
              {t("workoutsError")}
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-destructive/35 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-destructive/10"
              >
                {t("tryAgain")}
              </button>
            </div>
          </div>
        ) : null}

        {templateLoadState === "empty" ? (
          <div className="mt-6 rounded-xl border border-dashed border-border p-7 text-center">
            <Layers3 className="mx-auto size-6 text-primary" aria-hidden />
            <p className="mt-3 font-medium text-foreground">{t("emptyPlanTitle")}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {t("emptyPlanDescription")}
            </p>
          </div>
        ) : null}

        {templateLoadState === "success" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workouts.map((workout) => (
              <article
                key={workout.id}
                className="group rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/45"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Dumbbell className="size-4" aria-hidden />
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditWorkout(workout)}
                    className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                    aria-label={t("editPlanAria", { name: workout.name })}
                    title={t("editPlan")}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </button>
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {workout.name}
                </h3>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                  {workout.description ?? t("planFallbackDescription")}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {t("exerciseCount", { count: workout.exercises.length })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditWorkout(workout)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/75"
                  >
                    {t("reviewPlan")}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
