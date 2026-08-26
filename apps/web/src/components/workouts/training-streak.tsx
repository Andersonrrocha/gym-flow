import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type TrainingStreakProps = {
  count: number;
  label: string;
  className?: string;
};

export function TrainingStreak({
  count,
  label,
  className,
}: TrainingStreakProps) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-warning/40 bg-warning-soft px-3 text-warning",
        className,
      )}
      aria-label={`${count} ${label}`}
      title={`${count} ${label}`}
    >
      <Flame className="size-4" strokeWidth={2.4} aria-hidden />
      <span className="font-display text-sm font-bold tabular-nums">
        {count}
      </span>
      <span className="text-[11px] font-medium text-warning/80 hidden sm:inline">
        {label}
      </span>
    </div>
  );
}
