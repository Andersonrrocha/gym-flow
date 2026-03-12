const DAY_IN_MS = 1000 * 60 * 60 * 24;

function toIntlLocale(locale: string): string {
  return locale === "pt" ? "pt-BR" : "en-US";
}

export function formatDate(
  isoDate: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(isoDate).toLocaleDateString(toIntlLocale(locale), options);
}

export function formatRelativeDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / DAY_IN_MS);

  if (diffDays === 0) return locale === "pt" ? "Hoje" : "Today";
  if (diffDays === 1) return locale === "pt" ? "Ontem" : "Yesterday";

  return formatDate(isoDate, locale, {
    day: "numeric",
    month: "short",
  });
}

export function formatRelativeDateWithYear(
  isoDate: string,
  locale: string,
): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / DAY_IN_MS);

  if (diffDays === 0) return locale === "pt" ? "Hoje" : "Today";
  if (diffDays === 1) return locale === "pt" ? "Ontem" : "Yesterday";

  return formatDate(isoDate, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
