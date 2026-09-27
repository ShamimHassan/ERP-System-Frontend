"use client";

import { useAuthStore } from "@/store/auth.store";
import AdminDashboard from "@/components/features/dashboard/AdminDashboard";
import ManagerDashboard from "@/components/features/dashboard/ManagerDashboard";
import MarketingDashboard from "@/components/features/dashboard/MarketingDashboard";

/**
 * Dashboard entry point — role-switches to the correct dashboard component.
 *
 * ADMIN    → AdminDashboard    (org-wide KPIs + manager performance)
 * MANAGER  → ManagerDashboard  (team KPIs + Team Performance Table)
 * MARKETING→ MarketingDashboard(personal KPIs + activities + recent leads)
 *
 * Placeholder data in Step 10 — full API wiring in Step 22.
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null; // AuthGuard handles redirect; this is just a safeguard

  if (user.role === "ADMIN")   return <AdminDashboard />;
  if (user.role === "MANAGER") return <ManagerDashboard />;
  return <MarketingDashboard />;
}
