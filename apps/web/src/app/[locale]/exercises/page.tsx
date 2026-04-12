"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { ExerciseFilterChips } from "@/components/workouts/exercise-filter-chips";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import { Plus } from "lucide-react";
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
    <main className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-lg px-2 py-6 sm:px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label={t("newExercise")}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            <span>{t("newExerciseShort")}</span>
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="mt-4 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
        />

        <ExerciseFilterChips
          options={muscleGroups}
          selected={filter}
          onSelect={setFilter}
          className="mt-3"
          translateLabel={(key) => t(key)}
          allLabel={t("filterAll")}
        />

        <div className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("allExercises")}
          </h2>

          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("loading")}
            </p>
          ) : exercises.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("noResults")}
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {resolveExerciseDisplayName(
                        tCatalog,
                        ex.catalogKey,
                        ex.name,
                      )}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {ex.equipment && (
                        <span className="text-[11px] capitalize text-muted-foreground">
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
                    <span className="shrink-0 text-[11px] capitalize text-muted-foreground">
                      {t(ex.muscleGroup)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
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
