"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { formatRelativeDateWithYear } from "@/lib/date-format";
import type { ExerciseHistoryData } from "@/lib/workout-metrics";

type ExerciseHistoryModalProps = {
  isOpen: boolean;
  data: ExerciseHistoryData | null;
  locale: string;
  onClose: () => void;
  formatSetLabel: (setNumber: number) => string;
  labels: {
    close: string;
    pr: string;
    empty: string;
  };
};

export function ExerciseHistoryModal({
  isOpen,
  data,
  locale,
  onClose,
  formatSetLabel,
  labels,
}: ExerciseHistoryModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && data && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            className="relative z-101 max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                {data.exerciseName}
              </h2>
              <button
                onClick={onClose}
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {labels.close}
              </button>
            </div>

            {data.pr && (
              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {labels.pr}
                </span>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-mono text-lg font-black tabular-nums text-foreground">
                    {data.pr.weight}kg
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    × {data.pr.reps}
                  </span>
                </div>
              </div>
            )}

            {data.sessions.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {labels.empty}
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {data.sessions.map((entry) => (
                  <div
                    key={`${entry.date}-${entry.sets.length}`}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatSessionDate(entry.date, locale)}
                    </p>
                    <div className="mt-1.5 flex flex-col gap-0.5">
                      {entry.sets.map((set) => (
                        <div
                          key={set.setNumber}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="font-mono tabular-nums text-muted-foreground">
                            {formatSetLabel(set.setNumber)}
                          </span>
                          <span className="ml-auto font-mono tabular-nums text-foreground">
                            {set.weight}kg × {set.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function formatSessionDate(isoDate: string, locale: string): string {
  return formatRelativeDateWithYear(isoDate, locale);
}
