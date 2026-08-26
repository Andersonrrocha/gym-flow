import type { WeightUnit } from "./context";

const KG_TO_LB = 2.2046226218;

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Canonical storage stays in kg. UI converts on display + on edit.
 */
export function kgToDisplay(kg: number, unit: WeightUnit): number {
  if (unit === "kg") return roundToHalf(kg);
  return roundToHalf(kg * KG_TO_LB);
}

export function displayToKg(value: number, unit: WeightUnit): number {
  if (unit === "kg") return value;
  return Math.round((value / KG_TO_LB) * 1000) / 1000;
}
