"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestPasswordReset } from "@/hooks/use-request-password-reset";
import { createForgotPasswordSchema } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    mode: "onBlur",
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

  const submitting = loading || isSubmitting;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        type="email"
        autoComplete="email"
        leftIcon={Mail}
        label={tLogin("emailLabel")}
        placeholder={tLogin("emailPlaceholder")}
        error={errors.email?.message ?? null}
        disabled={submitting}
        {...register("email")}
      />

      {errorMessage && (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {t("genericError")}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        loading={submitting}
      >
        {t("submit")}
      </Button>

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
