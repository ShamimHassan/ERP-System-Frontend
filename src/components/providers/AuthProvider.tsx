"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/store/auth.store";
import api from "@/lib/api-client";

/**
 * AuthProvider — re-validates the stored access token on every app mount
 * by calling GET /api/auth/me. If the token is expired, it will trigger
 * the 401 refresh flow in the Axios interceptor (Step 6).
 *
 * Renders a full-screen skeleton until the initial auth check completes,
 * preventing a hydration mismatch where the server renders "logged out"
 * state while the client has tokens in localStorage.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setLogin, logout } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      // No token — nothing to validate; render immediately
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }

    // Validate stored token against the backend.
    api
      .get("/auth/me")
      .then((res) => {
        const user = res as unknown as AuthUser;
        const { accessToken: at, refreshToken: rt } = useAuthStore.getState();
        if (at && rt) setLogin(user, at, rt);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setChecked(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  if (!checked) {
    // Avoid hydration mismatch — show neutral skeleton until auth resolved
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-300" />
      </div>
    );
  }

  return <>{children}</>;
}
