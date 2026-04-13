"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  RESET_PASSWORD_MUTATION,
  type ResetPasswordInput,
  type ResetPasswordResponse,
} from "@/graphql/auth/reset-password.mutation";

function extractErrorMessage(e: unknown): string {
  if (CombinedGraphQLErrors.is(e)) {
    return e.errors[0]?.message ?? e.message;
  }
  if (e instanceof Error) return e.message;
  return "unknown";
}

export function useResetPassword() {
  const [mutate, { loading }] = useMutation<ResetPasswordResponse>(RESET_PASSWORD_MUTATION);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function resetPassword(input: ResetPasswordInput) {
    setErrorMessage(null);
    setSuccess(false);
    try {
      const { data } = await mutate({ variables: { input } });
      if (data?.resetPassword.success) {
        setSuccess(true);
      }
    } catch (e) {
      setErrorMessage(extractErrorMessage(e));
    }
  }

  return { resetPassword, loading, errorMessage, success };
}
