import type {
  WorkoutSession,
  WeeklyProgress,
  MonthTrainingCell,
  MonthTrainingGridModel,
  MonthProgressBlock,
  HomeTrainingProgress,
} from "@/types/workouts";
import { computeSessionMetrics } from "@/lib/workout-metrics";
import {
  toLocalDateString,
  dateToLocalString,
  getMondayOfWeek,
  getSundayOfWeek,
  addDays,
  subtractOneDay,
  startOfMonth,
  endOfMonth,
} from "@/lib/date-local";

export type LastSessionSummary = {
  sessionId: string;
  workoutName: string;
  totalSets: number;
  totalVolume: number;
  durationMinutes: number;
};

export type WeeklySummary = {
  workoutsThisWeek: number;
  totalVolumeThisWeek: number;
};

export type HomeDashboard = {
  lastSession: LastSessionSummary | null;
  weeklySummary: WeeklySummary;
  progress: HomeTrainingProgress;
  streak: number;
};

function buildSingleMonthGrid(
  countsByDay: Map<string, number>,
  targetMonth: Date,
  todayStr: string,
  locale: string,
): { grid: MonthTrainingGridModel; label: string } {
  const firstOfMonth = startOfMonth(targetMonth);
  const lastOfMonth = endOfMonth(targetMonth);
  const firstStr = dateToLocalString(firstOfMonth);
  const lastStr = dateToLocalString(lastOfMonth);

  const gridStart = getSundayOfWeek(firstOfMonth);
  const gridEndSaturday = addDays(getSundayOfWeek(lastOfMonth), 6);
  const endLimit = dateToLocalString(gridEndSaturday);

  const cells: MonthTrainingCell[] = [];
  let d = new Date(gridStart);

  while (dateToLocalString(d) <= endLimit) {
    const ds = dateToLocalString(d);
    const inCurrentMonth = ds >= firstStr && ds <= lastStr;
    const isToday = ds === todayStr;

    let intensity: MonthTrainingCell["intensity"] = "none";
    if (inCurrentMonth) {
      const c = countsByDay.get(ds) ?? 0;
      if (c >= 2) intensity = "multi";
      else if (c === 1) intensity = "single";
    }

    cells.push({ inCurrentMonth, isToday, intensity });
    d = addDays(d, 1);
  }

  const rowCount = cells.length / 7;

  const narrowFmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    narrowFmt.format(addDays(gridStart, i)),
  );

  const label = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(firstOfMonth);

  return { grid: { cells, rowCount, weekdayLabels }, label };
}

function buildMonthProgressBlocks(
  sessions: WorkoutSession[],
  now: Date,
  locale: string,
  count: number = 3,
): MonthProgressBlock[] {
  const countsByDay = new Map<string, number>();
  for (const s of sessions) {
    const ref = s.finishedAt ?? s.startedAt;
    const key = toLocalDateString(ref);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const todayStr = dateToLocalString(now);

  const blocks: MonthProgressBlock[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const { grid, label } = buildSingleMonthGrid(countsByDay, target, todayStr, locale);
    blocks.push({ grid, label });
  }

  return blocks;
}

export type BuildHomeDashboardOptions = {
  now?: Date;
  localeForLabels?: string;
};

export function buildHomeDashboard(
  sessions: WorkoutSession[],
  opts?: BuildHomeDashboardOptions,
): HomeDashboard {
  const now = opts?.now ?? new Date();
  const locale = opts?.localeForLabels ?? "en";

  const trainingDays = new Set<string>();
  for (const s of sessions) {
    const ref = s.finishedAt ?? s.startedAt;
    trainingDays.add(toLocalDateString(ref));
  }

  const monday = getMondayOfWeek(now);
  const weekDates: Date[] = Array.from({ length: 7 }, (_, i) =>
    addDays(monday, i),
  );
  const weekDateStrings = weekDates.map(dateToLocalString);

  const narrowFmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const week: WeeklyProgress = {
    days: weekDates.map((d, i) => ({
      label: narrowFmt.format(d),
      completed: trainingDays.has(weekDateStrings[i]),
    })),
    totalCompleted: weekDateStrings.filter((ds) => trainingDays.has(ds))
      .length,
    totalPlanned: 7,
  };

  const months = buildMonthProgressBlocks(sessions, now, locale, 3);

  const weekStart = weekDateStrings[0];
  const weekEnd = weekDateStrings[6];
  let workoutsThisWeek = 0;
  let totalVolumeThisWeek = 0;
  for (const s of sessions) {
    const ds = toLocalDateString(s.finishedAt ?? s.startedAt);
    if (ds >= weekStart && ds <= weekEnd) {
      workoutsThisWeek++;
      const metrics = computeSessionMetrics(s);
      totalVolumeThisWeek += metrics.totalVolume;
    }
  }

  const todayStr = dateToLocalString(now);
  let streak = 0;
  const streakStart = trainingDays.has(todayStr) ? now : subtractOneDay(now);
  let cursor = new Date(streakStart);
  cursor.setHours(0, 0, 0, 0);
  while (trainingDays.has(dateToLocalString(cursor))) {
    streak++;
    cursor = subtractOneDay(cursor);
  }

  let lastSession: LastSessionSummary | null = null;
  if (sessions.length > 0) {
    const s = sessions[0];
    const metrics = computeSessionMetrics(s);
    lastSession = {
      sessionId: s.id,
      workoutName: metrics.workoutName,
      totalSets: metrics.totalSets,
      totalVolume: metrics.totalVolume,
      durationMinutes: metrics.durationMinutes,
    };
  }

  return {
    lastSession,
    weeklySummary: { workoutsThisWeek, totalVolumeThisWeek },
    progress: { week, months },
    streak,
  };
}
