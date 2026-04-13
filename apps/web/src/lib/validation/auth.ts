import { z } from "zod";

const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /\d/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

type LoginValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
};

type SignupValidationMessages = LoginValidationMessages & {
  passwordRulesError: string;
  confirmPasswordRequired: string;
  passwordMismatch: string;
};

export type PasswordRuleState = {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

export function getPasswordRuleState(password: string): PasswordRuleState {
  return {
    hasUppercase: HAS_UPPERCASE.test(password),
    hasLowercase: HAS_LOWERCASE.test(password),
    hasNumber: HAS_NUMBER.test(password),
    hasSpecial: HAS_SPECIAL.test(password),
  };
}

export function createLoginSchema(messages: LoginValidationMessages) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z.string().min(1, messages.passwordRequired),
  });
}

type ForgotPasswordValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
};

export function createForgotPasswordSchema(messages: ForgotPasswordValidationMessages) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
  });
}

type ResetPasswordValidationMessages = {
  passwordRequired: string;
  passwordRulesError: string;
  confirmPasswordRequired: string;
  passwordMismatch: string;
};

export function createResetPasswordSchema(messages: ResetPasswordValidationMessages) {
  return z
    .object({
      password: z
        .string()
        .min(1, messages.passwordRequired)
        .refine(
          (value) => {
            const state = getPasswordRuleState(value);
            return (
              state.hasUppercase &&
              state.hasLowercase &&
              state.hasNumber &&
              state.hasSpecial
            );
          },
          { message: messages.passwordRulesError },
        ),
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: messages.passwordMismatch,
        });
      }
    });
}

export function createSignupSchema(messages: SignupValidationMessages) {
  return z
    .object({
      email: z
        .string()
        .min(1, messages.emailRequired)
        .email(messages.emailInvalid),
      password: z
        .string()
        .min(1, messages.passwordRequired)
        .refine(
          (value) => {
            const state = getPasswordRuleState(value);
            return (
              state.hasUppercase &&
              state.hasLowercase &&
              state.hasNumber &&
              state.hasSpecial
            );
          },
          { message: messages.passwordRulesError },
        ),
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: messages.passwordMismatch,
        });
      }
    });
}
