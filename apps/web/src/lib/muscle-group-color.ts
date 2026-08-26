import type { MuscleGroup } from "@/types/workouts";

const tailwindClassByGroup: Record<MuscleGroup, string> = {
  chest: "bg-muscle-chest",
  back: "bg-muscle-back",
  shoulders: "bg-muscle-shoulders",
  biceps: "bg-muscle-biceps",
  triceps: "bg-muscle-triceps",
  legs: "bg-muscle-legs",
  core: "bg-muscle-core",
  glutes: "bg-muscle-glutes",
  cardio: "bg-muscle-cardio",
};

export function muscleGroupBgClass(
  group: MuscleGroup | null | undefined,
): string {
  if (!group) return "bg-muted";
  return tailwindClassByGroup[group] ?? "bg-muted";
}

export function muscleGroupCssVar(
  group: MuscleGroup | null | undefined,
): string {
  if (!group) return "var(--muted)";
  return `var(--muscle-${group})`;
}

export function dominantMuscleGroup(
  groups: Array<MuscleGroup | null | undefined>,
): MuscleGroup | null {
  const counts = new Map<MuscleGroup, number>();
  for (const g of groups) {
    if (!g) continue;
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  let top: MuscleGroup | null = null;
  let max = 0;
  for (const [g, n] of counts) {
    if (n > max) {
      max = n;
      top = g;
    }
  }
  return top;
}
