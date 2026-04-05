import { describe, it, expect } from "vitest";
import { reconcileActiveSession } from "@/lib/session-reconcile";
import type { SessionExercise, WorkoutSession } from "@/types/workouts";

function baseSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: "s1",
    workoutId: "w1",
    workoutName: "W",
    status: "IN_PROGRESS",
    startedAt: "2026-01-01T10:00:00.000Z",
    finishedAt: null,
    exercises: [],
    ...overrides,
  };
}

function ex(
  id: string,
  sets: SessionExercise["sets"],
  completed: boolean,
): SessionExercise {
  return {
    id,
    exerciseId: "e1",
    nameSnapshot: "Lift",
    exerciseCatalogKey: null,
    plannedSets: 3,
    plannedReps: "8",
    order: 0,
    completed,
    sets,
  };
}

describe("reconcileActiveSession", () => {
  it("does not duplicate remote sets when local has no pending", () => {
    const remoteSets = [
      {
        id: "r1",
        setNumber: 1,
        reps: 8,
        weight: 60,
        completed: true,
        createdAt: "2026-01-01T10:01:00.000Z",
        syncedToBackend: true,
      },
    ];
    const remote = baseSession({
      exercises: [ex("x1", remoteSets, true)],
    });
    const local = baseSession({
      exercises: [ex("x1", remoteSets, true)],
    });
    const out = reconcileActiveSession(local, remote);
    expect(out.exercises[0].sets).toHaveLength(1);
    expect(out.exercises[0].sets[0].id).toBe("r1");
  });

  it("merges local pending set when setNumber does not exist remotely", () => {
    const remoteSets = [
      {
        id: "r1",
        setNumber: 1,
        reps: 8,
        weight: 60,
        completed: true,
        createdAt: "2026-01-01T10:01:00.000Z",
        syncedToBackend: true,
      },
    ];
    const pending = {
      id: "p1",
      setNumber: 2,
      reps: 8,
      weight: 62.5,
      completed: false,
      createdAt: "2026-01-01T10:02:00.000Z",
      syncedToBackend: false,
    };
    const remote = baseSession({
      exercises: [ex("x1", remoteSets, false)],
    });
    const local = baseSession({
      exercises: [ex("x1", [...remoteSets, pending], false)],
    });
    const out = reconcileActiveSession(local, remote);
    expect(out.exercises[0].sets).toHaveLength(2);
    expect(out.exercises[0].sets.map((s) => s.setNumber)).toEqual([1, 2]);
  });

  it("drops local pending when same setNumber exists remotely (remote wins)", () => {
    const remoteSets = [
      {
        id: "r1",
        setNumber: 1,
        reps: 8,
        weight: 60,
        completed: true,
        createdAt: "2026-01-01T10:01:00.000Z",
        syncedToBackend: true,
      },
    ];
    const stalePending = {
      id: "p1",
      setNumber: 1,
      reps: 99,
      weight: 99,
      completed: false,
      createdAt: "2026-01-01T10:00:00.000Z",
      syncedToBackend: false,
    };
    const remote = baseSession({
      exercises: [ex("x1", remoteSets, true)],
    });
    const local = baseSession({
      exercises: [ex("x1", [...remoteSets, stalePending], false)],
    });
    const out = reconcileActiveSession(local, remote);
    expect(out.exercises[0].sets).toHaveLength(1);
    expect(out.exercises[0].sets[0].reps).toBe(8);
  });

  it("marks exercise incomplete when any merged set is incomplete", () => {
    const remoteSets = [
      {
        id: "r1",
        setNumber: 1,
        reps: 8,
        weight: 60,
        completed: true,
        createdAt: "2026-01-01T10:01:00.000Z",
        syncedToBackend: true,
      },
    ];
    const pending = {
      id: "p1",
      setNumber: 2,
      reps: 8,
      weight: 60,
      completed: false,
      createdAt: "2026-01-01T10:02:00.000Z",
      syncedToBackend: false,
    };
    const remote = baseSession({
      exercises: [ex("x1", remoteSets, true)],
    });
    const local = baseSession({
      exercises: [ex("x1", [...remoteSets, pending], true)],
    });
    const out = reconcileActiveSession(local, remote);
    expect(out.exercises[0].completed).toBe(false);
  });

  it("sets backendSynced true on result", () => {
    const remote = baseSession({
      exercises: [
        ex("x1", [], false),
      ],
    });
    const out = reconcileActiveSession(remote, remote);
    expect(out.backendSynced).toBe(true);
  });
});
