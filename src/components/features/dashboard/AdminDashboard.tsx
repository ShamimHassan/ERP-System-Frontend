"use client";

import {
  ClipboardList, Building2, Target,
  FileText, Package, TrendingUp, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "./KpiCard";
import TeamPerformanceTable from "./TeamPerformanceTable";
import { fmtBDT, fmtPct } from "@/lib/formatters";

/**
 * AdminDashboard — shown to ADMIN role users.
 * Organization-wide KPIs + manager-wise performance table.
 * Step 22: Replace placeholders with live API (useDashboard hook).
 */
export default function AdminDashboard() {
  const isLoading = false;

  const stats = {
    totalLeads: 52,
    totalCustomers: 18,
    totalOpportunities: 21,
    totalQuotations: 14,
    totalOrders: 8,
    revenueYtd: 2340000,
    conversionRate: 15.4,
    collectionYtd: 1980000,
  };

  // Placeholder manager rows — wired to GET /api/dashboard/team-performance in Step 22
  const managerRows = [
    {
      userId: "m1", userName: "Manager A", userEmail: "manager-a@erp.com",
      leads: 28, opportunities: 12, quotationsApproved: 5, ordersCompleted: 3,
      newCustomers: 8, revenueYtd: 890000, target: 2500000,
      achievementPct: 35.6, conversionRate: 25,
    },
    {
      userId: "m2", userName: "Manager B", userEmail: "manager-b@erp.com",
      leads: 24, opportunities: 9, quotationsApproved: 4, ordersCompleted: 5,
      newCustomers: 10, revenueYtd: 1450000, target: 2500000,
      achievementPct: 58.0, conversionRate: 20.8,
    },
  ];

  // Placeholder service breakdown — Recharts pie in Step 22
  const serviceBreakdown = [
    { service: "Internet",  revenue: 840000, pct: 35.9 },
    { service: "Cloud",     revenue: 620000, pct: 26.5 },
    { service: "Software",  revenue: 540000, pct: 23.1 },
    { service: "Security",  revenue: 340000, pct: 14.5 },
  ];

  const colors = [
    "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Organization-wide performance overview
        </p>
      </div>

      {/* ── Org-wide KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Leads"
          value={stats.totalLeads}
          subtitle="all teams"
          icon={ClipboardList}
          change={5.2}
          loading={isLoading}
        />
        <KpiCard
          title="Total Customers"
          value={stats.totalCustomers}
          subtitle="active accounts"
          icon={Building2}
          change={12.0}
          loading={isLoading}
        />
        <KpiCard
          title="Opportunities"
          value={stats.totalOpportunities}
          subtitle="in pipeline"
          icon={Target}
          loading={isLoading}
        />
        <KpiCard
          title="Quotations"
          value={stats.totalQuotations}
          subtitle={`${stats.totalOrders} converted to orders`}
          icon={FileText}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Orders"
          value={stats.totalOrders}
          subtitle="completed this period"
          icon={Package}
          loading={isLoading}
        />
        <KpiCard
          title="Revenue YTD"
          value={fmtBDT(stats.revenueYtd)}
          subtitle="from completed orders"
          icon={TrendingUp}
          change={18.3}
          loading={isLoading}
        />
        <KpiCard
          title="Collection YTD"
          value={fmtBDT(stats.collectionYtd)}
          subtitle="from paid invoices"
          icon={TrendingUp}
          loading={isLoading}
        />
        <KpiCard
          title="Conversion Rate"
          value={fmtPct(stats.conversionRate)}
          subtitle="leads → won"
          icon={Users}
          loading={isLoading}
        />
      </div>

      {/* ── Service-wise Revenue Breakdown ── */}
      <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Revenue by Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="space-y-3">
              {serviceBreakdown.map((item, i) => (
                <div key={item.service} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm text-slate-600 dark:text-slate-400">
                    {item.service}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full ${colors[i]}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                    {fmtBDT(item.revenue)}
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-slate-500">
                    {fmtPct(item.pct)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Manager-wise Performance Table ── */}
      <TeamPerformanceTable rows={managerRows} isLoading={isLoading} />
    </div>
  );
}
