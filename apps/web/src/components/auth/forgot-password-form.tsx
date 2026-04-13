"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestPasswordReset } from "@/hooks/use-request-password-reset";
import { createForgotPasswordSchema } from "@/lib/validation/auth";
import { z } from "zod";

export function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword");
  const tLogin = useTranslations("Login");
  const locale = useLocale();
  const { requestReset, loading, errorMessage, success } =
    useRequestPasswordReset();

  const schema = createForgotPasswordSchema({
    emailRequired: tLogin("emailRequired"),
    emailInvalid: tLogin("emailInvalid"),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    await requestReset({ email: values.email });
  });

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-foreground">{t("successMessage")}</p>
        <Link
          href={`/${locale}/login`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-muted-foreground"
        >
          {tLogin("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={tLogin("emailPlaceholder")}
          {...register("email")}
          disabled={loading || isSubmitting}
          className="h-12 rounded-lg border border-input bg-muted px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        {errors.email?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {t("genericError")}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || isSubmitting}
        className="mt-2 flex h-12 items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          t("submit")
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={`/${locale}/login`}
          className="font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
