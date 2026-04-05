export function resolveExerciseDisplayName(
  tCatalog: (key: string) => string,
  catalogKey: string | null | undefined,
  fallbackName: string,
): string {
  if (catalogKey == null || catalogKey === "") return fallbackName;
  const label = tCatalog(catalogKey);
  if (label === catalogKey) return fallbackName;
  return label;
}
