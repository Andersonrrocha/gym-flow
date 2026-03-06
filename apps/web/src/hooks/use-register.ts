"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  REGISTER_MUTATION,
  type RegisterInput,
  type RegisterResponse,
} from "@/graphql/auth/register.mutation";
import { setTokens } from "@/lib/auth-storage";

export function useRegister() {
  const router = useRouter();
  const locale = useLocale();
  const [registerMutation, { loading, error }] = useMutation<
    RegisterResponse,
    { input: RegisterInput }
  >(REGISTER_MUTATION);

  async function register(input: RegisterInput) {
    const { data } = await registerMutation({ variables: { input } });

    if (data?.register) {
      setTokens(data.register.accessToken, data.register.refreshToken);
      router.push(`/${locale}/workouts`);
    }
  }

  return { register, loading, error };
}
