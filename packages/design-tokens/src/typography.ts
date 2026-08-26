/**
 * Duas famílias, disciplina de três papéis.
 *
 * Archivo carrega interface e títulos — o eixo de largura (wdth) diferencia
 * heading de corpo sem custar uma terceira família. JetBrains Mono aparece
 * SÓ em dado: peso, carga, repetição, tempo, data, porcentagem.
 * Mono em texto corrido transforma instrumento em terminal.
 */

export const fontFamily = {
  body: "var(--font-body), Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif",
  display:
    "var(--font-body), Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif",
  mono: "var(--font-mono), 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

/** Eixo de largura do Archivo. Títulos levemente expandidos, corpo normal. */
export const fontStretch = {
  normal: "100%",
  heading: "108%",
  display: "112%",
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
  tighter: "-0.035em",
  tight: "-0.02em",
  normal: "0",
  wide: "0.02em",
  wider: "0.12em",
} as const;

export type FontFamilyName = keyof typeof fontFamily;
export type FontStretchName = keyof typeof fontStretch;
export type FontWeightName = keyof typeof fontWeight;
export type FontSizeName = keyof typeof fontSize;
export type TrackingName = keyof typeof tracking;
