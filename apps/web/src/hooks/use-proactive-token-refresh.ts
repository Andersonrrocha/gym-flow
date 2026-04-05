"use client";

import { useEffect, useRef } from "react";
import { getStoredAccessToken, clearAuthSession } from "@/lib/auth-session";
import { refreshAccessToken } from "@/lib/refresh-access-token";

function redirectToLogin() {
  const locale = window.location.pathname.split("/")[1] ?? "en";
  window.location.replace(`/${locale}/login`);
}

export function useProactiveTokenRefresh() {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;

    if (getStoredAccessToken()) return;

    void refreshAccessToken().then((ok) => {
      if (!ok) {
        clearAuthSession();
        redirectToLogin();
      }
    });
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (getStoredAccessToken()) return;

      void refreshAccessToken().then((ok) => {
        if (!ok) {
          clearAuthSession();
          redirectToLogin();
        }
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);
}
