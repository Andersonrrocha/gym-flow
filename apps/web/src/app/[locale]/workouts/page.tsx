"use client";

import { clearTokens, getAccessToken } from "@/lib/auth-storage";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return getAccessToken();
}

function getServerSnapshot() {
  return null;
}

export default function WorkoutsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Workouts");
  const token = useSyncExternalStore(
    subscribeToStorage,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!token) {
      router.replace(`/${locale}/login`);
    }
  }, [token, locale, router]);

  function handleLogout() {
    clearTokens();
    router.replace(`/${locale}/login`);
  }

  if (!token) return null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {t("logout")}
        </button>
      </div>
    </main>
  );
}
