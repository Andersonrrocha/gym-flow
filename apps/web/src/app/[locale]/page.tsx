import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  const token = (await cookies()).get("gymflow_access_token")?.value;

  if (token) {
    redirect(`/${locale}/workouts`);
  }

  redirect(`/${locale}/login`);
}
