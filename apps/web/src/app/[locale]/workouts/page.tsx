"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/use-logout";
import { SectionHeader } from "@/components/workouts/section-header";
import { TrainingStreak } from "@/components/workouts/training-streak";
import { WeeklyProgress } from "@/components/workouts/weekly-progress";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { StatItem } from "@/components/stats/StatItem";
import {
  todayWorkoutMock,
  lastWorkoutMock,
  weeklyProgressMock,
  quickStatsMock,
} from "@/mocks/workouts";

export default function WorkoutsPage() {
  const t = useTranslations("WorkoutHome");
  const locale = useLocale();
  const router = useRouter();
  const { logout } = useLogout();

  const today = todayWorkoutMock;
  const last = lastWorkoutMock;
  const weekly = weeklyProgressMock;
  const stats = quickStatsMock;

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("greeting")} 💪
          </h1>
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

        {/* Desktop: 2-column layout / Mobile: single column */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Left column (wider) */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <WorkoutCard
              workout={today}
              labels={{
                title: t("todayWorkout"),
                exercises: t("exercises", { count: today.exerciseCount }),
                estimatedTime: t("estimatedTime", {
                  minutes: today.estimatedMinutes,
                }),
                startWorkout: t("startWorkout"),
              }}
              onStart={() => router.push(`/${locale}/workouts/active`)}
            />

            {/* Weekly progress */}
            <div>
              <SectionHeader title={t("weeklyProgress")} />
              <WeeklyProgress data={weekly} className="mt-2" />
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Quick Stats */}
            <div>
              <SectionHeader title={t("quickStats")} />
              <div className="mt-2 flex gap-6 rounded-xl border border-border bg-card p-3">
                <StatItem
                  value={String(stats.workoutsThisWeek)}
                  label={t("workoutsThisWeek", {
                    count: stats.workoutsThisWeek,
                  })}
                />
                <StatItem
                  value={stats.totalVolumeThisWeek.toLocaleString()}
                  label={t("volumeThisWeek", {
                    value: stats.totalVolumeThisWeek.toLocaleString(),
                  })}
                />
              </div>
            </div>

            {/* Last workout summary */}
            <div>
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
                    {t("totalVolume", {
                      value: last.totalVolume.toLocaleString(),
                    })}
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">
                    {t("duration", { minutes: last.duration })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
