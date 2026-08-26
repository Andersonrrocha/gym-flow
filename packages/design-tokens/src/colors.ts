/**
 * Direção "Painel" — frio, denso, âmbar.
 *
 * Regra central: um papel, dois valores. O âmbar não é o mesmo hex nos dois
 * modos — #F0703A brilha no escuro e lava sobre branco, então o claro usa
 * uma versão mais profunda do mesmo matiz (~18°). Mesma marca, contraste
 * correto em cada fundo.
 *
 * Um acento só. Se algo precisa de destaque e não é o âmbar, a resposta é
 * hierarquia (peso, tamanho, espaço), não uma segunda cor.
 */

/** Âmbar — o único acento de marca. */
export const brand = {
  50: "#FEF4EF",
  100: "#FDE6DA",
  200: "#FACAB4",
  300: "#F7A886",
  400: "#F38A5C",
  500: "#F0703A", // acento no modo escuro
  600: "#DE5B22",
  700: "#C9511C", // acento no modo claro
  800: "#A03F16",
  900: "#7C3313",
  950: "#431807",
} as const;

/**
 * Secundária de dado. NÃO é acento de UI — existe só para gráficos que
 * precisam de uma segunda série. Dessaturada de propósito, para nunca
 * competir com o âmbar.
 */
export const accentScale = {
  50: "#F1F6F5",
  100: "#DDE9E6",
  200: "#BCD3CE",
  300: "#93B6AF",
  400: "#6B9890",
  500: "#4E7C74",
  600: "#3E6B5C",
  700: "#33564B",
  800: "#2B453D",
  900: "#243A34",
  950: "#12211D",
} as const;

/** Neutros frios, com viés levemente azul-esverdeado. Escolhidos, não herdados. */
export const neutral = {
  50: "#F7F8F8",
  100: "#EDEFEF",
  200: "#DDE1E1",
  300: "#C3C9CA",
  400: "#98A2A8",
  500: "#78838A",
  600: "#566065",
  700: "#3D464A",
  800: "#262E31",
  900: "#12181A",
  950: "#0A0D0E",
} as const;

export const lightTokens = {
  background: neutral[50],
  foreground: "#12181B",
  card: "#FFFFFF",
  cardForeground: "#12181B",
  cardElevated: neutral[100],
  muted: neutral[100],
  mutedForeground: neutral[600],
  border: "#E2E6E6",
  borderStrong: neutral[300],
  input: "#E2E6E6",
  ring: brand[600],
  primary: brand[700],
  primaryForeground: "#FFFFFF",
  primarySoft: "#FBEDE6",
  primarySoftForeground: brand[800],
  accent: accentScale[600],
  accentForeground: "#FFFFFF",
  destructive: "#B4291F",
  destructiveForeground: "#FFFFFF",
  destructiveSoft: "#FBE9E7",
  success: "#1F7A4D",
  successForeground: "#FFFFFF",
  successSoft: "#E4F2EA",
  warning: "#96650C",
  warningForeground: "#FFFFFF",
  warningSoft: "#FAF0DC",
  info: "#1F5FA8",
  infoForeground: "#FFFFFF",
  infoSoft: "#E6EEF8",
  ringOffsetBackground: neutral[50],
} as const;

export const darkTokens = {
  background: neutral[950],
  foreground: "#E4E9EC",
  card: neutral[900],
  cardForeground: "#E4E9EC",
  cardElevated: "#1A2225",
  muted: "#1E2426",
  mutedForeground: neutral[400],
  border: "#1E2426",
  borderStrong: "#2C3437",
  ring: brand[500],
  primary: brand[500],
  primaryForeground: "#FFFFFF",
  primarySoft: "rgba(240, 112, 58, 0.14)",
  primarySoftForeground: brand[300],
  accent: accentScale[300],
  accentForeground: neutral[950],
  destructive: "#F06A5E",
  destructiveForeground: neutral[950],
  destructiveSoft: "rgba(240, 106, 94, 0.13)",
  success: "#52C48A",
  successForeground: neutral[950],
  successSoft: "rgba(82, 196, 138, 0.14)",
  warning: "#D8AC52",
  warningForeground: neutral[950],
  warningSoft: "rgba(216, 172, 82, 0.14)",
  info: "#6BA6E8",
  infoForeground: neutral[950],
  infoSoft: "rgba(107, 166, 232, 0.14)",
  ringOffsetBackground: neutral[950],
} as const;

/**
 * Cor categórica por grupo muscular. Usada só como faixa/indicador —
 * nunca como fundo de área grande, nunca competindo com o âmbar.
 * Saturação contida para conviver com o fundo frio.
 */
export const muscleGroupColors = {
  chest: "#D2564B",
  back: "#3B7BC4",
  shoulders: "#C88A2E",
  biceps: "#8B5FC0",
  triceps: "#C0568F",
  legs: "#3F9A63",
  core: "#2A93A8",
  glutes: "#D0743A",
  cardio: "#2FA083",
} as const;

export type SemanticTokenName = keyof typeof darkTokens;
export type MuscleGroupColorName = keyof typeof muscleGroupColors;
