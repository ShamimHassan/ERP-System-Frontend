import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * AuthUser — canonical user shape stored in the auth slice.
 * Intentionally kept inline here (not imported from api.types) to avoid
 * circular dependencies: api.types imports from auth.store, which would
 * then import back from api.types.
 *
 * This type is also exported so other files (AuthProvider, api-client, etc.)
 * can reference it without going through api.types.
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MARKETING";
  managerId: string | null;
};

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setLogin: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setLogin: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "erp-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
