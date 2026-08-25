"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
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
    mode: "onBlur",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
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
      <p
        className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-center text-sm text-destructive"
        role="alert"
      >
        {t("invalidOrExpired")}
      </p>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="font-display text-xl font-bold text-foreground">
          {t("successTitle")}
        </p>
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

  const submitting = loading || isSubmitting;

  const rules: Array<{ key: keyof typeof passwordRuleState; label: string }> = [
    { key: "hasUppercase", label: tSignup("passwordRuleUppercase") },
    { key: "hasLowercase", label: tSignup("passwordRuleLowercase") },
    { key: "hasNumber", label: tSignup("passwordRuleNumber") },
    { key: "hasSpecial", label: tSignup("passwordRuleSpecial") },
  ];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <PasswordInput
        id="password"
        autoComplete="new-password"
        label={tSignup("passwordLabel")}
        placeholder={tSignup("passwordPlaceholder")}
        showPasswordLabel={tSignup("showPassword")}
        hidePasswordLabel={tSignup("hidePassword")}
        error={errors.password?.message ?? null}
        disabled={submitting}
        {...register("password")}
      />

      {showPasswordRules && (
        <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {tSignup("passwordLegendTitle")}
          </p>
          <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
            {rules.map(({ key, label }) => {
              const ok = passwordRuleState[key];
              return (
                <li
                  key={key}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    ok ? "text-success" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-full",
                      ok
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground/70",
                    )}
                    aria-hidden
                  >
                    {ok ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      <X className="size-3" strokeWidth={3} />
                    )}
                  </span>
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <PasswordInput
        id="confirmPassword"
        autoComplete="new-password"
        label={tSignup("confirmPasswordLabel")}
        placeholder={tSignup("confirmPasswordPlaceholder")}
        showPasswordLabel={tSignup("showPassword")}
        hidePasswordLabel={tSignup("hidePassword")}
        error={errors.confirmPassword?.message ?? null}
        disabled={submitting}
        {...register("confirmPassword")}
      />

      {graphQLError && (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {graphQLError}
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
    </form>
  );
}
