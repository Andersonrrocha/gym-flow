"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/workouts/section-header";
import { ExerciseFilterChips } from "@/components/workouts/exercise-filter-chips";
import { exerciseCatalogMock, recentExercisesMock } from "@/mocks/workouts";
import type { MuscleGroup } from "@/types/workouts";

const muscleGroups: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "core",
];

export default function CatalogPage() {
  const t = useTranslations("WorkoutCatalog");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return exerciseCatalogMock.filter((ex) => {
      const matchSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchFilter = !filter || ex.muscleGroup === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-xs font-medium text-primary hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="mt-4 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
        />

        {/* Filters */}
        <ExerciseFilterChips
          options={muscleGroups}
          selected={filter}
          onSelect={setFilter}
          className="mt-3"
        />

        {/* Recent */}
        {!search && !filter && (
          <div className="mt-5">
            <SectionHeader title={t("recent")} />
            <div className="mt-2 flex flex-col gap-1">
              {recentExercisesMock.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <span className="text-sm text-foreground">{ex.name}</span>
                  <span className="text-[11px] capitalize text-muted-foreground">
                    {ex.muscleGroup}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All / Filtered */}
        <div className="mt-5">
          <SectionHeader title={t("allExercises")} />
          <div className="mt-2 flex flex-col gap-1">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("noResults")}
              </p>
            ) : (
              filtered.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm text-foreground">{ex.name}</p>
                    <p className="text-[11px] capitalize text-muted-foreground">
                      {ex.equipment}
                    </p>
                  </div>
                  <span className="text-[11px] capitalize text-muted-foreground">
                    {ex.muscleGroup}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
