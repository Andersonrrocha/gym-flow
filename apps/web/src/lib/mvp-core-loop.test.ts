import { describe, it, expect } from "vitest";
import { buildHomeDashboard } from "@/lib/home-dashboard-stats";
import { normalizeSession } from "@/lib/session-normalize";
import { reconcileActiveSession } from "@/lib/session-reconcile";
import type { WorkoutSession } from "@/types/workouts";

describe("MVP core data loop", () => {
  it("chains normalize → reconcile → home dashboard stats", () => {
    const remote: WorkoutSession = {
      id: "sess-1",
      workoutId: "w1",
      workoutName: "Push",
      status: "IN_PROGRESS",
      startedAt: "2026-04-01T12:00:00.000Z",
      finishedAt: null,
      exercises: [
        {
          id: "ex-1",
          exerciseId: "e1",
          nameSnapshot: "Bench",
          exerciseCatalogKey: "bench_press",
          plannedSets: 1,
          plannedReps: "5",
          order: 0,
          completed: false,
          sets: [
            {
              id: "set-1",
              setNumber: 1,
              reps: 5,
              weight: 100,
              completed: true,
              createdAt: "2026-04-01T12:05:00.000Z",
              syncedToBackend: true,
            },
          ],
        },
      ],
    };

    const local = normalizeSession(remote);
    const merged = reconcileActiveSession(local, remote);

    expect(merged.backendSynced).toBe(true);
    expect(merged.exercises[0].sets).toHaveLength(1);

    const completed: WorkoutSession = {
      ...merged,
      status: "COMPLETED",
      finishedAt: "2026-04-01T13:00:00.000Z",
    };

    const dash = buildHomeDashboard([completed], {
      now: new Date(2026, 3, 4),
      localeForLabels: "en",
    });
    expect(dash.progress.months.length).toBeGreaterThanOrEqual(1);
  });
});
