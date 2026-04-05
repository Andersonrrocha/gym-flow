"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LOGIN_MUTATION,
  type LoginInput,
  type LoginResponse,
} from "@/graphql/auth/login.mutation";
import { persistAuthSession } from "@/lib/auth-session";

function extractErrorMessage(e: unknown): string {
  if (CombinedGraphQLErrors.is(e)) {
    return (e.errors[0]?.message ?? e.message).toLowerCase();
  }
  if (e instanceof Error) return e.message.toLowerCase();
  return "unknown";
}

export function useLogin() {
  const router = useRouter();
  const locale = useLocale();
  const [loginMutation, { loading }] = useMutation<
    LoginResponse,
    { input: LoginInput }
  >(LOGIN_MUTATION);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function login(input: LoginInput) {
    setErrorMessage(null);
    try {
      const { data } = await loginMutation({ variables: { input } });
      if (data?.login.success && data.login.accessToken) {
        persistAuthSession(data.login.accessToken);
        router.push(`/${locale}/workouts`);
      }
    } catch (e) {
      setErrorMessage(extractErrorMessage(e));
    }
  }

  return { login, loading, errorMessage };
}
