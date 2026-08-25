"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  href: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  backAriaLabel?: string;
};

export function PageHeader({
  href,
  title,
  subtitle,
  right,
  className,
  backAriaLabel = "Back",
}: PageHeaderProps) {
  const locale = useLocale();

  return (
    <div
      className={cn(
        "flex flex-nowrap items-center justify-between gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link
          href={`/${locale}${href}`}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={backAriaLabel}
        >
          <ChevronLeft className="size-5" strokeWidth={2.4} aria-hidden />
        </Link>

        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
