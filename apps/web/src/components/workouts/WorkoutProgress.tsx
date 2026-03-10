"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

type WorkoutProgressProps = {
  completed: number;
  total: number;
  label?: string;
  showBar?: boolean;
  className?: string;
};

export function WorkoutProgress({
  completed,
  total,
  label,
  showBar = true,
  className,
}: WorkoutProgressProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {label && <span>{label}</span>}
        <span className="font-mono tabular-nums">
          {completed} / {total}
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
