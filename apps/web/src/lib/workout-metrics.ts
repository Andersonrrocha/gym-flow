import type {
  WorkoutSession,
  WorkoutSessionSummary,
} from "@/types/workouts";

export function computeSessionMetrics(
  session: WorkoutSession,
): WorkoutSessionSummary {
  const completedSets = session.exercises.flatMap((ex) =>
    ex.sets.filter((s) => s.completed),
  );

  const totalSets = completedSets.length;
  const totalVolume = completedSets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0,
  );

  const durationMinutes = session.finishedAt
    ? Math.round(
        (new Date(session.finishedAt).getTime() -
          new Date(session.startedAt).getTime()) /
          60000,
      )
    : 0;

  const completedExercises = session.exercises
    .filter((ex) => ex.completed)
    .map((ex) => ex.nameSnapshot);

  return {
    workoutName: session.workoutName ?? "Workout",
    totalSets,
    totalVolume,
    durationMinutes,
    completedExercises,
  };
}

export type ExerciseHistoryEntry = {
  date: string;
  sets: { setNumber: number; weight: number; reps: number }[];
};

export type ExerciseHistoryData = {
  exerciseName: string;
  pr: { weight: number; reps: number } | null;
  sessions: ExerciseHistoryEntry[];
};

export function deriveExerciseHistory(
  exerciseId: string,
  exerciseName: string,
  completedSessions: WorkoutSession[],
): ExerciseHistoryData {
  const sessions: ExerciseHistoryEntry[] = [];
  let pr: { weight: number; reps: number } | null = null;

  for (const session of completedSessions) {
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;

    const completedSets = ex.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;

    sessions.push({
      date: session.startedAt,
      sets: completedSets.map((s) => ({
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
      })),
    });

    for (const s of completedSets) {
      if (!pr || s.weight > pr.weight || (s.weight === pr.weight && s.reps > pr.reps)) {
        pr = { weight: s.weight, reps: s.reps };
      }
    }
  }

  return { exerciseName, pr, sessions };
}
