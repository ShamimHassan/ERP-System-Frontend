"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { usePriceHistory, useProducts } from "./useCatalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtBDT, fmtDate } from "@/lib/formatters";
import type { PriceHistory } from "@/types/api.types";

interface Props { productId: string }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-medium" style={{ color: p.name === "newPrice" ? "#10b981" : "#94a3b8" }}>
          {p.name === "newPrice" ? "New" : "Old"}: {fmtBDT(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function PriceHistoryChart({ productId }: Props) {
  const { data: historyData, isLoading } = usePriceHistory(productId);
  const { data: productsData } = useProducts({ limit: 100 });
  const product = productsData?.data.find((p) => p.id === productId);

  const rows = historyData?.data ?? [];

  // Sort asc for chart
  const chartData = [...rows]
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
    .map((r) => ({
      date:     fmtDate(r.changedAt),
      newPrice: Number(r.newPrice),
      oldPrice: Number(r.oldPrice),
      changedBy: r.changedBy?.name ?? "—",
    }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/catalog/prices" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
          <ChevronLeft className="h-4 w-4" /> Pricing
        </Link>
        {product && <span className="text-slate-400">/</span>}
        {product && <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{product.name}</span>}
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Price History</h1>

      {/* Chart */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Selling Price Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No price history yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => fmtBDT(v)} tick={{ fontSize: 11 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="newPrice" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="New Price" />
                <Line type="monotone" dataKey="oldPrice" stroke="#94a3b8" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" name="Old Price" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* History table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Change Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No history.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                    {["Date", "Old Price", "New Price", "Changed By"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...rows].sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmtDate(row.changedAt)}</td>
                      <td className="px-4 py-3 text-slate-500">{fmtBDT(Number(row.oldPrice))}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">{fmtBDT(Number(row.newPrice))}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.changedBy?.name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
