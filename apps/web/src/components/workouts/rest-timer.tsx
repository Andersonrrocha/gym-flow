"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play, Plus, X } from "lucide-react";
import { useRestTimer } from "@/lib/rest-timer/context";
import { cn } from "@/lib/utils";

const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function RestTimer() {
  const t = useTranslations("RestTimer");
  const reduced = useReducedMotion();
  const { state, remainingMs, durationSec, cancel, add, pause, resume } =
    useRestTimer();

  const visible = state.kind !== "idle";
  const isPaused = state.kind === "paused";

  const totalMs = durationSec * 1000;
  const progress =
    totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.aside
          key="rest-timer"
          aria-live="polite"
          aria-label={t("title")}
          className="pointer-events-auto px-2 pb-2 sm:px-4"
          initial={reduced ? false : { y: 32, opacity: 0 }}
          animate={reduced ? false : { y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: 32, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md">
            {/* Ring */}
            <div className="relative shrink-0">
              <svg
                width={56}
                height={56}
                viewBox="0 0 56 56"
                aria-hidden
                className="-rotate-90"
              >
                <circle
                  cx={28}
                  cy={28}
                  r={RING_RADIUS}
                  className="stroke-muted"
                  strokeWidth={4}
                  fill="none"
                />
                <circle
                  cx={28}
                  cy={28}
                  r={RING_RADIUS}
                  className={cn(
                    "transition-[stroke-dashoffset] duration-100 ease-linear",
                    isPaused ? "stroke-warning" : "stroke-primary",
                  )}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  fill="none"
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-sm font-bold tabular-nums leading-none text-foreground">
                  {formatRemaining(remainingMs)}
                </span>
              </div>
            </div>

            {/* Label */}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("title")}
              </p>
              <p className="font-display text-base font-semibold text-foreground">
                {isPaused ? t("pause") : t("title")}
              </p>
            </div>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => add(30)}
                aria-label={t("add30")}
                title={t("add30")}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="size-3.5" strokeWidth={2.4} aria-hidden />
                30s
              </button>
              <button
                type="button"
                onClick={() => (isPaused ? resume() : pause())}
                aria-label={isPaused ? t("resume") : t("pause")}
                title={isPaused ? t("resume") : t("pause")}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
              >
                {isPaused ? (
                  <Play className="size-4" strokeWidth={2.4} aria-hidden />
                ) : (
                  <Pause className="size-4" strokeWidth={2.4} aria-hidden />
                )}
              </button>
              <button
                type="button"
                onClick={() => cancel()}
                aria-label={t("skip")}
                title={t("skip")}
                className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
              >
                <X className="size-4" strokeWidth={2.4} aria-hidden />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
