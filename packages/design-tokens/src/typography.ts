export const fontFamily = {
  body: "var(--font-body), Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  display:
    "var(--font-display), 'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, monospace",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
} as const;

export const tracking = {
  tighter: "-0.05em",
  tight: "-0.02em",
  normal: "0",
  wide: "0.02em",
  wider: "0.05em",
} as const;

export type FontFamilyName = keyof typeof fontFamily;
export type FontWeightName = keyof typeof fontWeight;
export type FontSizeName = keyof typeof fontSize;
export type TrackingName = keyof typeof tracking;
