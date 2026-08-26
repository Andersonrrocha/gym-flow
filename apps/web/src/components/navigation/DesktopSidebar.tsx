"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AppLogo } from "@/components/ui/app-logo";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/navigation/navigationConfig";

export function DesktopSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navigation");

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-background">
      <div className="border-border border-b px-5 py-6">
        <AppLogo variant="inline" iconSize={30} />
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {t("desktopHint")}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        {navigationItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive =
            pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-30"
              >
                <Icon size={18} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={18} />
              <span className="font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
