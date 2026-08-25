"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, Mail, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/use-register";
import {
  createSignupSchema,
  getPasswordRuleState,
} from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { z } from "zod";

export function SignupForm() {
  const t = useTranslations("Signup");
  const locale = useLocale();
  const { register: registerUser, loading, errorMessage } = useRegister();
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
    mode: "onBlur",
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

  const signupError = errorMessage?.includes("already in use")
    ? t("emailAlreadyInUse")
    : errorMessage
      ? t("genericError")
      : null;

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (signupError && signupError !== lastErrorRef.current) {
      toastError(signupError);
      lastErrorRef.current = signupError;
    }
    if (!signupError) {
      lastErrorRef.current = null;
    }
  }, [signupError]);

  const submitting = loading || isSubmitting;

  const rules: Array<{ key: keyof typeof passwordRuleState; label: string }> = [
    { key: "hasUppercase", label: t("passwordRuleUppercase") },
    { key: "hasLowercase", label: t("passwordRuleLowercase") },
    { key: "hasNumber", label: t("passwordRuleNumber") },
    { key: "hasSpecial", label: t("passwordRuleSpecial") },
  ];

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

      <PasswordInput
        id="password"
        autoComplete="new-password"
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        showPasswordLabel={t("showPassword")}
        hidePasswordLabel={t("hidePassword")}
        error={errors.password?.message ?? null}
        disabled={submitting}
        {...register("password")}
      />

      {showPasswordRules && (
        <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("passwordLegendTitle")}
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
        label={t("confirmPasswordLabel")}
        placeholder={t("confirmPasswordPlaceholder")}
        showPasswordLabel={t("showPassword")}
        hidePasswordLabel={t("hidePassword")}
        error={errors.confirmPassword?.message ?? null}
        disabled={submitting}
        {...register("confirmPassword")}
      />

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        loading={submitting}
      >
        {t("submit")}
      </Button>

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
