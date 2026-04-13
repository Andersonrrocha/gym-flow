"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useLocale } from "next-intl";
import {
  REQUEST_PASSWORD_RESET_MUTATION,
  type RequestPasswordResetInput,
  type RequestPasswordResetResponse,
} from "@/graphql/auth/request-password-reset.mutation";

function extractErrorMessage(e: unknown): string {
  if (CombinedGraphQLErrors.is(e)) {
    return e.errors[0]?.message ?? e.message;
  }
  if (e instanceof Error) return e.message;
  return "unknown";
}

export function useRequestPasswordReset() {
  const locale = useLocale();
  const [mutate, { loading }] = useMutation<RequestPasswordResetResponse>(REQUEST_PASSWORD_RESET_MUTATION);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function requestReset(input: RequestPasswordResetInput) {
    setErrorMessage(null);
    setSuccess(false);
    try {
      const { data } = await mutate({
        variables: { input: { ...input, locale } },
      });
      if (data?.requestPasswordReset.success) {
        setSuccess(true);
      }
    } catch (e) {
      setErrorMessage(extractErrorMessage(e));
    }
  }

  return { requestReset, loading, errorMessage, success };
}
