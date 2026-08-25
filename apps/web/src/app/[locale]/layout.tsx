import { ApolloWrapper } from "@/lib/apollo-client";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { UnitsProvider } from "@/lib/units/context";
import { PageTransition } from "@/components/page-transition";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ApolloWrapper>
        <UnitsProvider>
          <PageTransition>{children}</PageTransition>
        </UnitsProvider>
      </ApolloWrapper>
    </NextIntlClientProvider>
  );
}
