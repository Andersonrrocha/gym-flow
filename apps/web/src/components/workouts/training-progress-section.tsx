"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WeeklyProgress } from "@/components/workouts/weekly-progress";
import { MonthTrainingGrid } from "@/components/workouts/month-training-grid";
import {
  ProgressViewToggle,
  type ProgressViewMode,
} from "@/components/workouts/progress-view-toggle";
import type { HomeTrainingProgress } from "@/types/workouts";
import { cn } from "@/lib/utils";

function WeekSkeleton() {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-7 w-7 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

function MonthSkeleton() {
  return (
    <div className="flex justify-between">
      {[0, 1, 2].map((col) => (
        <div key={col}>
          <div className="mb-1.5 h-3.5 w-14 animate-pulse rounded bg-muted/40" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 12px)",
              gap: "3px",
            }}
          >
            {Array.from({ length: 35 }).map((_, i) => (
              <span
                key={i}
                className="animate-pulse rounded-[2px] bg-muted/30"
                style={{ width: 12, height: 12 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type TrainingProgressSectionProps = {
  loading: boolean;
  progress: HomeTrainingProgress | null;
  className?: string;
};

export function TrainingProgressSection({
  loading,
  progress,
  className,
}: TrainingProgressSectionProps) {
  const t = useTranslations("WorkoutHome");
  const [mode, setMode] = useState<ProgressViewMode>("week");

  return (
    <div className={cn(className)}>
      <div className="flex flex-nowrap items-center justify-between gap-2">
        <h2 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("trainingProgressTitle")}
        </h2>
        <ProgressViewToggle
          value={mode}
          onChange={setMode}
          groupAriaLabel={t("progressViewGroupAria")}
          weekLabel={t("progressViewWeek")}
          monthLabel={t("progressViewMonth")}
          weekAriaLabel={t("progressViewWeekAria")}
          monthAriaLabel={t("progressViewMonthAria")}
        />
      </div>

      <div className="mt-3">
        {loading ? (
          mode === "month" ? <MonthSkeleton /> : <WeekSkeleton />
        ) : progress ? (
          mode === "week" ? (
            <WeeklyProgress data={progress.week} />
          ) : (
            <div className="flex justify-between">
              {progress.months.map((block) => (
                <MonthTrainingGrid
                  key={block.label}
                  model={block.grid}
                  label={block.label}
                  ariaLabel={t("monthGridAria", { month: block.label })}
                />
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
