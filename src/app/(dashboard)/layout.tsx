"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AuthGuard from "@/components/features/auth/AuthGuard";

/**
 * Dashboard layout — wraps all protected routes.
 *
 * Structure:
 *   AuthGuard           → redirects to /login if no user in store
 *     ├── Sidebar       → collapsible nav rail (desktop) + slide Sheet (mobile)
 *     └── main area
 *           ├── TopBar  → user avatar, role badge, logout dropdown
 *           └── <main>  → page content
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Sidebar — hidden on mobile (Sheet handles that), visible on lg+ */}
        <Sidebar />

        {/* Main column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
