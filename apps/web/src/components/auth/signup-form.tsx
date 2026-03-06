"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/use-register";
import {
  createSignupSchema,
  getPasswordRuleState,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";
import { z } from "zod";

export function SignupForm() {
  const t = useTranslations("Signup");
  const locale = useLocale();
  const { register: registerUser, loading, error } = useRegister();
  const schema = createSignupSchema({
    emailRequired: t("emailRequired"),
    emailInvalid: t("emailInvalid"),
    passwordRequired: t("passwordRequired"),
    passwordRulesError: t("passwordRulesError"),
    confirmPasswordRequired: t("confirmPasswordRequired"),
    passwordMismatch: t("passwordMismatch"),
  });
  type SignupFormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const passwordRuleState = getPasswordRuleState(passwordValue);
  const showPasswordRules = passwordValue.length > 0;

  const onSubmit = handleSubmit(async (values) => {
    if (loading) return;
    await registerUser({ email: values.email, password: values.password });
  });

  const errorMessage = error ? t("genericError") : null;

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
          autoComplete="new-password"
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
        {showPasswordRules && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">{t("passwordLegendTitle")}</p>
            <ul className="space-y-1">
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasUppercase
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {t("passwordRuleUppercase")}
              </li>
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasLowercase
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {t("passwordRuleLowercase")}
              </li>
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasNumber
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {t("passwordRuleNumber")}
              </li>
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasSpecial
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {t("passwordRuleSpecial")}
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-muted-foreground"
        >
          {t("confirmPasswordLabel")}
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          {...register("confirmPassword")}
          disabled={loading || isSubmitting}
          className="h-12 rounded-lg border border-input bg-muted px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        {errors.confirmPassword?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.confirmPassword.message}
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
        {t("hasAccount")}{" "}
        <Link
          href={`/${locale}/login`}
          className="font-medium text-primary hover:underline"
        >
          {t("signInLink")}
        </Link>
      </p>
    </form>
  );
}
