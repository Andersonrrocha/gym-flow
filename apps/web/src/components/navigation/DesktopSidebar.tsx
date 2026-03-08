"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/navigation/navigationConfig";

export function DesktopSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navigation");

  return (
    <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-border lg:bg-background">
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          GymFlow
        </h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navigationItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive =
            pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-30"
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
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
