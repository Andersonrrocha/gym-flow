"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/use-logout";
import { SectionHeader } from "@/components/workouts/section-header";
import { TrainingStreak } from "@/components/workouts/training-streak";
import { WeeklyProgress } from "@/components/workouts/weekly-progress";
import { PrimaryButton } from "@/components/workouts/primary-button";
import {
  todayWorkoutMock,
  lastWorkoutMock,
  weeklyProgressMock,
} from "@/mocks/workouts";

export default function WorkoutsPage() {
  const t = useTranslations("WorkoutHome");
  const locale = useLocale();
  const router = useRouter();
  const { logout } = useLogout();

  const today = todayWorkoutMock;
  const last = lastWorkoutMock;
  const weekly = weeklyProgressMock;

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("greeting")} 💪
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <TrainingStreak count={5} label={t("streakLabel")} />
            <button
              onClick={logout}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("logout")}
            </button>
          </div>
        </div>

        {/* Today's workout card */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <SectionHeader title={t("todayWorkout")} />
          <div className="mt-3">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {today.name}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {t("exercises", { count: today.exerciseCount })}
              </span>
              <span>·</span>
              <span>
                {t("estimatedTime", { minutes: today.estimatedMinutes })}
              </span>
            </div>
          </div>
          <PrimaryButton
            size="lg"
            className="mt-4 w-full"
            onClick={() => router.push(`/${locale}/workouts/active`)}
          >
            {t("startWorkout")}
          </PrimaryButton>
        </div>

        {/* Weekly progress */}
        <div className="mt-5">
          <SectionHeader title={t("weeklyProgress")} />
          <WeeklyProgress data={weekly} className="mt-2" />
        </div>

        {/* Last workout summary */}
        <div className="mt-5">
          <SectionHeader
            title={t("lastWorkout")}
            action={
              <button
                onClick={() =>
                  router.push(`/${locale}/workouts/history/ex-1`)
                }
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("viewHistory")}
              </button>
            }
          />
          <div className="mt-2 rounded-xl border border-border bg-card p-3">
            <p className="text-sm font-semibold text-foreground">
              {last.workoutName}
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono tabular-nums">
                {t("totalSets", { count: last.totalSets })}
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums">
                {t("totalVolume", { value: last.totalVolume.toLocaleString() })}
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums">
                {t("duration", { minutes: last.duration })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
