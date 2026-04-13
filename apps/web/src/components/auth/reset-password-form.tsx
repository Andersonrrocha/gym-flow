"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/hooks/use-reset-password";
import {
  createResetPasswordSchema,
  getPasswordRuleState,
} from "@/lib/validation/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { z } from "zod";

export function ResetPasswordForm() {
  const t = useTranslations("ResetPassword");
  const tSignup = useTranslations("Signup");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const { resetPassword, loading, errorMessage, success } = useResetPassword();

  const schema = createResetPasswordSchema({
    passwordRequired: tSignup("passwordRequired"),
    passwordRulesError: tSignup("passwordRulesError"),
    confirmPasswordRequired: tSignup("confirmPasswordRequired"),
    passwordMismatch: tSignup("passwordMismatch"),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({ control, name: "password", defaultValue: "" });
  const passwordRuleState = getPasswordRuleState(passwordValue);
  const showPasswordRules = passwordValue.length > 0;

  const onSubmit = handleSubmit(async (values) => {
    if (loading || !token) return;
    await resetPassword({ token, password: values.password });
  });

  const graphQLError =
    errorMessage?.toLowerCase().includes("invalid or expired") ||
    errorMessage?.toLowerCase().includes("unauthorized")
      ? t("invalidOrExpired")
      : errorMessage?.toLowerCase().includes("complexity") ||
          errorMessage?.toLowerCase().includes("rules")
        ? tSignup("passwordRulesError")
        : errorMessage
          ? t("genericError")
          : null;

  if (!token) {
    return (
      <p className="text-center text-sm text-destructive" role="alert">
        {t("invalidOrExpired")}
      </p>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-base font-semibold text-foreground">{t("successTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("successMessage")}</p>
        <Link
          href={`/${locale}/login`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("signInLink")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-muted-foreground"
        >
          {tSignup("passwordLabel")}
        </label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder={tSignup("passwordPlaceholder")}
          showPasswordLabel={tSignup("showPassword")}
          hidePasswordLabel={tSignup("hidePassword")}
          {...register("password")}
          disabled={loading || isSubmitting}
        />
        {errors.password?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
        {showPasswordRules && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">
              {tSignup("passwordLegendTitle")}
            </p>
            <ul className="space-y-1">
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasUppercase
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {tSignup("passwordRuleUppercase")}
              </li>
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasLowercase
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {tSignup("passwordRuleLowercase")}
              </li>
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasNumber
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {tSignup("passwordRuleNumber")}
              </li>
              <li
                className={cn(
                  "transition-colors",
                  passwordRuleState.hasSpecial
                    ? "text-emerald-400"
                    : "text-destructive",
                )}
              >
                {tSignup("passwordRuleSpecial")}
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
          {tSignup("confirmPasswordLabel")}
        </label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder={tSignup("confirmPasswordPlaceholder")}
          showPasswordLabel={tSignup("showPassword")}
          hidePasswordLabel={tSignup("hidePassword")}
          {...register("confirmPassword")}
          disabled={loading || isSubmitting}
        />
        {errors.confirmPassword?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {graphQLError && (
        <p className="text-sm text-destructive" role="alert">
          {graphQLError}
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
    </form>
  );
}
