/**
 * Session persistence via localStorage — resilience and offline fallback layer.
 *
 * Lifecycle:
 *  1. saveActiveSession  — cache written on every in-progress session state change
 *  2. getActiveSession   — read once on ActiveWorkoutPage mount to restore state
 *  3. clearActiveSession — called when the user finishes or cancels the workout
 *  4. saveWorkoutSession — appends the completed session as an offline fallback copy
 *  5. getWorkoutSessions / getWorkoutSessionById — fallback reads when backend is unavailable
 *
 * Role:
 *  localStorage is NOT the source of truth. The backend (GraphQL API) is primary.
 *  These functions exist for resilience (page refresh during workout) and offline fallback
 *  when API calls fail. Pages always prefer backend data and use localStorage only as a
 *  secondary option.
 *
 * All keys use a versioned envelope. If the stored version doesn't match
 * STORAGE_VERSION the data is treated as stale and the key is removed so
 * subsequent reads don't silently re-attempt parsing.
 */

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

    if (envelope.version !== STORAGE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    return envelope.data;
  } catch {
    localStorage.removeItem(key);
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
