"use client";

// AuthProvider: re-validates token with GET /api/auth/me on mount.
// Implemented fully in Step 8.

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
