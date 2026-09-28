"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { DashboardSummary, TeamPerformance } from "@/types/api.types";

/** GET /api/dashboard/summary — role-scoped automatically by backend */
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get("/dashboard/summary") as unknown as Promise<DashboardSummary>,
    staleTime: 60_000, // 1 min cache — dashboard data changes slowly
  });
}

/** GET /api/dashboard/team-performance
 *  MANAGER → { grouped: false, rows: MemberRow[] }
 *  ADMIN   → { grouped: true,  managerGroups: [...], orphanMembers: [...] }
 */
export function useTeamPerformance() {
  return useQuery<TeamPerformance>({
    queryKey: ["dashboard-team-performance"],
    queryFn: () => api.get("/dashboard/team-performance") as unknown as Promise<TeamPerformance>,
    staleTime: 60_000,
  });
}
