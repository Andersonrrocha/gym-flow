"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type PageBackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export function PageBackLink({ href, label, className }: PageBackLinkProps) {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const displayLabel = label ?? t("back");

  return (
    <Link
      href={`/${locale}${href}`}
      className={`inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors ${className ?? ""}`}
      aria-label={displayLabel}
    >
      <ChevronLeft className="size-4" strokeWidth={2.5} aria-hidden />
      <span>{displayLabel}</span>
    </Link>
  );
}
