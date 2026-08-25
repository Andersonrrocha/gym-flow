/**
 * Tiny wrapper around navigator.vibrate so callers do not have to feature-check.
 * Fails silently when the API is unavailable (iOS Safari, browsers without vibrate).
 */
export type HapticPattern = "tap" | "success" | "warning" | "long";

const patterns: Record<HapticPattern, number | number[]> = {
  tap: 12,
  success: [12, 40, 18],
  warning: [30, 40, 30],
  long: 80,
};

export function haptic(pattern: HapticPattern = "tap"): void {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & {
    vibrate?: (p: number | number[]) => boolean;
  };
  if (typeof nav.vibrate !== "function") return;
  try {
    const value = patterns[pattern];
    nav.vibrate(Array.isArray(value) ? [...value] : value);
  } catch {
    // ignore
  }
}
