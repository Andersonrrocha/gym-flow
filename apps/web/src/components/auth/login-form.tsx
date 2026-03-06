"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/use-login";
import { createLoginSchema } from "@/lib/validation/auth";
import { z } from "zod";

export function LoginForm() {
  const t = useTranslations("Login");
  const locale = useLocale();
  const { login, loading, error } = useLogin();
  const schema = createLoginSchema({
    emailRequired: t("emailRequired"),
    emailInvalid: t("emailInvalid"),
    passwordRequired: t("passwordRequired"),
  });
  type LoginFormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    await login(values);
  });

  const errorMessage = error?.message?.includes("credentials")
    ? t("invalidCredentials")
    : error
      ? t("genericError")
      : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-muted-foreground"
        >
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
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

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-muted-foreground"
        >
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          {...register("password")}
          disabled={loading || isSubmitting}
          className="h-12 rounded-lg border border-input bg-muted px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        {errors.password?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
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
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/signup`}
          className="font-medium text-primary hover:underline"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </form>
  );
}
