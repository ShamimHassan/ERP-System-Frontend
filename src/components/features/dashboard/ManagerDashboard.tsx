"use client";

import Link from "next/link";
import {
  ClipboardList, Target, Trophy, Users,
  TrendingUp, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import KpiCard from "./KpiCard";
import TeamPerformanceTable from "./TeamPerformanceTable";
import { fmtBDT, fmtPct } from "@/lib/formatters";

/**
 * ManagerDashboard — shown to MANAGER role users.
 * Shows own + team aggregate KPIs + mandatory Team Performance Table.
 * Step 22: Replace placeholders with live API data (useDashboard hook).
 */
export default function ManagerDashboard() {
  const isLoading = false;

  const stats = {
    teamLeads: 28,
    teamOpportunities: 12,
    teamWon: 7,
    teamRevenue: 890000,
    teamTarget: 2500000,
    teamAchievementPct: 35.6,
    teamConversionRate: 25,
  };

  // Placeholder team rows — wired to GET /api/dashboard/team-performance in Step 22
  const teamRows = [
    {
      userId: "1", userName: "Marketing A1", userEmail: "mkt-a1@erp.com",
      leads: 13, opportunities: 6, quotationsApproved: 2, ordersCompleted: 1,
      newCustomers: 3, revenueYtd: 540000, target: 1200000, achievementPct: 45, conversionRate: 23,
    },
    {
      userId: "2", userName: "Marketing A2", userEmail: "mkt-a2@erp.com",
      leads: 15, opportunities: 6, quotationsApproved: 3, ordersCompleted: 2,
      newCustomers: 4, revenueYtd: 350000, target: 1300000, achievementPct: 26.9, conversionRate: 20,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Team Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your team&apos;s performance overview
        </p>
      </div>

      {/* ── Team KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Team Leads"
          value={stats.teamLeads}
          subtitle="total assigned"
          icon={ClipboardList}
          loading={isLoading}
        />
        <KpiCard
          title="Opportunities"
          value={stats.teamOpportunities}
          subtitle="in pipeline"
          icon={Target}
          loading={isLoading}
        />
        <KpiCard
          title="Won Deals"
          value={stats.teamWon}
          subtitle={`Revenue: ${fmtBDT(stats.teamRevenue)}`}
          icon={Trophy}
          change={8.2}
          loading={isLoading}
        />
        <KpiCard
          title="Team Members"
          value={teamRows.length}
          subtitle="active marketing staff"
          icon={Users}
          loading={isLoading}
        />
      </div>

      {/* ── Team Target vs Achievement ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
              Team Revenue Achievement (YTD)
              <TrendingUp className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {fmtPct(stats.teamAchievementPct)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {fmtBDT(stats.teamRevenue)} / {fmtBDT(stats.teamTarget)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      stats.teamAchievementPct >= 80 ? "bg-emerald-500"
                        : stats.teamAchievementPct >= 50 ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(stats.teamAchievementPct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Monthly target: {fmtBDT(stats.teamTarget)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
              Team Conversion Rate
              <BarChart3 className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {fmtPct(stats.teamConversionRate)}
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: "Leads", val: stats.teamLeads, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
                    { label: "Qualified", val: Math.round(stats.teamLeads * 0.43), color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
                    { label: "Won", val: stats.teamWon, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-2 text-center ${item.color}`}>
                      <p className="text-lg font-bold">{item.val}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wide">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Stacked bar chart — Step 22</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Mandatory Team Performance Table ── */}
      <TeamPerformanceTable rows={teamRows} isLoading={isLoading} />

      <p className="text-center text-xs text-slate-400">
        Team revenue trend (Recharts stacked bar) + live API wiring → Step 22
      </p>
    </div>
  );
}
