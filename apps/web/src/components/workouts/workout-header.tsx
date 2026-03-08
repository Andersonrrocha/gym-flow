"use client";

import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

type WorkoutHeaderProps = {
  workoutName: string;
  startedAt: string;
  onPause?: () => void;
  className?: string;
};

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
  className,
}: WorkoutHeaderProps) {
  const start = new Date(startedAt).getTime();
  const elapsed = useSyncExternalStore(
    subscribeToTimer,
    () => Date.now() - start,
    () => getServerElapsed(),
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3",
        className,
      )}
    >
      <div>
        <h1 className="text-base font-bold tracking-tight text-foreground">
          {workoutName}
        </h1>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatElapsed(elapsed)}
        </span>
      </div>
      {onPause && (
        <button
          onClick={onPause}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Pause
        </button>
      )}
    </div>
  );
}
