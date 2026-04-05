"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LOGIN_MUTATION,
  type LoginInput,
  type LoginResponse,
} from "@/graphql/auth/login.mutation";
import { persistAuthSession } from "@/lib/auth-session";

export function useLogin() {
  const router = useRouter();
  const locale = useLocale();
  const [loginMutation, { loading, error }] = useMutation<
    LoginResponse,
    { input: LoginInput }
  >(LOGIN_MUTATION);

  async function login(input: LoginInput) {
    const { data } = await loginMutation({ variables: { input } });

    if (data?.login.success && data.login.accessToken) {
      persistAuthSession(data.login.accessToken);
      router.push(`/${locale}/workouts`);
    }
  }

  return { login, loading, error };
}
