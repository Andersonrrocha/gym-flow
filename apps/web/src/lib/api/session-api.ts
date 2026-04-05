import type { ApolloClient } from "@apollo/client";
import type {
  WorkoutSession,
  WorkoutSessionStatus,
  SessionExercise,
  SessionSet,
} from "@/types/workouts";
import {
  START_SESSION_FROM_WORKOUT,
  LOG_SESSION_SET,
  FINISH_WORKOUT_SESSION,
  LIST_USER_SESSIONS,
  GET_WORKOUT_SESSION,
} from "@/graphql/sessions/session.operations";

function logSessionDebug(message: string, err: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[session-api] ${message}`, err);
  }
}

function toIso(value: unknown): string {
  if (value == null) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

type GqlSessionSet = {
  id: string;
  sessionExerciseId: string;
  reps: number;
  weight: number;
  setNumber: number;
  createdAt: unknown;
};

type GqlSessionItem = {
  id: string;
  exerciseId: string;
  nameSnapshot: string;
  plannedSets?: number | null;
  plannedReps?: string | null;
  order: number;
  exercise?: {
    id: string;
    name: string;
    catalogKey?: string | null;
  };
  sets: GqlSessionSet[];
};

type GqlWorkoutSession = {
  id: string;
  workoutId?: string | null;
  workoutName?: string | null;
  status: string;
  startedAt: unknown;
  finishedAt?: unknown | null;
  sessionItems: GqlSessionItem[];
};

export function mapGqlWorkoutSessionToUi(
  data: GqlWorkoutSession,
  options?: { backendSynced?: boolean },
): WorkoutSession {
  const status = data.status as WorkoutSessionStatus;
  const backendSynced = options?.backendSynced ?? true;

  const exercises: SessionExercise[] = data.sessionItems.map((item) => ({
    id: item.id,
    exerciseId: item.exerciseId,
    nameSnapshot: item.nameSnapshot,
    exerciseCatalogKey: item.exercise?.catalogKey ?? null,
    plannedSets: item.plannedSets ?? null,
    plannedReps: item.plannedReps ?? null,
    order: item.order,
    completed: status === "COMPLETED",
    sets: item.sets.map((s) => ({
      id: s.id,
      setNumber: s.setNumber,
      weight: s.weight,
      reps: s.reps,
      completed: true,
      createdAt: toIso(s.createdAt),
      syncedToBackend: true,
    })),
  }));

  return {
    id: data.id,
    workoutId: data.workoutId ?? "",
    workoutName: data.workoutName ?? null,
    status,
    startedAt: toIso(data.startedAt),
    finishedAt: data.finishedAt ? toIso(data.finishedAt) : null,
    backendSynced,
    exercises,
  };
}

/** Copy weight/reps from last local session for the same template (UX prefill). */
export function mergeSessionWithLocalPrefill(
  session: WorkoutSession,
  previous: WorkoutSession | null,
): WorkoutSession {
  if (!previous) return session;
  return {
    ...session,
    exercises: session.exercises.map((ex) => {
      const prevEx = previous.exercises.find(
        (p) => p.exerciseId === ex.exerciseId,
      );
      if (!prevEx?.sets.length) return ex;
      const nextSets = ex.sets.map((set, i) => {
        const p = prevEx.sets[i];
        if (!p) return set;
        return { ...set, weight: p.weight, reps: p.reps };
      });
      return { ...ex, sets: nextSets.length > 0 ? nextSets : ex.sets };
    }),
  };
}

export async function startSessionFromWorkoutApi(
  client: ApolloClient,
  workoutId: string,
): Promise<WorkoutSession | null> {
  try {
    const { data } = await client.mutate<{
      startSessionFromWorkout: GqlWorkoutSession;
    }>({
      mutation: START_SESSION_FROM_WORKOUT,
      variables: { input: { workoutId } },
    });
    if (!data?.startSessionFromWorkout) return null;
    return mapGqlWorkoutSessionToUi(data.startSessionFromWorkout, {
      backendSynced: true,
    });
  } catch (e) {
    logSessionDebug("startSessionFromWorkout failed", e);
    return null;
  }
}

export type LogSetInput = {
  sessionExerciseId: string;
  reps: number;
  weight: number;
  setNumber: number;
};

export async function logSessionSetApi(
  client: ApolloClient,
  input: LogSetInput,
): Promise<SessionSet | null> {
  try {
    const { data } = await client.mutate<{
      logSessionSet: SessionSet & { createdAt: string };
    }>({
      mutation: LOG_SESSION_SET,
      variables: {
        input: {
          sessionExerciseId: input.sessionExerciseId,
          reps: input.reps,
          weight: input.weight,
          setNumber: input.setNumber,
        },
      },
    });
    if (!data?.logSessionSet) return null;
    const row = data.logSessionSet as SessionSet & { createdAt: unknown };
    return {
      id: row.id,
      setNumber: row.setNumber,
      weight: row.weight,
      reps: row.reps,
      completed: true,
      createdAt: toIso(row.createdAt),
      syncedToBackend: true,
    };
  } catch (e) {
    logSessionDebug("logSessionSet failed", e);
    return null;
  }
}

export async function finishWorkoutSessionApi(
  client: ApolloClient,
  sessionId: string,
): Promise<WorkoutSession | null> {
  try {
    const { data } = await client.mutate<{
      finishWorkoutSession: GqlWorkoutSession;
    }>({
      mutation: FINISH_WORKOUT_SESSION,
      variables: { input: { sessionId } },
    });
    if (!data?.finishWorkoutSession) return null;
    return mapGqlWorkoutSessionToUi(data.finishWorkoutSession, {
      backendSynced: true,
    });
  } catch (e) {
    logSessionDebug("finishWorkoutSession failed", e);
    return null;
  }
}

export async function getWorkoutSessionByIdApi(
  client: ApolloClient,
  sessionId: string,
): Promise<WorkoutSession | null> {
  try {
    const { data } = await client.query<{
      workoutSession: GqlWorkoutSession | null;
    }>({
      query: GET_WORKOUT_SESSION,
      variables: { id: sessionId },
      fetchPolicy: "network-only",
    });
    const s = data?.workoutSession;
    if (!s) return null;
    return mapGqlWorkoutSessionToUi(s, { backendSynced: true });
  } catch (e) {
    logSessionDebug("workoutSession failed", e);
    return null;
  }
}

export async function listUserSessionsApi(
  client: ApolloClient,
  status?: "COMPLETED" | "IN_PROGRESS" | "CANCELLED",
): Promise<WorkoutSession[]> {
  try {
    const { data } = await client.query<{
      listUserSessions: GqlWorkoutSession[];
    }>({
      query: LIST_USER_SESSIONS,
      variables: { status: status ?? null },
      fetchPolicy: "network-only",
    });
    const list = data?.listUserSessions ?? [];
    return list.map((s) => mapGqlWorkoutSessionToUi(s, { backendSynced: true }));
  } catch (e) {
    logSessionDebug("listUserSessions failed", e);
    return [];
  }
}

export function mergeRemoteAndLocalSessions(
  remote: WorkoutSession[],
  local: WorkoutSession[],
): WorkoutSession[] {
  const byId = new Map<string, WorkoutSession>();
  for (const s of remote) {
    byId.set(s.id, s);
  }
  for (const s of local) {
    if (!byId.has(s.id)) {
      byId.set(s.id, s);
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}
