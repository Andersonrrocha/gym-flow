import type {
  Exercise,
  ExerciseHistory,
  LastWorkoutSummary,
  SessionExercise,
  TodayWorkout,
  WeeklyProgress,
  Workout,
  WorkoutSession,
  WorkoutSessionSummary,
} from "@/types/workouts";

const exercises: Record<string, Exercise> = {
  bench: {
    id: "ex-1",
    name: "Bench Press",
    muscleGroup: "chest",
    equipment: "barbell",
    isSystem: true,
  },
  squat: {
    id: "ex-2",
    name: "Barbell Squat",
    muscleGroup: "legs",
    equipment: "barbell",
    isSystem: true,
  },
  row: {
    id: "ex-3",
    name: "Barbell Row",
    muscleGroup: "back",
    equipment: "barbell",
    isSystem: true,
  },
  ohp: {
    id: "ex-4",
    name: "Overhead Press",
    muscleGroup: "shoulders",
    equipment: "barbell",
    isSystem: true,
  },
  curl: {
    id: "ex-5",
    name: "Dumbbell Curl",
    muscleGroup: "biceps",
    equipment: "dumbbell",
    isSystem: true,
  },
  tricepPushdown: {
    id: "ex-6",
    name: "Tricep Pushdown",
    muscleGroup: "triceps",
    equipment: "cable",
    isSystem: true,
  },
  latPulldown: {
    id: "ex-7",
    name: "Lat Pulldown",
    muscleGroup: "back",
    equipment: "cable",
    isSystem: true,
  },
  legPress: {
    id: "ex-8",
    name: "Leg Press",
    muscleGroup: "legs",
    equipment: "machine",
    isSystem: true,
  },
  lateralRaise: {
    id: "ex-9",
    name: "Lateral Raise",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isSystem: true,
  },
  plank: {
    id: "ex-10",
    name: "Plank",
    muscleGroup: "core",
    equipment: "bodyweight",
    isSystem: true,
  },
};

export const exerciseCatalogMock: Exercise[] = Object.values(exercises);

export const recentExercisesMock: Exercise[] = [
  exercises.bench,
  exercises.squat,
  exercises.row,
  exercises.ohp,
];

export const todayWorkoutMock: TodayWorkout = {
  id: "schedule-1",
  workoutId: "w-1",
  name: "Push Day",
  exerciseCount: 5,
  estimatedMinutes: 55,
};

export const lastWorkoutMock: LastWorkoutSummary = {
  workoutName: "Pull Day",
  date: "2026-03-05",
  totalSets: 18,
  totalVolume: 4320,
  duration: 52,
};

export const weeklyProgressMock: WeeklyProgress = {
  days: [
    { label: "M", completed: true },
    { label: "T", completed: true },
    { label: "W", completed: false },
    { label: "T", completed: true },
    { label: "F", completed: false },
    { label: "S", completed: false },
    { label: "S", completed: false },
  ],
  totalCompleted: 3,
  totalPlanned: 5,
};

const mockTs = "2026-03-10T08:00:00.000Z";

const pushDayExercises: SessionExercise[] = [
  {
    id: "se-1",
    exerciseId: "ex-1",
    nameSnapshot: "Bench Press",
    plannedSets: 4,
    plannedReps: "8-10",
    order: 1,
    completed: false,
    sets: [
      { id: "ss-1", setNumber: 1, reps: 10, weight: 80, completed: true, createdAt: mockTs },
      { id: "ss-2", setNumber: 2, reps: 9, weight: 80, completed: true, createdAt: mockTs },
      { id: "ss-3", setNumber: 3, reps: 8, weight: 80, completed: false, createdAt: mockTs },
      { id: "ss-4", setNumber: 4, reps: 0, weight: 80, completed: false, createdAt: mockTs },
    ],
  },
  {
    id: "se-2",
    exerciseId: "ex-4",
    nameSnapshot: "Overhead Press",
    plannedSets: 3,
    plannedReps: "8-12",
    order: 2,
    completed: false,
    sets: [
      { id: "ss-5", setNumber: 1, reps: 0, weight: 40, completed: false, createdAt: mockTs },
      { id: "ss-6", setNumber: 2, reps: 0, weight: 40, completed: false, createdAt: mockTs },
      { id: "ss-7", setNumber: 3, reps: 0, weight: 40, completed: false, createdAt: mockTs },
    ],
  },
  {
    id: "se-3",
    exerciseId: "ex-9",
    nameSnapshot: "Lateral Raise",
    plannedSets: 3,
    plannedReps: "12-15",
    order: 3,
    completed: false,
    sets: [
      { id: "ss-8", setNumber: 1, reps: 0, weight: 10, completed: false, createdAt: mockTs },
      { id: "ss-9", setNumber: 2, reps: 0, weight: 10, completed: false, createdAt: mockTs },
      { id: "ss-10", setNumber: 3, reps: 0, weight: 10, completed: false, createdAt: mockTs },
    ],
  },
  {
    id: "se-4",
    exerciseId: "ex-6",
    nameSnapshot: "Tricep Pushdown",
    plannedSets: 3,
    plannedReps: "10-12",
    order: 4,
    completed: false,
    sets: [
      { id: "ss-11", setNumber: 1, reps: 0, weight: 25, completed: false, createdAt: mockTs },
      { id: "ss-12", setNumber: 2, reps: 0, weight: 25, completed: false, createdAt: mockTs },
      { id: "ss-13", setNumber: 3, reps: 0, weight: 25, completed: false, createdAt: mockTs },
    ],
  },
  {
    id: "se-5",
    exerciseId: "ex-5",
    nameSnapshot: "Dumbbell Curl",
    plannedSets: 3,
    plannedReps: "10-12",
    order: 5,
    completed: false,
    sets: [
      { id: "ss-14", setNumber: 1, reps: 0, weight: 14, completed: false, createdAt: mockTs },
      { id: "ss-15", setNumber: 2, reps: 0, weight: 14, completed: false, createdAt: mockTs },
      { id: "ss-16", setNumber: 3, reps: 0, weight: 14, completed: false, createdAt: mockTs },
    ],
  },
];

export const activeWorkoutMock: WorkoutSession = {
  id: "ws-1",
  workoutId: "w-1",
  workoutName: "Push Day",
  status: "IN_PROGRESS",
  startedAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
  finishedAt: null,
  exercises: pushDayExercises,
};

export const activeWorkoutSessionMock = activeWorkoutMock;

export const workoutSessionSummaryMock: WorkoutSessionSummary = {
  workoutName: "Push Day",
  totalSets: 16,
  totalVolume: 4320,
  durationMinutes: 52,
  completedExercises: [
    "Bench Press",
    "Overhead Press",
    "Lateral Raise",
    "Tricep Pushdown",
    "Dumbbell Curl",
  ],
};

export const exerciseHistoryMock: ExerciseHistory = {
  exercise: exercises.bench,
  pr: { weight: 90, reps: 6, date: "2026-02-20" },
  sessions: [
    {
      date: "2026-03-05",
      sets: [
        { setNumber: 1, weight: 80, reps: 10 },
        { setNumber: 2, weight: 80, reps: 9 },
        { setNumber: 3, weight: 80, reps: 8 },
        { setNumber: 4, weight: 85, reps: 6 },
      ],
    },
    {
      date: "2026-03-01",
      sets: [
        { setNumber: 1, weight: 80, reps: 10 },
        { setNumber: 2, weight: 80, reps: 10 },
        { setNumber: 3, weight: 80, reps: 9 },
        { setNumber: 4, weight: 80, reps: 8 },
      ],
    },
    {
      date: "2026-02-26",
      sets: [
        { setNumber: 1, weight: 75, reps: 10 },
        { setNumber: 2, weight: 75, reps: 10 },
        { setNumber: 3, weight: 80, reps: 8 },
        { setNumber: 4, weight: 80, reps: 7 },
      ],
    },
  ],
};

export type QuickStats = {
  workoutsThisWeek: number;
  totalVolumeThisWeek: number;
};

export const quickStatsMock: QuickStats = {
  workoutsThisWeek: 3,
  totalVolumeThisWeek: 12400,
};

export const workoutBuilderMock: Workout = {
  id: "w-1",
  name: "Push Day",
  description: "Chest, shoulders and triceps",
  exercises: [
    {
      id: "we-1",
      exercise: exercises.bench,
      order: 1,
      plannedSets: 4,
      plannedReps: "8-10",
      restSeconds: 120,
    },
    {
      id: "we-2",
      exercise: exercises.ohp,
      order: 2,
      plannedSets: 3,
      plannedReps: "8-12",
      restSeconds: 90,
    },
    {
      id: "we-3",
      exercise: exercises.lateralRaise,
      order: 3,
      plannedSets: 3,
      plannedReps: "12-15",
      restSeconds: 60,
    },
    {
      id: "we-4",
      exercise: exercises.tricepPushdown,
      order: 4,
      plannedSets: 3,
      plannedReps: "10-12",
      restSeconds: 60,
    },
    {
      id: "we-5",
      exercise: exercises.curl,
      order: 5,
      plannedSets: 3,
      plannedReps: "10-12",
      restSeconds: 60,
    },
  ],
};
