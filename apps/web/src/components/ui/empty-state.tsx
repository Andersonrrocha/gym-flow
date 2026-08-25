import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "default" | "destructive";
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "default",
  className,
}: EmptyStateProps) {
  const isDestructive = tone === "destructive";
  return (
    <div
      role={isDestructive ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border px-6 py-8 text-center",
        isDestructive
          ? "border-destructive/30 bg-destructive-soft"
          : "border-border bg-card",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            isDestructive
              ? "bg-destructive/15 text-destructive"
              : "bg-primary-soft text-primary",
          )}
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "font-display text-base font-semibold",
            isDestructive ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
