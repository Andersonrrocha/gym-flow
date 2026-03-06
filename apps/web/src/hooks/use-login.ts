"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LOGIN_MUTATION,
  type LoginInput,
  type LoginResponse,
} from "@/graphql/auth/login.mutation";
import { setTokens } from "@/lib/auth-storage";

export function useLogin() {
  const router = useRouter();
  const locale = useLocale();
  const [loginMutation, { loading, error }] = useMutation<
    LoginResponse,
    { input: LoginInput }
  >(LOGIN_MUTATION);

  async function login(input: LoginInput) {
    const { data } = await loginMutation({ variables: { input } });

    if (data?.login) {
      setTokens(data.login.accessToken, data.login.refreshToken);
      router.push(`/${locale}/workouts`);
    }
  }

  return { login, loading, error };
}
