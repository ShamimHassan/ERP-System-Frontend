"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

import { useSalesReport, type SalesGroupBy } from "./useReports";
import { fmtBDT, fmtNumber } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const GROUP_BY_OPTIONS: { value: SalesGroupBy; label: string }[] = [
  { value: "month",    label: "Month" },
  { value: "product",  label: "Product" },
  { value: "service",  label: "Service" },
  { value: "category", label: "Category" },
  { value: "person",   label: "Person" },
  { value: "manager",  label: "Manager" },
  { value: "customer", label: "Customer" },
];

const BAR_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#06b6d4", "#f97316",
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{fmtBDT(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export default function SalesReport() {
  const [groupBy, setGroupBy] = useState<SalesGroupBy>("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading, isError } = useSalesReport({
    groupBy,
    ...(dateFrom && { dateFrom }),
    ...(dateTo   && { dateTo }),
  });

  const rows   = data?.rows ?? [];
  const totals = data?.totals;

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Sales Report</h1>
        <p className="mt-1 text-sm text-slate-500">Revenue analysis from completed sales orders</p>
      </div>

      {/* Controls */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Group by segmented control */}
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-slate-500">Group By</Label>
              <div className="flex flex-wrap gap-1">
                {GROUP_BY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGroupBy(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      groupBy === opt.value
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Date filters */}
            <div className="flex items-end gap-2">
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-slate-500">From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36 text-sm" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-slate-500">To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36 text-sm" />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="h-8 rounded-md px-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load sales report.</p>
      )}

      {/* Summary cards */}
      {!isLoading && totals && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Orders",  value: fmtNumber(totals.ordersTotal) },
            { label: "Total Items",   value: fmtNumber(totals.itemsTotal) },
            { label: "Total Revenue", value: fmtBDT(totals.revenueTotal) },
          ].map(({ label, value }) => (
            <Card key={label} className="border-slate-200 dark:border-slate-800">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {isLoading && <div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-20" />)}</div>}

      {/* Bar Chart */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Revenue by {GROUP_BY_OPTIONS.find((g) => g.value === groupBy)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No data for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rows} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tickFormatter={(v) => fmtBDT(v)} tick={{ fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="grandTotal" radius={[4, 4, 0, 0]}>
                  {rows.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Data table */}
      {!isLoading && rows.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                    {["Group", "Orders", "Items", "Revenue", "Avg Order Value"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{row.label}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{fmtNumber(row.ordersCount)}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{fmtNumber(row.itemsCount)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{fmtBDT(row.grandTotal)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmtBDT(row.avgOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-50">Total</td>
                    <td className="px-4 py-3 font-bold">{fmtNumber(totals?.ordersTotal ?? 0)}</td>
                    <td className="px-4 py-3 font-bold">{fmtNumber(totals?.itemsTotal ?? 0)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-50">{fmtBDT(totals?.revenueTotal ?? 0)}</td>
                    <td className="px-4 py-3 text-slate-400">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
