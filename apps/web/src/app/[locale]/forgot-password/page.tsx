import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { BeamsBackground } from "@/components/ui/beams-background";
import { AppLogo } from "@/components/ui/app-logo";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("ForgotPassword");

  return (
    <BeamsBackground intensity="medium">
      <main className="w-full px-4 py-8">
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/70 bg-card/85 p-6 shadow-2xl backdrop-blur-md sm:max-w-md sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-3">
            <AppLogo variant="stacked" iconSize={72} textWidth={200} />
            <h1 className="text-center text-xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-center text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </main>
    </BeamsBackground>
  );
}
