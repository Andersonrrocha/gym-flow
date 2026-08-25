"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "gf:pwa-install:dismissed-at";
const VISIT_COUNT_KEY = "gf:visit-count";
const DISMISS_COOLDOWN_DAYS = 14;
const MIN_VISITS = 2;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type Platform = "chromium" | "ios-safari" | "installed" | "unsupported";

export function getPlatform(): Platform {
  if (typeof window === "undefined") return "unsupported";

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;
  if (isStandalone) return "installed";

  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  if (isIos && isSafari) return "ios-safari";

  if ("BeforeInstallPromptEvent" in window) return "chromium";
  return "chromium";
}

export function bumpVisitCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(VISIT_COUNT_KEY);
    const next = (raw ? parseInt(raw, 10) : 0) + 1;
    window.localStorage.setItem(VISIT_COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function getVisitCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(VISIT_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function dismissPrompt() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function shouldShowPrompt(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const dismissedAt = window.localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      if (elapsed < cooldownMs) return false;
    }
    return getVisitCount() >= MIN_VISITS;
  } catch {
    return false;
  }
}

type PromptState = {
  platform: Platform;
  installable: boolean;
  prompt: (() => Promise<"accepted" | "dismissed" | "unavailable">) | null;
};

export function useInstallPrompt(): PromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [platform, setPlatform] = useState<Platform>(() =>
    typeof window === "undefined" ? "unsupported" : getPlatform(),
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => {
      setPlatform("installed");
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const prompt = deferred
    ? async () => {
        try {
          await deferred.prompt();
          const { outcome } = await deferred.userChoice;
          setDeferred(null);
          return outcome;
        } catch {
          return "unavailable" as const;
        }
      }
    : null;

  return {
    platform,
    installable:
      platform === "ios-safari" || (platform === "chromium" && !!deferred),
    prompt,
  };
}
