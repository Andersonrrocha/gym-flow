export const ease = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const duration = {
  fast: "120ms",
  base: "200ms",
  slow: "320ms",
  ambient: "640ms",
} as const;

export type EaseName = keyof typeof ease;
export type DurationName = keyof typeof duration;
