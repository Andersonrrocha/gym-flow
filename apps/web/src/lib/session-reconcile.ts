import type { WorkoutSession, SessionExercise, SessionSet } from "@/types/workouts";

/**
 * Merges a local (in-progress) session with a remote snapshot from the backend.
 *
 * Rules (deterministic — same inputs → same result):
 *
 * 1. Remote is SSOT for: exercise list and order, session metadata, persisted sets.
 * 2. Local sets with `syncedToBackend !== true` are preserved only when they don't
 *    collide with a remote set by `setNumber` on the same exercise.
 * 3. Among local pending sets with the same `setNumber`, keep the one with the latest `createdAt`.
 * 4. `setNumber` is renormalized 1..n after merge (remote first, then pending local).
 * 5. `exercise.completed` is recomputed: `true` only if every set in the merged result
 *    has `completed === true`. This prevents "exercise complete with incomplete sets".
 *
 * Exercises that exist in remote but not locally (e.g. added via API elsewhere) are
 * included in the result with no local sets. Exercises only in local are dropped since
 * the backend session is the canonical exercise list.
 */
export function reconcileActiveSession(
  local: WorkoutSession,
  remote: WorkoutSession,
): WorkoutSession {
  const reconciledExercises = remote.exercises.map((remoteEx) => {
    const localEx = local.exercises.find((l) => l.id === remoteEx.id);

    const remoteSets: SessionSet[] = remoteEx.sets;

    const localPendingSets: SessionSet[] = localEx
      ? localEx.sets.filter((s) => !s.syncedToBackend)
      : [];

    const remoteSetNumbers = new Set(remoteSets.map((s) => s.setNumber));
    const eligible = localPendingSets.filter(
      (s) => !remoteSetNumbers.has(s.setNumber),
    );

    const deduped = new Map<number, SessionSet>();
    for (const s of eligible) {
      const existing = deduped.get(s.setNumber);
      if (!existing || s.createdAt > existing.createdAt) {
        deduped.set(s.setNumber, s);
      }
    }

    const merged: SessionSet[] = [
      ...remoteSets.sort((a, b) => a.setNumber - b.setNumber),
      ...Array.from(deduped.values()).sort((a, b) => a.setNumber - b.setNumber),
    ];

    const normalizedSets = merged.map((s, idx) => ({ ...s, setNumber: idx + 1 }));

    const allCompleted =
      normalizedSets.length > 0 && normalizedSets.every((s) => s.completed);

    const reconciledEx: SessionExercise = {
      ...remoteEx,
      sets: normalizedSets,
      completed: allCompleted,
    };

    return reconciledEx;
  });

  return {
    ...remote,
    exercises: reconciledExercises,
    backendSynced: true,
  };
}
