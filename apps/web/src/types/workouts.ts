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
  catalogKey?: string | null;
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
  createdAt: string;
  syncedToBackend?: boolean;
};

export type SessionExercise = {
  id: string;
  exerciseId: string;
  nameSnapshot: string;
  exerciseCatalogKey?: string | null;
  plannedSets: number | null;
  plannedReps: string | null;
  order: number;
  completed: boolean;
  sets: SessionSet[];
};

export type WorkoutSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type WorkoutSession = {
  id: string;
  workoutId: string;
  workoutName: string | null;
  status: WorkoutSessionStatus;
  startedAt: string;
  finishedAt: string | null;
  exercises: SessionExercise[];
  backendSynced?: boolean;
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

export type MonthTrainingIntensity = "none" | "single" | "multi";

export type MonthTrainingCell = {
  inCurrentMonth: boolean;
  isToday: boolean;
  intensity: MonthTrainingIntensity;
};

export type MonthTrainingGridModel = {
  cells: MonthTrainingCell[];
  rowCount: number;
  weekdayLabels: string[];
};

export type MonthProgressBlock = {
  grid: MonthTrainingGridModel;
  label: string;
};

export type HomeTrainingProgress = {
  week: WeeklyProgress;
  months: MonthProgressBlock[];
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

export type CompletedExerciseSummary = {
  nameSnapshot: string;
  exerciseCatalogKey?: string | null;
};

export type WorkoutSessionSummary = {
  workoutName: string;
  totalSets: number;
  totalVolume: number;
  durationMinutes: number;
  completedExercises: CompletedExerciseSummary[];
};
