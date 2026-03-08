"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/workouts/section-header";
import { exerciseHistoryMock } from "@/mocks/workouts";

export default function ExerciseHistoryPage() {
  const t = useTranslations("ExerciseHistory");
  const router = useRouter();
  const data = exerciseHistoryMock;

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Back + title */}
        <button
          onClick={() => router.back()}
          className="mb-4 text-xs font-medium text-primary hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {data.exercise.name}
        </h1>

        {data.exercise.muscleGroup && (
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {data.exercise.muscleGroup}
            {data.exercise.equipment
              ? ` · ${data.exercise.equipment}`
              : ""}
          </p>
        )}

        {/* PR block */}
        <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {t("pr")}
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-black tabular-nums text-foreground">
              {t("weight", { value: data.pr.weight })}
            </span>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {t("reps", { count: data.pr.reps })}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {data.pr.date}
          </p>
        </div>

        {/* Session list */}
        <div className="mt-6">
          <SectionHeader title={t("sessionTitle")} />

          <div className="mt-3 flex flex-col gap-3">
            {data.sessions.map((session, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {session.date}
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {session.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-10 font-mono text-xs tabular-nums text-muted-foreground">
                        {t("set", { number: set.setNumber })}
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {set.weight} kg
                      </span>
                      <span className="text-muted-foreground">×</span>
                      <span className="font-mono tabular-nums text-foreground">
                        {set.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
