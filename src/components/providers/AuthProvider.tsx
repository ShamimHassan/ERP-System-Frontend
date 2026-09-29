"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/store/auth.store";
import api from "@/lib/api-client";

/**
 * AuthProvider — validates the stored access token on mount.
 *
 * Performance optimization: we only call GET /auth/me once per browser session
 * (tracked via sessionStorage). If the token was already validated in this
 * browser session, we skip the network round-trip and render immediately.
 *
 * This eliminates the ~500ms–1s latency on every navigation/refresh caused
 * by waiting for the Vercel serverless backend to respond.
 */
const SESSION_KEY = "erp-auth-checked";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setLogin, logout } = useAuthStore();
  const [checked, setChecked] = useState(false);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (!accessToken) {
      // No token — show content immediately (AuthGuard will redirect to /login)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }

    // If we already validated this token in this browser session, skip /me call
    const alreadyChecked = typeof window !== "undefined" &&
      sessionStorage.getItem(SESSION_KEY) === "true";

    if (alreadyChecked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }

    // First time in this session — validate against backend
    api
      .get("/auth/me")
      .then((res) => {
        const user = res as unknown as AuthUser;
        const { accessToken: at, refreshToken: rt } = useAuthStore.getState();
        if (at && rt) {
          setLogin(user, at, rt);
          // Mark as validated for this browser session
          if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_KEY, "true");
          }
        }
      })
      .catch(() => {
        // Token invalid — logout and redirect
        logout();
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(SESSION_KEY);
        }
      })
      .finally(() => setChecked(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-300" />
      </div>
    );
  }

  return <>{children}</>;
}
