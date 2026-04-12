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
    <div className={cn("flex flex-nowrap items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-1 items-start gap-1">
        <Link
          href={`/${locale}${href}`}
          className="mt-0.5 shrink-0 rounded-md p-1 text-primary transition-colors hover:bg-primary/10"
          aria-label={backAriaLabel}
        >
          <ChevronLeft className="size-[18px]" strokeWidth={2.5} aria-hidden />
        </Link>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
