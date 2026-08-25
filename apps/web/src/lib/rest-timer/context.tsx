"use client";

import * as React from "react";
import { haptic } from "@/lib/haptic";

const STORAGE_KEY = "gf:rest-timer";
const ENABLED_KEY = "gf:rest-timer:enabled";
const DEFAULT_DURATION_KEY = "gf:rest-timer:default";

type State =
  | { kind: "idle" }
  | { kind: "running"; endsAt: number; durationSec: number }
  | { kind: "paused"; remainingMs: number; durationSec: number };

type Persisted = State;

type RestTimerCtx = {
  state: State;
  remainingMs: number;
  durationSec: number;
  isActive: boolean;
  enabled: boolean;
  defaultDuration: number;
  start: (durationSec?: number) => void;
  cancel: () => void;
  add: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  setEnabled: (enabled: boolean) => void;
  setDefaultDuration: (seconds: number) => void;
};

const Ctx = React.createContext<RestTimerCtx | null>(null);

function readPersisted(): Persisted {
  if (typeof window === "undefined") return { kind: "idle" };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { kind: "idle" };
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed.kind === "running" && parsed.endsAt < Date.now()) {
      return { kind: "idle" };
    }
    return parsed;
  } catch {
    return { kind: "idle" };
  }
}

function writePersisted(state: Persisted) {
  if (typeof window === "undefined") return;
  try {
    if (state.kind === "idle") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore
  }
}

function readEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = window.localStorage.getItem(ENABLED_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

function readDefaultDuration(): number {
  if (typeof window === "undefined") return 90;
  try {
    const v = window.localStorage.getItem(DEFAULT_DURATION_KEY);
    if (!v) return 90;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : 90;
  } catch {
    return 90;
  }
}

export function RestTimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<State>({ kind: "idle" });
  const [enabled, setEnabledState] = React.useState(true);
  const [defaultDuration, setDefaultDurationState] = React.useState(90);
  const [now, setNow] = React.useState<number>(() => Date.now());
  const completedHandledRef = React.useRef(false);

  // Hydrate from storage on mount.
  React.useEffect(() => {
    setState(readPersisted());
    setEnabledState(readEnabled());
    setDefaultDurationState(readDefaultDuration());
  }, []);

  // Persist state.
  React.useEffect(() => {
    writePersisted(state);
  }, [state]);

  // RAF tick while running.
  React.useEffect(() => {
    if (state.kind !== "running") return;
    let frame = 0;
    const tick = () => {
      setNow(Date.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state.kind]);

  const remainingMs =
    state.kind === "running"
      ? Math.max(0, state.endsAt - now)
      : state.kind === "paused"
        ? state.remainingMs
        : 0;
  const durationSec = state.kind !== "idle" ? state.durationSec : 0;

  // Auto-finish on running → 0.
  React.useEffect(() => {
    if (state.kind !== "running") {
      completedHandledRef.current = false;
      return;
    }
    if (remainingMs <= 0 && !completedHandledRef.current) {
      completedHandledRef.current = true;
      haptic("long");
      setState({ kind: "idle" });
    }
  }, [state, remainingMs]);

  const start = React.useCallback(
    (sec?: number) => {
      const seconds = Math.max(5, Math.floor(sec ?? defaultDuration));
      setState({
        kind: "running",
        endsAt: Date.now() + seconds * 1000,
        durationSec: seconds,
      });
    },
    [defaultDuration],
  );

  const cancel = React.useCallback(() => {
    setState({ kind: "idle" });
  }, []);

  const add = React.useCallback(
    (seconds: number) => {
      setState((prev) => {
        if (prev.kind === "running") {
          return {
            ...prev,
            endsAt: prev.endsAt + seconds * 1000,
            durationSec: prev.durationSec + seconds,
          };
        }
        if (prev.kind === "paused") {
          return {
            ...prev,
            remainingMs: prev.remainingMs + seconds * 1000,
            durationSec: prev.durationSec + seconds,
          };
        }
        return prev;
      });
    },
    [],
  );

  const pause = React.useCallback(() => {
    setState((prev) => {
      if (prev.kind !== "running") return prev;
      return {
        kind: "paused",
        remainingMs: Math.max(0, prev.endsAt - Date.now()),
        durationSec: prev.durationSec,
      };
    });
  }, []);

  const resume = React.useCallback(() => {
    setState((prev) => {
      if (prev.kind !== "paused") return prev;
      return {
        kind: "running",
        endsAt: Date.now() + prev.remainingMs,
        durationSec: prev.durationSec,
      };
    });
  }, []);

  const setEnabled = React.useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      window.localStorage.setItem(ENABLED_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    if (!next) {
      setState({ kind: "idle" });
    }
  }, []);

  const setDefaultDuration = React.useCallback((seconds: number) => {
    setDefaultDurationState(seconds);
    try {
      window.localStorage.setItem(DEFAULT_DURATION_KEY, String(seconds));
    } catch {
      // ignore
    }
  }, []);

  const value: RestTimerCtx = React.useMemo(
    () => ({
      state,
      remainingMs,
      durationSec,
      isActive: state.kind !== "idle",
      enabled,
      defaultDuration,
      start,
      cancel,
      add,
      pause,
      resume,
      setEnabled,
      setDefaultDuration,
    }),
    [
      state,
      remainingMs,
      durationSec,
      enabled,
      defaultDuration,
      start,
      cancel,
      add,
      pause,
      resume,
      setEnabled,
      setDefaultDuration,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRestTimer(): RestTimerCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    return {
      state: { kind: "idle" },
      remainingMs: 0,
      durationSec: 0,
      isActive: false,
      enabled: false,
      defaultDuration: 90,
      start: () => {},
      cancel: () => {},
      add: () => {},
      pause: () => {},
      resume: () => {},
      setEnabled: () => {},
      setDefaultDuration: () => {},
    };
  }
  return ctx;
}
