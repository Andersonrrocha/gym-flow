"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useApolloClient } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { SEARCH_EXERCISES } from "@/graphql/exercises/exercise.operations";
import { resolveExerciseDisplayName } from "@/lib/exercise-display-name";
import type { Exercise } from "@/types/workouts";

type GqlExercise = {
  id: string;
  name: string;
  catalogKey?: string | null;
  muscleGroup?: string | null;
  equipment?: string | null;
  isSystem: boolean;
};

type ExercisePickerProps = {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
};

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const t = useTranslations("WorkoutBuilder");
  const tCatalog = useTranslations("Exercises.catalog");
  const client = useApolloClient();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done">("idle");

  const search = useCallback(
    async (q: string) => {
      setLoadState("loading");
      try {
        const { data } = await client.query<{
          searchExercises: GqlExercise[];
        }>({
          query: SEARCH_EXERCISES,
          variables: q.trim() ? { input: { query: q.trim() } } : {},
          fetchPolicy: "network-only",
        });
        setResults(
          (data?.searchExercises ?? []).map((e) => ({
            id: e.id,
            name: e.name,
            catalogKey: e.catalogKey ?? null,
            muscleGroup: (e.muscleGroup as Exercise["muscleGroup"]) ?? null,
            equipment: (e.equipment as Exercise["equipment"]) ?? null,
            isSystem: e.isSystem,
          })),
        );
      } catch {
        setResults([]);
      } finally {
        setLoadState("done");
      }
    },
    [client],
  );

  useEffect(() => {
    search("");
  }, [search]);

  useEffect(() => {
    if (query === "") {
      search("");
      return;
    }
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const modal = (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-background border border-border shadow-xl flex flex-col max-h-[80dvh]">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h2 className="text-base font-bold text-foreground">{t("pickerTitle")}</h2>
          <button
            onClick={onClose}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("pickerCancel")}
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("pickerSearch")}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 py-2">
          {loadState === "loading" && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground animate-pulse">
              {t("pickerLoading")}
            </p>
          )}

          {loadState === "done" && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t("pickerNoResults")}
            </p>
          )}

          {results.map((exercise) => {
            const displayName = resolveExerciseDisplayName(
              tCatalog,
              exercise.catalogKey,
              exercise.name,
            );
            return (
              <button
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                  {exercise.muscleGroup && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {exercise.muscleGroup}
                    </p>
                  )}
                </div>
                {!exercise.isSystem && (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    custom
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
