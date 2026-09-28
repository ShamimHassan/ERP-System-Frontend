"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

import { useMarketingReport } from "./useReports";
import { fmtBDT, fmtNumber, fmtPct } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6", CONTACTED: "#64748b", QUALIFIED: "#10b981",
  PROPOSAL: "#8b5cf6", NEGOTIATION: "#f59e0b", WON: "#059669", LOST: "#ef4444",
};
const ACTIVITY_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#f97316", "#84cc16"];

const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified",
  PROPOSAL: "Proposal", NEGOTIATION: "Negotiation", WON: "Won", LOST: "Lost",
};
const ACTIVITY_LABELS: Record<string, string> = {
  CALL: "Call", MEETING: "Meeting", FOLLOW_UP: "Follow-up",
  SURVEY: "Survey", EMAIL: "Email", DEMO: "Demo", SITE_VISIT: "Site Visit", OTHER: "Other",
};
const STAGE_LABELS: Record<string, string> = {
  QUALIFICATION: "Qualification", REQUIREMENT_ANALYSIS: "Req. Analysis",
  SURVEY: "Survey", PROPOSAL: "Proposal", NEGOTIATION: "Negotiation",
  DECISION: "Decision", WON: "Won", LOST: "Lost",
};

function SmallTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      <p className="text-sm font-bold">{fmtNumber(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export default function MarketingReport() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const { data, isLoading, isError } = useMarketingReport({
    ...(dateFrom && { dateFrom }),
    ...(dateTo   && { dateTo }),
  });

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Marketing Report</h1>
        <p className="mt-1 text-sm text-slate-500">Leads, pipeline, activities and survey analytics</p>
      </div>

      {/* Date filter */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-slate-500">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36 text-sm" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-slate-500">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36 text-sm" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="h-8 rounded-md px-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
                Clear
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {isError && <p className="text-sm text-red-600 dark:text-red-400">Failed to load marketing report.</p>}

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
      ) : data && (
        <Tabs defaultValue="leads">
          <TabsList className="border-b border-slate-200 bg-transparent dark:border-slate-800">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
          </TabsList>

          {/* ── Leads Tab ── */}
          <TabsContent value="leads" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total Leads", value: fmtNumber(data.leads.total) },
                { label: "Won Deals",   value: fmtNumber(data.leads.won) },
                { label: "Conversion",  value: fmtPct(data.conversionRates.leadsToWon) },
              ].map(({ label, value }) => (
                <Card key={label} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* By-status bar */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Leads by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={Object.entries(data.leads.byStatus).map(([k, v]) => ({ status: LEAD_STATUS_LABELS[k] ?? k, count: v }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<SmallTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {Object.keys(data.leads.byStatus).map((k, i) => (
                        <Cell key={k} fill={STATUS_COLORS[k] ?? ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion rates */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Conversion Rates</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Leads → Qualified", pct: data.conversionRates.leadsToQualified },
                  { label: "Leads → Won",        pct: data.conversionRates.leadsToWon },
                  { label: "Qualified → Won",    pct: data.conversionRates.qualifiedToWon },
                ].map(({ label, pct }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{label}</span>
                      <span className="font-semibold">{fmtPct(pct)}</span>
                    </div>
                    <Progress value={Math.min(pct, 100)} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Pipeline Tab ── */}
          <TabsContent value="pipeline" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Total Opportunities</p>
                  <p className="mt-0.5 text-xl font-bold">{fmtNumber(data.opportunities.total)}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Pipeline Value</p>
                  <p className="mt-0.5 text-xl font-bold">{fmtBDT(data.opportunities.pipelineValue)}</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Opportunities by Stage</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    layout="vertical"
                    data={Object.entries(data.opportunities.byStage).map(([k, v]) => ({ stage: STAGE_LABELS[k] ?? k, count: v.count }))}
                    margin={{ left: 90, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip content={<SmallTooltip />} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Funnel Tab ── */}
          <TabsContent value="funnel" className="mt-4">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Conversion Funnel</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.funnel.map((item, i) => {
                  const maxVal = data.funnel[0]?.value || 1;
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={item.stage} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">{item.stage}</span>
                        <span className="font-semibold">{fmtNumber(item.value)}</span>
                      </div>
                      <div className="h-7 w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                        <div
                          className="flex h-full items-center pl-2 text-xs font-medium text-white transition-all"
                          style={{
                            width: `${Math.max(pct, 3)}%`,
                            backgroundColor: ACTIVITY_COLORS[i % ACTIVITY_COLORS.length],
                          }}
                        >
                          {pct > 20 ? fmtPct(pct) : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Activities Tab ── */}
          <TabsContent value="activities" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total Activities", value: fmtNumber(data.activities.total) },
                { label: "Calls",            value: fmtNumber(data.activities.calls) },
                { label: "Meetings",         value: fmtNumber(data.activities.meetings) },
              ].map(({ label, value }) => (
                <Card key={label} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-0.5 text-xl font-bold">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Activities by Type</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data.activities.byType)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => ({ name: ACTIVITY_LABELS[k] ?? k, value: v }))}
                      cx="50%" cy="50%" outerRadius={90}
                      dataKey="value" nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {Object.keys(data.activities.byType).map((_, i) => (
                        <Cell key={i} fill={ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Surveys Tab ── */}
          <TabsContent value="surveys" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Total Surveys</p>
                  <p className="mt-0.5 text-xl font-bold">{fmtNumber(data.surveys.total)}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Completion Rate</p>
                  <p className="mt-0.5 text-xl font-bold text-emerald-700 dark:text-emerald-400">{fmtPct(data.surveys.completionRate)}</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Survey Completion</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completed / Total</span>
                    <span className="font-semibold">{fmtNumber(data.surveys.completed)} / {fmtNumber(data.surveys.total)}</span>
                  </div>
                  <Progress value={Math.min(data.surveys.completionRate, 100)} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {Object.entries(data.surveys.byStatus).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
                      <p className="text-xs text-slate-500">{k.charAt(0) + k.slice(1).toLowerCase()}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
