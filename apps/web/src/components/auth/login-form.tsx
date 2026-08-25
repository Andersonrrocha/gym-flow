"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/use-login";
import { createLoginSchema } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toastError } from "@/lib/toast";
import { z } from "zod";

export function LoginForm() {
  const t = useTranslations("Login");
  const locale = useLocale();
  const { login, loading, errorMessage } = useLogin();
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
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    await login(values);
  });

  const loginError = errorMessage?.includes("account not found")
    ? t("accountNotFound")
    : errorMessage?.includes("incorrect password")
      ? t("incorrectPassword")
      : errorMessage?.includes("credentials")
        ? t("invalidCredentials")
        : errorMessage
          ? t("genericError")
          : null;

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (loginError && loginError !== lastErrorRef.current) {
      toastError(loginError);
      lastErrorRef.current = loginError;
    }
    if (!loginError) {
      lastErrorRef.current = null;
    }
  }, [loginError]);

  const submitting = loading || isSubmitting;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        type="email"
        autoComplete="email"
        leftIcon={Mail}
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
        error={errors.email?.message ?? null}
        disabled={submitting}
        {...register("email")}
      />

      <div className="flex flex-col gap-1">
        <PasswordInput
          id="password"
          autoComplete="current-password"
          label={t("passwordLabel")}
          placeholder={t("passwordPlaceholder")}
          showPasswordLabel={t("showPassword")}
          hidePasswordLabel={t("hidePassword")}
          error={errors.password?.message ?? null}
          disabled={submitting}
          {...register("password")}
        />
        <div className="flex justify-end">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {t("forgotPasswordLink")}
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        loading={submitting}
      >
        {t("submit")}
      </Button>

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
