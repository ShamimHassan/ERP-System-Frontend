"use client";

import Link from "next/link";
import {
  ClipboardList, Building2, Target,
  FileText, Package, TrendingUp, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "./KpiCard";
import TeamPerformanceTable from "./TeamPerformanceTable";
import { useDashboardSummary, useTeamPerformance } from "./useDashboard";
import { fmtBDT, fmtPct } from "@/lib/formatters";

/**
 * ManagerDashboard — shown to MANAGER role users.
 * Team-scoped KPIs + their team members' performance table.
 * Live data via useDashboardSummary + useTeamPerformance hooks.
 */
export default function ManagerDashboard() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: teamPerf, isLoading: teamLoading } = useTeamPerformance();

  const isLoading = summaryLoading || teamLoading;

  const counts = summary?.counts;
  const teamRows = teamPerf?.rows ?? [];

  // Achievement progress bar color
  const achievementPct =
    summary?.myTarget && summary.myTarget > 0
      ? Math.round(((summary.myAchievement ?? 0) / summary.myTarget) * 100)
      : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Manager Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Team performance overview
        </p>
      </div>

      {/* ── Team KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Team Leads"
          value={counts?.leads ?? 0}
          subtitle="assigned to your team"
          icon={ClipboardList}
          loading={isLoading}
        />
        <KpiCard
          title="Customers"
          value={counts?.customers ?? 0}
          subtitle="active accounts"
          icon={Building2}
          loading={isLoading}
        />
        <KpiCard
          title="Opportunities"
          value={counts?.opportunities ?? 0}
          subtitle="in pipeline"
          icon={Target}
          loading={isLoading}
        />
        <KpiCard
          title="Quotations"
          value={counts?.quotations ?? 0}
          subtitle={`${counts?.quotationsApproved ?? 0} approved`}
          icon={FileText}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Orders"
          value={counts?.orders ?? 0}
          subtitle={`${counts?.ordersCompleted ?? 0} completed`}
          icon={Package}
          loading={isLoading}
        />
        <KpiCard
          title="Revenue YTD"
          value={isLoading ? "—" : fmtBDT(summary?.revenueYtd ?? 0)}
          subtitle="from completed orders"
          icon={TrendingUp}
          loading={isLoading}
        />
        <KpiCard
          title="Collection YTD"
          value={isLoading ? "—" : fmtBDT(summary?.collectionYtd ?? 0)}
          subtitle="from paid invoices"
          icon={TrendingUp}
          loading={isLoading}
        />
        <KpiCard
          title="Conversion Rate"
          value={isLoading ? "—" : fmtPct(summary?.conversionRate ?? 0)}
          subtitle="leads → won"
          icon={Activity}
          loading={isLoading}
        />
      </div>

      {/* ── Target vs Achievement ── */}
      {(summary?.myTarget ?? 0) > 0 && (
        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
              Team Target vs Achievement (YTD)
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
                    {achievementPct}%
                  </span>
                  <span className="text-sm text-slate-500">
                    {fmtBDT(summary?.myAchievement ?? 0)} / {fmtBDT(summary?.myTarget ?? 0)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all ${
                      achievementPct >= 80
                        ? "bg-emerald-500"
                        : achievementPct >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(achievementPct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Annual target: {fmtBDT(summary?.myTarget ?? 0)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Upcoming Activities ── */}
      {!isLoading && (summary?.upcomingActivities?.length ?? 0) > 0 && (
        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Upcoming Activities
            </CardTitle>
            <Link
              href="/activities"
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary!.upcomingActivities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-center gap-3 px-6 py-3">
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {act.type.replace("_", " ")}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-slate-200">
                    {act.notes ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Team Member Performance Table ── */}
      <TeamPerformanceTable rows={teamRows} isLoading={teamLoading} />
    </div>
  );
}
