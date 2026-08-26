/**
 * Sombras contidas. No modo escuro elas quase somem — profundidade ali vem
 * de superfície mais clara (cardElevated), não de sombra.
 */
export const shadows = {
  xs: "0 1px 2px 0 rgb(10 13 14 / 0.06)",
  sm: "0 1px 3px 0 rgb(10 13 14 / 0.10), 0 1px 2px -1px rgb(10 13 14 / 0.08)",
  md: "0 4px 6px -1px rgb(10 13 14 / 0.10), 0 2px 4px -2px rgb(10 13 14 / 0.08)",
  lg: "0 10px 15px -3px rgb(10 13 14 / 0.12), 0 4px 6px -4px rgb(10 13 14 / 0.10)",
  xl: "0 20px 25px -5px rgb(10 13 14 / 0.18), 0 8px 10px -6px rgb(10 13 14 / 0.10)",
  glowPrimary: "0 0 24px -6px rgb(240 112 58 / 0.45)",
  glowSuccess: "0 0 22px -6px rgb(82 196 138 / 0.40)",
} as const;

export type ShadowName = keyof typeof shadows;
