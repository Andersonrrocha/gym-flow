"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type {
  MonthTrainingCell,
  MonthTrainingGridModel,
} from "@/types/workouts";

const CELL = 12;
const GAP = 3;
const WEEKDAY_FONT_PX = 9;
/** Inline — classes `rounded-[…]` arbitrárias podem não entrar no CSS do Tailwind. */
const CELL_RADIUS: CSSProperties["borderRadius"] = "4px";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(7, ${CELL}px)`,
  gap: `${GAP}px`,
};

function dayCellStyle(cell: MonthTrainingCell): CSSProperties {
  const base: CSSProperties = {
    width: CELL,
    height: CELL,
    borderRadius: CELL_RADIUS,
    display: "block",
  };

  if (!cell.inCurrentMonth) {
    return base;
  }

  const trained = cell.intensity !== "none";
  const multi = cell.intensity === "multi";

  const shadows: string[] = [];
  if (cell.isToday) {
    shadows.push(
      "0 0 0 1px var(--ring-offset-background), 0 0 0 2px var(--primary)",
    );
  }
  if (multi) {
    shadows.push("inset 0 0 0 1px rgba(255,255,255,0.22)");
  }

  return {
    ...base,
    backgroundColor: trained ? "var(--primary)" : "var(--muted)",
    boxShadow: shadows.length > 0 ? shadows.join(", ") : undefined,
  };
}

function DayCell({ cell }: { cell: MonthTrainingCell }) {
  return <span style={dayCellStyle(cell)} aria-hidden />;
}

type MonthTrainingGridProps = {
  model: MonthTrainingGridModel;
  label: string;
  ariaLabel: string;
  className?: string;
};

export function MonthTrainingGrid({
  model,
  label,
  ariaLabel,
  className,
}: MonthTrainingGridProps) {
  const { cells, weekdayLabels } = model;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("select-none", className)}
    >
      <p className="mb-1.5 text-xs font-semibold capitalize text-muted-foreground">
        {label}
      </p>

      <div style={gridStyle}>
        {weekdayLabels.map((l, i) => (
          <span
            key={i}
            style={{
              width: CELL,
              height: 8,
              fontSize: WEEKDAY_FONT_PX,
              lineHeight: 1,
              WebkitTextSizeAdjust: "none",
              textSizeAdjust: "none",
            }}
            className="flex items-center justify-center font-normal uppercase text-muted-foreground/30"
            aria-hidden
          >
            {l}
          </span>
        ))}

        {cells.map((cell, i) => (
          <DayCell key={i} cell={cell} />
        ))}
      </div>
    </div>
  );
}
