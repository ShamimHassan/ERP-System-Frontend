"use client";

import Link from "next/link";
import {
  ClipboardList, Target, Phone, Trophy,
  TrendingUp, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import { fmtBDT, fmtDate } from "@/lib/formatters";
import StatusBadge from "@/components/shared/StatusBadge";

/**
 * MarketingDashboard — shown to MARKETING role users.
 * Step 10: Placeholder layout with real widget shapes.
 * Step 22: Replace skeletons with live API data (useDashboard hook).
 *
 * Widget sources (all from GET /api/dashboard/summary):
 *   counts.leads, counts.opportunities, upcomingActivities,
 *   revenueYtd, myTarget, myAchievement, conversionRate
 */
export default function MarketingDashboard() {
  // Step 22 will replace these with: const { data, isLoading } = useDashboard();
  const isLoading = false;

  // Placeholder values — wired to real API in Step 22
  const stats = {
    leads: 12,
    opportunities: 5,
    wonDeals: 3,
    followUpsToday: 2,
    revenueYtd: 540000,
    target: 1200000,
    achievementPct: 45,
    conversionRate: 25,
  };

  const upcomingActivities = [
    { id: "1", type: "CALL",     subject: "Follow up with Acme Corp",  scheduledAt: "2026-09-28T10:00:00Z" },
    { id: "2", type: "MEETING",  subject: "Product demo — TechnoVision",scheduledAt: "2026-09-28T14:30:00Z" },
    { id: "3", type: "FOLLOW_UP",subject: "Send proposal to Nexus",    scheduledAt: "2026-09-29T09:00:00Z" },
  ];

  const recentLeads = [
    { id: "1", leadName: "Acme Corp",       status: "NEW",       priority: "HIGH",   estimatedValue: 54000 },
    { id: "2", leadName: "TechnoVision BD", status: "CONTACTED", priority: "MEDIUM", estimatedValue: 102000 },
    { id: "3", leadName: "GreenField Farms",status: "QUALIFIED", priority: "HIGH",   estimatedValue: 162000 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">My Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your personal sales performance overview
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="My Leads"
          value={stats.leads}
          subtitle="total assigned"
          icon={ClipboardList}
          loading={isLoading}
        />
        <KpiCard
          title="My Opportunities"
          value={stats.opportunities}
          subtitle="in pipeline"
          icon={Target}
          loading={isLoading}
        />
        <KpiCard
          title="Won Deals"
          value={stats.wonDeals}
          subtitle={`Revenue: ${fmtBDT(stats.revenueYtd)}`}
          icon={Trophy}
          change={12.5}
          loading={isLoading}
        />
        <KpiCard
          title="Follow-ups Today"
          value={stats.followUpsToday}
          subtitle={
            stats.followUpsToday > 0 ? (
              <Link href="/activities?due=today" className="text-blue-600 hover:underline dark:text-blue-400">
                View activities →
              </Link>
            ) as unknown as string : "none due today"
          }
          icon={Phone}
          loading={isLoading}
        />
      </div>

      {/* ── Target vs Achievement + Conversion Rate ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Target vs Achievement */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
              Target vs Achievement (YTD)
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
                    {stats.achievementPct}%
                  </span>
                  <span className="text-sm text-slate-500">
                    {fmtBDT(stats.revenueYtd)} / {fmtBDT(stats.target)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.achievementPct >= 80
                        ? "bg-emerald-500"
                        : stats.achievementPct >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(stats.achievementPct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Monthly target: {fmtBDT(stats.target)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
              Conversion Rate
              <Activity className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {stats.conversionRate}%
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: "Leads", val: stats.leads, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
                    { label: "Qualified", val: Math.round(stats.leads * 0.4), color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
                    { label: "Won", val: stats.wonDeals, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-2 text-center ${item.color}`}>
                      <p className="text-lg font-bold">{item.val}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wide">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Recharts funnel chart — Step 22
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Leads + Upcoming Activities ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Recent Leads
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/leads" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-50">
                View all →
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 px-6 pb-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                        {lead.leadName}
                      </p>
                      <p className="text-xs text-slate-500">{fmtBDT(lead.estimatedValue)}</p>
                    </div>
                    <div className="ml-3 flex items-center gap-2 shrink-0">
                      <StatusBadge status={lead.priority} />
                      <StatusBadge status={lead.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Upcoming Activities
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/activities" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-50">
                View all →
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 px-6 pb-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 px-6 py-3">
                    <div className="mt-0.5 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium uppercase tracking-wide"
                      >
                        {act.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                        {act.subject}
                      </p>
                      <p className="text-xs text-slate-500">
                        {fmtDate(act.scheduledAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-slate-400">
        Revenue chart (Recharts bar) + full API wiring → Step 22
      </p>
    </div>
  );
}
