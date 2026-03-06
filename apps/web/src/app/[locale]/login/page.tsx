import { LoginForm } from "@/components/auth/login-form";
import { BeamsBackground } from "@/components/ui/beams-background";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("Login");

  return (
    <BeamsBackground intensity="medium">
      <main className="w-full px-4 py-8">
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/70 bg-card/85 p-6 shadow-2xl backdrop-blur-md sm:max-w-md sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <LoginForm />
        </div>
      </main>
    </BeamsBackground>
  );
}
