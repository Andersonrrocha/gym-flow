import { cn } from "@/lib/utils";

type StatItemProps = {
  value: string;
  label: string;
  className?: string;
};

export function StatItem({ value, label, className }: StatItemProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-mono text-lg font-bold tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
