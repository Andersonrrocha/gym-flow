"use client";

import { useTranslations } from "next-intl";
import { useLogout } from "@/hooks/use-logout";

export default function WorkoutsPage() {
  const t = useTranslations("Workouts");
  const { logout, loading } = useLogout();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        <button
          onClick={logout}
          disabled={loading}
          className="mt-6 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {t("logout")}
        </button>
      </div>
    </main>
  );
}
