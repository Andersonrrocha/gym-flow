export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core"
  | "glutes"
  | "cardio";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "band"
  | "kettlebell";

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup | null;
  equipment: Equipment | null;
  isSystem: boolean;
};

export type WorkoutExercise = {
  id: string;
  exercise: Exercise;
  order: number;
  plannedSets: number | null;
  plannedReps: string | null;
  restSeconds: number | null;
};

export type Workout = {
  id: string;
  name: string;
  description: string | null;
  exercises: WorkoutExercise[];
};

export type SessionSet = {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
};

export type SessionExercise = {
  id: string;
  exerciseId: string;
  nameSnapshot: string;
  plannedSets: number | null;
  plannedReps: string | null;
  order: number;
  sets: SessionSet[];
};

export type WorkoutSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type WorkoutSession = {
  id: string;
  workoutName: string | null;
  status: WorkoutSessionStatus;
  startedAt: string;
  finishedAt: string | null;
  exercises: SessionExercise[];
};

export type WeekDay = {
  label: string;
  completed: boolean;
};

export type WeeklyProgress = {
  days: WeekDay[];
  totalCompleted: number;
  totalPlanned: number;
};

export type LastWorkoutSummary = {
  workoutName: string;
  date: string;
  totalSets: number;
  totalVolume: number;
  duration: number;
};

export type TodayWorkout = {
  id: string;
  workoutId: string;
  name: string;
  exerciseCount: number;
  estimatedMinutes: number;
};

export type ExerciseHistory = {
  exercise: Exercise;
  pr: { weight: number; reps: number; date: string };
  sessions: {
    date: string;
    sets: { setNumber: number; weight: number; reps: number }[];
  }[];
};
