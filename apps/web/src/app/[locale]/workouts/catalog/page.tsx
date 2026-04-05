import { redirect } from "next/navigation";

type CatalogRedirectProps = {
  params: Promise<{ locale: string }>;
};

export default async function CatalogRedirect({ params }: CatalogRedirectProps) {
  const { locale } = await params;
  redirect(`/${locale}/exercises`);
}
