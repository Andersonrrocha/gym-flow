"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/navigation/navigationConfig";

export function BottomNavigation() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navigation");

  return (
    <nav
      aria-label={t("workouts")}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/85 pb-(--app-safe-bottom) backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
        {navigationItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive =
            pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.key}
                aria-disabled
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 opacity-30"
              >
                <Icon size={22} strokeWidth={2} />
                <span className="text-[10px] font-medium leading-tight">
                  {t(item.labelKey)}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              href={fullHref}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors focus-visible:outline-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 top-1 h-0.5 rounded-full transition-opacity",
                  isActive ? "bg-primary opacity-100" : "opacity-0",
                )}
              />
              <span
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-primary-soft" : "bg-transparent",
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className="text-[10px] font-medium leading-tight">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
