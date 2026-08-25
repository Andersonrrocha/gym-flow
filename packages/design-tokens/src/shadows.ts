export const shadows = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.06)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.10)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.18), 0 8px 10px -6px rgb(0 0 0 / 0.10)",
  glowPrimary: "0 0 28px -4px rgb(124 58 237 / 0.55)",
  glowAccent: "0 0 28px -4px rgb(163 230 53 / 0.45)",
  glowSuccess: "0 0 24px -4px rgb(34 197 94 / 0.45)",
} as const;

export type ShadowName = keyof typeof shadows;
