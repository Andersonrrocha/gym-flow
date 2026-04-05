import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { normalizeSession } from "@/lib/session-normalize";
import type { SessionExercise, WorkoutSession } from "@/types/workouts";

describe("normalizeSession", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "00000000-0000-4000-8000-000000000001",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds one empty set when exercise has no sets", () => {
    const session: WorkoutSession = {
      id: "s1",
      workoutId: "w1",
      workoutName: null,
      status: "IN_PROGRESS",
      startedAt: "2026-01-01T10:00:00.000Z",
      finishedAt: null,
      exercises: [
        {
          id: "ex1",
          exerciseId: "e1",
          nameSnapshot: "A",
          exerciseCatalogKey: null,
          plannedSets: 1,
          plannedReps: null,
          order: 0,
          completed: false,
          sets: [],
        },
      ],
    };
    const out = normalizeSession(session);
    expect(out.exercises[0].sets).toHaveLength(1);
    expect(out.exercises[0].sets[0].setNumber).toBe(1);
    expect(out.exercises[0].completed).toBe(false);
  });

  it("renumbers sets sequentially", () => {
    const ex: SessionExercise = {
      id: "ex1",
      exerciseId: "e1",
      nameSnapshot: "A",
      exerciseCatalogKey: null,
      plannedSets: 2,
      plannedReps: null,
      order: 0,
      completed: false,
      sets: [
        {
          id: "a",
          setNumber: 5,
          reps: 8,
          weight: 40,
          completed: false,
          createdAt: "2026-01-01T10:00:00.000Z",
        },
        {
          id: "b",
          setNumber: 9,
          reps: 8,
          weight: 40,
          completed: false,
          createdAt: "2026-01-01T10:01:00.000Z",
        },
      ],
    };
    const out = normalizeSession({
      id: "s1",
      workoutId: "w1",
      workoutName: null,
      status: "IN_PROGRESS",
      startedAt: "2026-01-01T10:00:00.000Z",
      finishedAt: null,
      exercises: [ex],
    });
    expect(out.exercises[0].sets.map((s) => s.setNumber)).toEqual([1, 2]);
  });

  it("clears completed flag when not all sets are done", () => {
    const ex: SessionExercise = {
      id: "ex1",
      exerciseId: "e1",
      nameSnapshot: "A",
      exerciseCatalogKey: null,
      plannedSets: 2,
      plannedReps: null,
      order: 0,
      completed: true,
      sets: [
        {
          id: "a",
          setNumber: 1,
          reps: 8,
          weight: 40,
          completed: true,
          createdAt: "2026-01-01T10:00:00.000Z",
        },
        {
          id: "b",
          setNumber: 2,
          reps: 8,
          weight: 40,
          completed: false,
          createdAt: "2026-01-01T10:01:00.000Z",
        },
      ],
    };
    const out = normalizeSession({
      id: "s1",
      workoutId: "w1",
      workoutName: null,
      status: "IN_PROGRESS",
      startedAt: "2026-01-01T10:00:00.000Z",
      finishedAt: null,
      exercises: [ex],
    });
    expect(out.exercises[0].completed).toBe(false);
  });
});
