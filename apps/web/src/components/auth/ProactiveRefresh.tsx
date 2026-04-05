"use client";

import { useProactiveTokenRefresh } from "@/hooks/use-proactive-token-refresh";

export function ProactiveRefresh() {
  useProactiveTokenRefresh();
  return null;
}
