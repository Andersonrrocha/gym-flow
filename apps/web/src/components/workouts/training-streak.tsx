import { LightningIcon } from "@/components/ui/icons/lightning";
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
        "flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5",
        className,
      )}
    >
      <span className="inline-flex text-primary opacity-90">
        <LightningIcon size={16} />
      </span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-sm font-bold tabular-nums text-foreground">
          {count}
        </span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
