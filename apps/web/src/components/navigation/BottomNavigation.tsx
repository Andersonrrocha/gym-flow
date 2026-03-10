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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-2">
        {navigationItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive =
            pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.key}
                className="flex flex-1 flex-col items-center gap-0.5 py-1 opacity-30"
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium">
                  {t(item.labelKey)}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              href={fullHref}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
