import { LoginForm } from "@/components/auth/login-form";
import { BeamsBackground } from "@/components/ui/beams-background";
import { AppLogo } from "@/components/ui/app-logo";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("Login");

  return (
    <BeamsBackground intensity="medium">
      <main className="w-full px-4 py-8">
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/70 bg-card/85 p-6 shadow-2xl backdrop-blur-md sm:max-w-md sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-3">
            <AppLogo variant="stacked" iconSize={72} textWidth={200} />
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <LoginForm />
        </div>
      </main>
    </BeamsBackground>
  );
}
