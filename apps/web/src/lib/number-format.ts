function toIntlLocale(locale: string): string {
  return locale === "pt" ? "pt-BR" : "en-US";
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(toIntlLocale(locale)).format(value);
}
