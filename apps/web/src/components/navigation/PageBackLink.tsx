"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type PageBackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

function ChevronLeftIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

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
      <ChevronLeftIcon />
      <span>{displayLabel}</span>
    </Link>
  );
}
