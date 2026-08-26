"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { ArrowRight, Dumbbell, Layers3 } from "lucide-react";
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
      <div className="mx-auto flex w-full max-w-[76rem] flex-1 flex-col px-3 py-6 sm:px-5 lg:px-8 lg:py-9">
        <div className="lg:hidden">
          <PageHeader href="/workouts" title={t("createTitle")} className="mb-3" />
        </div>

        <header className="hidden lg:block">
          <p className="text-sm font-medium text-primary">{t("builderEyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {t("createTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("builderDescription")}
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:mt-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:gap-8">
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:p-7">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Dumbbell className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">{t("builderOverviewTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("builderOverviewDescription")}</p>
              </div>
            </div>

            <div className="mt-8">
              <label htmlFor="workout-name" className="mb-2 block text-sm font-medium text-foreground">
                {t("nameLabel")}
              </label>
              <input
                id="workout-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("namePlaceholder")}
                className="h-12 w-full rounded-lg border border-border bg-background px-3.5 text-base font-medium text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
                maxLength={100}
                autoFocus
              />
            </div>

            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
            >
              {loading ? t("creating") : t("createButton")}
              {!loading && <ArrowRight className="size-4" aria-hidden />}
            </button>
          </section>

          <aside className="rounded-xl border border-border bg-muted/20 p-5 lg:p-6">
            <Layers3 className="size-5 text-primary" aria-hidden />
            <p className="mt-6 text-sm font-semibold text-foreground">{t("exerciseSequence")}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("builderDesktopHint")}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
