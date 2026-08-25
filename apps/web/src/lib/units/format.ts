import { formatNumber } from "@/lib/number-format";
import { kgToDisplay } from "./convert";
import type { WeightUnit } from "./context";

export function formatWeightFromKg(
  kg: number,
  unit: WeightUnit,
  locale: string,
): string {
  const value = kgToDisplay(kg, unit);
  return `${formatNumber(value, locale)} ${unit}`;
}
