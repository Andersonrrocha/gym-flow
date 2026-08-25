"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { ExerciseFilterChips } from "@/components/workouts/exercise-filter-chips";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import { Dumbbell, Plus, Search, SlidersHorizontal } from "lucide-react";
import { searchExercisesApi, createExerciseApi } from "@/lib/api/exercise-api";
import { applyExerciseListFilters } from "@/lib/exercise-filters";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import type { Exercise, MuscleGroup } from "@/types/workouts";

const muscleGroups: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "core",
  "glutes",
  "cardio",
];

export default function ExercisesPage() {
  const t = useTranslations("Exercises");
  const tCatalog = useTranslations("Exercises.catalog");
  const client = useApolloClient();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialFetch = useRef(true);

  const fetchExercises = useCallback(
    async (query?: string, muscleGroup?: string) => {
      await Promise.resolve();
      setLoading(true);
      const input: { query?: string; muscleGroup?: string } = {};
      if (query?.trim()) input.query = query.trim();
      if (muscleGroup) input.muscleGroup = muscleGroup;

      const results = await searchExercisesApi(
        client,
        Object.keys(input).length > 0 ? input : undefined,
      );

      setExercises(
        applyExerciseListFilters(results, query ?? "", muscleGroup ?? null),
      );
      setLoading(false);
    },
    [client],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = isInitialFetch.current ? 0 : 300;
    debounceRef.current = setTimeout(() => {
      isInitialFetch.current = false;
      void fetchExercises(search, filter ?? undefined);
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, filter, fetchExercises]);

  const handleCreate = useCallback(
    async (data: {
      name: string;
      muscleGroup?: string;
      equipment?: string;
    }): Promise<boolean> => {
      const result = await createExerciseApi(client, data);
      if (result) {
        void fetchExercises(search, filter ?? undefined);
        return true;
      }
      return false;
    },
    [client, fetchExercises, search, filter],
  );

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-[90rem] px-3 py-6 sm:px-5 lg:px-8 lg:py-9 xl:px-10">
        <header className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-primary">
              {t("libraryEyebrow")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground lg:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {t("libraryDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label={t("newExercise")}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            <span className="hidden sm:inline">{t("newExercise")}</span>
            <span className="sm:hidden">{t("newExerciseShort")}</span>
          </button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:border-border lg:border-r lg:pr-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="size-4 text-primary" aria-hidden />
              {t("libraryFilters")}
            </div>
            <ExerciseFilterChips
              options={muscleGroups}
              selected={filter}
              onSelect={setFilter}
              className="mt-4 lg:flex-col lg:items-stretch lg:gap-1.5"
              translateLabel={(key) => t(key)}
              allLabel={t("filterAll")}
            />
          </aside>

          <section className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
                />
              </label>
              <p className="shrink-0 text-sm text-muted-foreground">
                {loading ? t("loading") : t("resultCount", { count: exercises.length })}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
              <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(8rem,0.75fr)_minmax(8rem,0.75fr)_6rem] gap-4 border-border border-b bg-muted/35 px-5 py-3 lg:grid">
                <span className="text-xs font-semibold text-muted-foreground">{t("nameColumn")}</span>
                <span className="text-xs font-semibold text-muted-foreground">{t("muscleGroupColumn")}</span>
                <span className="text-xs font-semibold text-muted-foreground">{t("equipmentColumn")}</span>
                <span className="text-xs font-semibold text-muted-foreground">{t("sourceColumn")}</span>
              </div>

              {loading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-16 animate-pulse bg-card px-5 py-4">
                      <div className="h-3 w-1/3 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                  <Dumbbell className="size-6 text-primary" aria-hidden />
                  <p className="mt-3 text-sm text-muted-foreground">{t("noResults")}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/35 sm:px-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(8rem,0.75fr)_minmax(8rem,0.75fr)_6rem]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {resolveExerciseDisplayName(
                        tCatalog,
                        ex.catalogKey,
                        ex.name,
                      )}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {ex.equipment && (
                        <span className="text-[11px] capitalize text-muted-foreground lg:hidden">
                          {t(ex.equipment)}
                        </span>
                      )}
                      {!ex.isSystem && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          {t("custom")}
                        </span>
                      )}
                    </div>
                  </div>
                  {ex.muscleGroup && (
                    <span className="hidden text-sm capitalize text-muted-foreground lg:block">
                      {t(ex.muscleGroup)}
                    </span>
                  )}
                  <span className="hidden text-sm capitalize text-muted-foreground lg:block">
                    {ex.equipment ? t(ex.equipment) : "—"}
                  </span>
                  <span className="text-right text-[11px] font-medium text-muted-foreground lg:text-left">
                    {ex.isSystem ? t("catalogSource") : t("customSource")}
                  </span>
                </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <CreateExerciseModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        labels={{
          title: t("createTitle"),
          nameLabel: t("nameLabel"),
          namePlaceholder: t("namePlaceholder"),
          nameRequired: t("nameRequired"),
          muscleGroupLabel: t("muscleGroupLabel"),
          muscleGroupPlaceholder: t("muscleGroupPlaceholder"),
          equipmentLabel: t("equipmentLabel"),
          equipmentPlaceholder: t("equipmentPlaceholder"),
          create: t("create"),
          cancel: t("cancel"),
          creating: t("creating"),
        }}
        translateMuscleGroup={(key) => t(key)}
        translateEquipment={(key) => t(key)}
      />
    </main>
  );
}
