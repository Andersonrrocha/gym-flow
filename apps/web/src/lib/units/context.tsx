"use client";

import * as React from "react";

export type WeightUnit = "kg" | "lb";
const STORAGE_KEY = "gf:units:weight";

type UnitsContextValue = {
  unit: WeightUnit;
  setUnit: (next: WeightUnit) => void;
};

const UnitsContext = React.createContext<UnitsContextValue | null>(null);

function readInitial(): WeightUnit {
  if (typeof window === "undefined") return "kg";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "kg" || v === "lb") return v;
  } catch {
    // ignore
  }
  return "kg";
}

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = React.useState<WeightUnit>("kg");
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setUnitState(readInitial());
    setHydrated(true);
  }, []);

  const setUnit = React.useCallback((next: WeightUnit) => {
    setUnitState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(() => ({ unit, setUnit }), [unit, setUnit]);

  // Avoid SSR/CSR mismatch on first paint — render with default `kg` until hydrated.
  // Children that depend on unit (SetRow, ExerciseBlock display) will re-render on hydration.
  void hydrated;

  return (
    <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>
  );
}

export function useUnits(): UnitsContextValue {
  const ctx = React.useContext(UnitsContext);
  if (!ctx) {
    // Safe fallback when used outside provider — return kg.
    return { unit: "kg", setUnit: () => {} };
  }
  return ctx;
}
