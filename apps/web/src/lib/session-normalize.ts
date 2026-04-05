import type { WorkoutSession, SessionExercise } from "@/types/workouts";

function normalizeExercise(exercise: SessionExercise): SessionExercise {
  const sets =
    exercise.sets.length === 0
      ? [
          {
            id: crypto.randomUUID(),
            setNumber: 1,
            weight: 0,
            reps: 0,
            completed: false,
            createdAt: new Date().toISOString(),
          },
        ]
      : exercise.sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));

  const allCompleted = sets.length > 0 && sets.every((s) => s.completed);
  const completed = exercise.completed && allCompleted;

  return { ...exercise, sets, completed };
}

export function normalizeSession(session: WorkoutSession): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(normalizeExercise),
  };
}
