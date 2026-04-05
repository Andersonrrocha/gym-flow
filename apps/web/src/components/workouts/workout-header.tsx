"use client";

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

function BackChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function subscribeToTimer(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
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
  const elapsed = useSyncExternalStore(
    subscribeToTimer,
    () => Date.now() - start,
    () => getServerElapsed(),
  );

  const timerEl = (
    <p
      className="w-full font-mono text-sm tabular-nums text-muted-foreground sm:text-base"
      aria-live="polite"
      aria-atomic="true"
    >
      {formatElapsed(elapsed)}
    </p>
  );

  return (
    <div className={cn("flex flex-col gap-2 px-0 pt-1 pb-0", className)}>
      <div className="flex items-start justify-between gap-2">
        {backHref ? (
          <div className="flex min-w-0 flex-1 items-start gap-1.5 sm:gap-2">
            <Link
              href={`/${locale}${backHref}`}
              className="shrink-0 rounded-lg p-1.5 text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]"
              aria-label={backAriaLabel ?? "Back"}
            >
              <BackChevronIcon />
            </Link>
            <h1 className="min-w-0 flex-1 text-base font-bold leading-tight tracking-tight text-foreground">
              {workoutName}
            </h1>
          </div>
        ) : (
          <h1 className="min-w-0 flex-1 text-base font-bold leading-tight tracking-tight text-foreground">
            {workoutName}
          </h1>
        )}
        {onPause && (
          <button
            type="button"
            onClick={onPause}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Pause
          </button>
        )}
      </div>
      {timerEl}
    </div>
  );
}
