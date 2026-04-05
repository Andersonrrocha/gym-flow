import type { Exercise } from "@/types/workouts";

export function applyExerciseListFilters(
  list: Exercise[],
  query: string,
  muscleGroup: string | null,
): Exercise[] {
  const q = query.trim().toLowerCase();
  return list.filter((ex) => {
    const matchSearch = !q || ex.name.toLowerCase().includes(q);
    const matchGroup =
      !muscleGroup ||
      (ex.muscleGroup != null &&
        ex.muscleGroup.toLowerCase() === muscleGroup.toLowerCase());
    return matchSearch && matchGroup;
  });
}
