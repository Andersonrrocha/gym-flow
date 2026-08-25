"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

type WorkoutHeaderProps = {
  workoutName: string;
  startedAt: string;
  onPause?: () => void;
  backHref?: string;
  backAriaLabel?: string;
  className?: string;
};

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Module-level snapshot so server and initial client render are identical (both 0),
// avoiding SSR/CSR hydration mismatches. Real time is populated on first tick after mount.
let timerSnapshot = 0;

function subscribeToTimer(cb: () => void) {
  const tick = () => {
    timerSnapshot = Date.now();
    cb();
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

function getTimerSnapshot() {
  return timerSnapshot;
}

function getServerElapsed() {
  return 0;
}

export function WorkoutHeader({
  workoutName,
  startedAt,
  onPause,
  backHref,
  backAriaLabel,
  className,
}: WorkoutHeaderProps) {
  const locale = useLocale();
  const start = new Date(startedAt).getTime();
  const currentTime = useSyncExternalStore(
    subscribeToTimer,
    getTimerSnapshot,
    getServerElapsed,
  );
  const elapsed = currentTime === 0 ? 0 : Math.max(0, currentTime - start);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {backHref ? (
        <Link
          href={`/${locale}${backHref}`}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={backAriaLabel ?? "Back"}
        >
          <ChevronLeft className="size-5" strokeWidth={2.25} aria-hidden />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {workoutName}
        </p>
        <p
          className="font-display text-3xl font-bold tabular-nums leading-none text-foreground sm:text-4xl"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatElapsed(elapsed)}
        </p>
      </div>
      {onPause && (
        <button
          type="button"
          onClick={onPause}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Pause
        </button>
      )}
    </div>
  );
}
