"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { useKpis, useSetKpiTarget } from "./useKpis";
import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { fmtBDT, fmtPct, fmtNumber } from "@/lib/formatters";
import { METRICS, PERIOD_TYPES } from "@/types/enums";
import type { KpiRow } from "@/types/api.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const METRIC_LABELS: Record<string, string> = {
  NEW_LEADS:       "New Leads",
  QUALIFIED_LEADS: "Qualified Leads",
  CALLS:           "Calls",
  MEETINGS:        "Meetings",
  SURVEYS:         "Surveys",
  FOLLOW_UPS:      "Follow-ups",
  QUOTATIONS:      "Quotations",
  WON_DEALS:       "Won Deals",
  NEW_CUSTOMERS:   "New Customers",
  REVENUE:         "Revenue",
  COLLECTION:      "Collection",
  CONVERSION_RATE: "Conversion Rate",
};

// Currency metrics display in BDT
const CURRENCY_METRICS = new Set(["REVENUE", "COLLECTION"]);
const PCT_METRICS      = new Set(["CONVERSION_RATE"]);

function formatMetricValue(metric: string, value: number): string {
  if (CURRENCY_METRICS.has(metric)) return fmtBDT(value);
  if (PCT_METRICS.has(metric))      return fmtPct(value);
  return fmtNumber(value);
}

function AchievementBar({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "bg-emerald-500"
    : pct >= 50 ? "bg-amber-500"
    : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`text-xs font-semibold ${
        pct >= 80 ? "text-emerald-700 dark:text-emerald-400"
        : pct >= 50 ? "text-amber-700 dark:text-amber-400"
        : "text-red-600 dark:text-red-400"
      }`}>
        {fmtPct(pct)}
      </span>
    </div>
  );
}

function TargetCell({
  row, canEdit, userId, periodType, periodStart,
}: {
  row: KpiRow; canEdit: boolean; userId: string; periodType: string; periodStart: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(row.targetValue));
  const setTarget = useSetKpiTarget();

  function save() {
    const num = Number(val);
    if (isNaN(num) || num < 0) return;
    setTarget.mutate(
      { userId, periodType, periodStart, metric: row.metric, targetValue: num },
      { onSuccess: () => setEditing(false) }
    );
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number" min={0} step="any"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="h-7 w-28 text-xs"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          disabled={setTarget.isPending}
        />
        <button onClick={save} disabled={setTarget.isPending}
          className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={() => setEditing(false)}
          className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1">
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {formatMetricValue(row.metric, row.targetValue)}
      </span>
      {canEdit && (
        <button
          onClick={() => setEditing(true)}
          className="hidden h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-slate-700 group-hover:flex"
          title="Edit target"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

interface KpiTableProps {
  userId?: string;
  periodType?: string;
  periodStart?: string;
}

export default function KpiTable({ userId, periodType = "MONTHLY", periodStart }: KpiTableProps) {
  const user = useAuthStore((s) => s.user);
  const canEdit = can.setKpiTargets((user?.role as Role) ?? "MARKETING");

  const [selectedPeriodType, setSelectedPeriodType] = useState(periodType);
  const [selectedPeriodStart, setSelectedPeriodStart] = useState(
    periodStart ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );

  const targetUserId = userId ?? user?.id ?? "";

  const { data, isLoading, isError } = useKpis({
    period: selectedPeriodType,
    periodStart: selectedPeriodStart,
    ...(userId && { userId }),
  });

  // Filter rows for this user only
  const rows = (data?.rows ?? []).filter((r) => !targetUserId || r.userId === targetUserId);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedPeriodType} onValueChange={setSelectedPeriodType}>
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_TYPES.map((p) => (
              <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="month"
          value={selectedPeriodStart.slice(0, 7)}
          onChange={(e) => setSelectedPeriodStart(`${e.target.value}-01`)}
          className="h-9 w-36"
        />
        {canEdit && (
          <span className="text-xs text-slate-500">Click target value to edit inline</span>
        )}
      </div>

      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load KPI data.</p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-900/50">
              {["Metric", "Target", "Actual", "Achievement"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && METRICS.map((m) => (
              <tr key={m}>
                <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
              </tr>
            ))}
            {!isLoading && rows.map((row) => (
              <tr key={row.metric} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                  {METRIC_LABELS[row.metric] ?? row.metric}
                </td>
                <td className="px-4 py-3">
                  <TargetCell
                    row={row}
                    canEdit={canEdit}
                    userId={targetUserId}
                    periodType={selectedPeriodType}
                    periodStart={selectedPeriodStart}
                  />
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {formatMetricValue(row.metric, row.actualValue)}
                </td>
                <td className="px-4 py-3">
                  <AchievementBar pct={row.achievementPct} />
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && !isError && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  No KPI data for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
