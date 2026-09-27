"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtBDT, fmtPct } from "@/lib/formatters";
import { Users } from "lucide-react";

interface MemberRow {
  userId: string;
  userName: string;
  userEmail: string;
  leads: number;
  opportunities: number;
  quotationsApproved: number;
  ordersCompleted: number;
  newCustomers: number;
  revenueYtd: number;
  target: number;
  achievementPct: number;
  conversionRate: number;
}

interface TeamPerformanceTableProps {
  rows: MemberRow[];
  isLoading?: boolean;
}

function AchievementBadge({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
    : pct >= 50 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  const dot =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {fmtPct(pct)}
    </span>
  );
}

export default function TeamPerformanceTable({
  rows,
  isLoading = false,
}: TeamPerformanceTableProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
          <Users className="h-4 w-4" />
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 px-6 pb-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-slate-500">No team members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                  {["Employee", "Leads", "Opps", "Won", "Customers", "Revenue", "Target", "Achievement", "Conversion"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 first:pl-6 last:pr-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row) => (
                  <tr
                    key={row.userId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="pl-6 pr-4 py-3">
                      <div>
                        <Link
                          href={`/leads?marketingPersonId=${row.userId}`}
                          className="font-medium text-slate-900 hover:text-blue-600 hover:underline dark:text-slate-50 dark:hover:text-blue-400"
                        >
                          {row.userName}
                        </Link>
                        <p className="text-xs text-slate-500">{row.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.leads}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.opportunities}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.ordersCompleted}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.newCustomers}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                      {fmtBDT(row.revenueYtd)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {fmtBDT(row.target)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <AchievementBadge pct={row.achievementPct} />
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              row.achievementPct >= 80 ? "bg-emerald-500"
                              : row.achievementPct >= 50 ? "bg-amber-500"
                              : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(row.achievementPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="pr-6 px-4 py-3 text-slate-700 dark:text-slate-300">
                      {fmtPct(row.conversionRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
