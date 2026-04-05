"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  REGISTER_MUTATION,
  type RegisterInput,
  type RegisterResponse,
} from "@/graphql/auth/register.mutation";
import { persistAuthSession } from "@/lib/auth-session";

function extractErrorMessage(e: unknown): string {
  if (CombinedGraphQLErrors.is(e)) {
    return (e.errors[0]?.message ?? e.message).toLowerCase();
  }
  if (e instanceof Error) return e.message.toLowerCase();
  return "unknown";
}

export function useRegister() {
  const router = useRouter();
  const locale = useLocale();
  const [registerMutation, { loading }] = useMutation<
    RegisterResponse,
    { input: RegisterInput }
  >(REGISTER_MUTATION);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function register(input: RegisterInput) {
    setErrorMessage(null);
    try {
      const { data } = await registerMutation({ variables: { input } });
      if (data?.register.success && data.register.accessToken) {
        persistAuthSession(data.register.accessToken);
        router.push(`/${locale}/workouts`);
      }
    } catch (e) {
      setErrorMessage(extractErrorMessage(e));
    }
  }

  return { register, loading, errorMessage };
}
