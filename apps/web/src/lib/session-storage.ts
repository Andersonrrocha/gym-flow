import type { WorkoutSession } from "@/types/workouts";

const ACTIVE_SESSION_KEY = "gymflow_active_session";
const COMPLETED_SESSIONS_KEY = "gymflow_completed_sessions";
const STORAGE_VERSION = 1;

type StorageEnvelope<T> = {
  version: number;
  data: T;
};

function isSSR(): boolean {
  return typeof window === "undefined";
}

function readJSON<T>(key: string): T | null {
  if (isSSR()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envelope: StorageEnvelope<T> = JSON.parse(raw);
    if (envelope.version !== STORAGE_VERSION) return null;
    return envelope.data;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, data: T): void {
  if (isSSR()) return;
  try {
    const envelope: StorageEnvelope<T> = { version: STORAGE_VERSION, data };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    /* storage full or unavailable */
  }
}

export function saveActiveSession(session: WorkoutSession): void {
  writeJSON(ACTIVE_SESSION_KEY, session);
}

export function getActiveSession(): WorkoutSession | null {
  return readJSON<WorkoutSession>(ACTIVE_SESSION_KEY);
}

export function clearActiveSession(): void {
  if (isSSR()) return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    /* noop */
  }
}

export function saveWorkoutSession(session: WorkoutSession): void {
  const sessions = getWorkoutSessions();
  sessions.unshift(session);
  writeJSON(COMPLETED_SESSIONS_KEY, sessions);
}

export function getWorkoutSessions(): WorkoutSession[] {
  return readJSON<WorkoutSession[]>(COMPLETED_SESSIONS_KEY) ?? [];
}

export function getWorkoutSessionById(id: string): WorkoutSession | null {
  return getWorkoutSessions().find((s) => s.id === id) ?? null;
}

export function getLatestSessionByWorkoutId(
  workoutId: string,
): WorkoutSession | null {
  return (
    getWorkoutSessions().find(
      (s) => s.workoutId === workoutId && s.status === "COMPLETED",
    ) ?? null
  );
}
