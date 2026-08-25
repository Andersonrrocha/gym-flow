import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatItemProps = {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
};

export function StatItem({ value, label, icon, className }: StatItemProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {icon ? (
        <div className="text-muted-foreground" aria-hidden>
          {icon}
        </div>
      ) : null}
      <span className="font-display text-2xl font-bold tabular-nums leading-none text-foreground">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
