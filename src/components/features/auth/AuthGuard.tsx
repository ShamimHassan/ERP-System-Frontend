"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

/**
 * AuthGuard — rendered inside (dashboard)/layout.tsx.
 *
 * Checks whether a user is authenticated on the client side.
 * If no user is in the Zustand store (localStorage), redirects to /login.
 *
 * ⚠️  This is UX only — the backend enforces real auth on every API call.
 *     A user with DevTools could bypass this redirect, but hitting any
 *     protected endpoint without a valid token will return 401.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // While user is null (not yet resolved from localStorage hydration),
  // render nothing to avoid a flash of dashboard content.
  if (!user) return null;

  return <>{children}</>;
}
