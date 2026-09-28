"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useAuditLogs } from "./useAuditLogs";
import { useQueryParams } from "@/hooks/useQueryParams";

import DataPageHeader from "@/components/shared/DataPageHeader";
import type { FilterField } from "@/components/shared/FilterPopover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { fmtDateTime } from "@/lib/formatters";
import { AUDIT_MODULES, AUDIT_ACTIONS } from "@/types/enums";
import type { AuditLog } from "@/types/api.types";

// Action badge colors
const ACTION_COLOR: Record<string, string> = {
  CREATE:        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  UPDATE:        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  DELETE:        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  APPROVE:       "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  REJECT:        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  STATUS_CHANGE: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  PRICE_CHANGE:  "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  ASSIGN:        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  REASSIGN:      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  CONVERT:       "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  ORDER_CREATE:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ORDER_CANCEL:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  QUOTATION_APPROVAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  QUOTATION_REJECTION: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

// Entity → route map for clickable links
const ENTITY_ROUTES: Partial<Record<string, string>> = {
  LEADS:        "/leads",
  CUSTOMERS:    "/customers",
  OPPORTUNITIES: "/opportunities",
  QUOTATIONS:   "/quotations",
  SALES_ORDERS: "/orders",
  SURVEYS:      "/surveys",
  USERS:        "/users",
  PRODUCTS:     "/catalog/products",
  PRICES:       "/catalog/prices",
};

const FILTER_FIELDS: FilterField[] = [
  {
    key: "module", label: "Module", type: "select",
    options: AUDIT_MODULES.map((m) => ({ label: m, value: m })),
  },
  {
    key: "action", label: "Action", type: "select",
    options: AUDIT_ACTIONS.map((a) => ({ label: a, value: a })),
  },
  { key: "dateFrom", label: "Date From", type: "date" },
  { key: "dateTo",   label: "Date To",   type: "date" },
];

function DetailsExpander({ details }: { details: AuditLog["details"] }) {
  const [open, setOpen] = useState(false);
  const changed = details?.changed ?? [];

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {changed.length > 0 ? `${changed.length} field(s)` : "Details"}
      </button>
      {open && (
        <div className="mt-2 rounded-md bg-slate-50 p-2 dark:bg-slate-800/50">
          {changed.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left pb-1 pr-3">Field</th>
                  <th className="text-left pb-1 pr-3">Old</th>
                  <th className="text-left pb-1">New</th>
                </tr>
              </thead>
              <tbody>
                {changed.map((c, i) => (
                  <tr key={i}>
                    <td className="pr-3 font-mono text-slate-700 dark:text-slate-300">{c.field}</td>
                    <td className="pr-3 text-red-600 dark:text-red-400">{String(c.old ?? "—")}</td>
                    <td className="text-emerald-700 dark:text-emerald-400">{String(c.new ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre className="overflow-x-auto text-xs text-slate-600 dark:text-slate-400">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditLogTable() {
  const { params, setParam, setParams, resetParams } = useQueryParams();

  const page  = Number(params.page  ?? 1);
  const limit = Number(params.limit ?? 20);
  const search = params.search ?? "";

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page, limit,
    ...(search           && { search }),
    ...(params.module    && { module: params.module }),
    ...(params.action    && { action: params.action }),
    ...(params.dateFrom  && { dateFrom: params.dateFrom }),
    ...(params.dateTo    && { dateTo: params.dateTo }),
  });

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">All system activity records</p>
      </div>

      <DataPageHeader
        title=""
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        filterFields={FILTER_FIELDS}
        filterValues={{
          module:   params.module   ?? "",
          action:   params.action   ?? "",
          dateFrom: params.dateFrom ?? "",
          dateTo:   params.dateTo   ?? "",
        }}
        onFilterApply={(v) => setParams({ ...v, page: "1" })}
        onFilterReset={resetParams}
        canCreate={false}
      />

      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load audit logs.
          <button onClick={() => refetch()} className="ml-3 font-medium underline">Retry</button>
        </div>
      )}

      {/* Custom table (too many columns for generic DataTable) */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                {["Timestamp", "Actor", "Module", "Action", "Entity", "Summary", "Details", "IP"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && data?.data.map((log) => {
                const entityRoute = ENTITY_ROUTES[log.module];
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{fmtDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-50">{log.actor?.name ?? "—"}</p>
                      <p className="text-xs text-slate-500">{log.actor?.role}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{log.module}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] font-medium ${ACTION_COLOR[log.action] ?? ""}`}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {entityRoute ? (
                        <Link href={`${entityRoute}/${log.entityId}`} className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400">
                          {log.entityLabel || log.entityId.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-slate-500">{log.entityLabel || log.entityId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="max-w-56 px-4 py-3">
                      <p className="truncate text-xs text-slate-600 dark:text-slate-400">{log.summary}</p>
                    </td>
                    <td className="px-4 py-3">
                      <DetailsExpander details={log.details} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{log.ipAddress ?? "—"}</td>
                  </tr>
                );
              })}
              {!isLoading && (!data?.data.length) && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="text-sm text-slate-500">{(page - 1) * limit + 1}–{Math.min(page * limit, data.meta.total)} of {data.meta.total}</span>
            <div className="flex gap-2">
              <button onClick={() => setParam("page", String(page - 1))} disabled={page <= 1}
                className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">← Prev</button>
              <button onClick={() => setParam("page", String(page + 1))} disabled={page >= data.meta.totalPages}
                className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
