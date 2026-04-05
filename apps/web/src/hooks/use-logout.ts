"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LOGOUT_MUTATION,
  type LogoutResponse,
} from "@/graphql/auth/logout.mutation";
import { clearAuthSession } from "@/lib/auth-session";

export function useLogout() {
  const router = useRouter();
  const locale = useLocale();
  const [logoutMutation, { loading, error }] =
    useMutation<LogoutResponse>(LOGOUT_MUTATION);

  async function logout() {
    try {
      await logoutMutation();
    } catch {
    } finally {
      clearAuthSession();
      router.replace(`/${locale}/login`);
    }
  }

  return { logout, loading, error };
}
