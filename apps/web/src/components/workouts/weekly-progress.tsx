"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { WeeklyProgress as WeeklyProgressType } from "@/types/workouts";

type WeeklyProgressProps = {
  data: WeeklyProgressType;
  className?: string;
};

export function WeeklyProgress({ data, className }: WeeklyProgressProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {data.days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <motion.div
            className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold",
              day.completed
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
          >
            {day.label}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
