import { describe, it, expect } from "vitest";
import { buildHomeDashboard } from "@/lib/home-dashboard-stats";
import type { WorkoutSession } from "@/types/workouts";

function session(id: string, finishedAt: string): WorkoutSession {
  return {
    id,
    workoutId: "w1",
    workoutName: "Test",
    status: "COMPLETED",
    startedAt: finishedAt,
    finishedAt,
    exercises: [],
  };
}

describe("buildHomeDashboard", () => {
  it("returns 3 month blocks ordered oldest → current", () => {
    const now = new Date(2026, 3, 15); // April 2026
    const dash = buildHomeDashboard([], { now, localeForLabels: "en" });

    expect(dash.progress.months).toHaveLength(3);
    expect(dash.progress.months[0].label).toMatch(/Feb/i);
    expect(dash.progress.months[1].label).toMatch(/Mar/i);
    expect(dash.progress.months[2].label).toMatch(/Apr/i);
  });

  it("each month block has a valid rectangular grid", () => {
    const now = new Date(2026, 3, 15);
    const dash = buildHomeDashboard([], { now, localeForLabels: "en" });

    for (const block of dash.progress.months) {
      expect(block.grid.cells.length % 7).toBe(0);
      expect(block.grid.cells.length).toBe(block.grid.rowCount * 7);
      expect(block.grid.weekdayLabels).toHaveLength(7);
      expect(block.grid.rowCount).toBeGreaterThanOrEqual(4);
    }
  });

  it("builds correct Sunday-first grid for April 2026", () => {
    const now = new Date(2026, 3, 3);
    const dash = buildHomeDashboard([], { now, localeForLabels: "en" });
    const april = dash.progress.months[2];
    const { cells, rowCount } = april.grid;

    expect(rowCount).toBe(5);

    // Sun Mar 29, Mon Mar 30, Tue Mar 31 → outside month
    expect(cells[0].inCurrentMonth).toBe(false);
    expect(cells[1].inCurrentMonth).toBe(false);
    expect(cells[2].inCurrentMonth).toBe(false);

    // Wed Apr 1 → inside month (column index 3)
    expect(cells[3].inCurrentMonth).toBe(true);

    // Sat May 2 → outside month
    expect(cells[34].inCurrentMonth).toBe(false);
  });

  it("marks multi-session days with multi intensity", () => {
    const now = new Date(2026, 3, 10);
    const day = "2026-04-10";
    const sessions = [
      session("a", `${day}T10:00:00.000Z`),
      session("b", `${day}T18:00:00.000Z`),
    ];
    const dash = buildHomeDashboard(sessions, { now, localeForLabels: "en" });
    const april = dash.progress.months[2];
    const multi = april.grid.cells.filter((c) => c.intensity === "multi");
    expect(multi.length).toBeGreaterThanOrEqual(1);
  });

  it("uses single intensity for exactly one session on a day", () => {
    const now = new Date(2026, 3, 10);
    const sessions = [session("a", "2026-04-10T10:00:00.000Z")];
    const dash = buildHomeDashboard(sessions, { now, localeForLabels: "en" });
    const april = dash.progress.months[2];
    expect(april.grid.cells.filter((c) => c.intensity === "multi").length).toBe(0);
    expect(april.grid.cells.filter((c) => c.intensity === "single").length).toBeGreaterThanOrEqual(1);
  });

  it("places training sessions in older month blocks", () => {
    const now = new Date(2026, 3, 3);
    const sessions = [session("a", "2026-03-15T10:00:00.000Z")];
    const dash = buildHomeDashboard(sessions, { now, localeForLabels: "en" });
    const march = dash.progress.months[1];
    const trained = march.grid.cells.filter(
      (c) => c.intensity === "single" || c.intensity === "multi",
    );
    expect(trained.length).toBeGreaterThanOrEqual(1);
  });

  it("exposes week progress with 7 days", () => {
    const now = new Date(2026, 3, 15);
    const dash = buildHomeDashboard([], { now, localeForLabels: "en" });
    expect(dash.progress.week.days).toHaveLength(7);
  });
});
