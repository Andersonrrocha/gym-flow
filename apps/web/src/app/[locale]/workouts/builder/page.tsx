"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { createWorkoutApi } from "@/lib/api/workout-api";
import { PageHeader } from "@/components/navigation/PageHeader";

export default function BuilderCreatePage() {
  const t = useTranslations("WorkoutBuilder");
  const locale = useLocale();
  const router = useRouter();
  const client = useApolloClient();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const workout = await createWorkoutApi(client, trimmed);
      if (!workout) {
        setError(t("createError"));
        return;
      }
      router.push(`/${locale}/workouts/builder/${workout.id}`);
    } catch {
      setError(t("createError"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreate();
  };

  return (
    <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-6 sm:px-4 lg:max-w-3xl">
        <PageHeader href="/workouts" title={t("createTitle")} className="mb-3" />

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="workout-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              {t("nameLabel")}
            </label>
            <input
              id="workout-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("namePlaceholder")}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              maxLength={100}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading ? t("creating") : t("createButton")}
          </button>
        </div>
      </div>
    </main>
  );
}
