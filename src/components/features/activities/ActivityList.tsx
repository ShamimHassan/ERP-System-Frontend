"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useActivities } from "./useActivities";
import { useQueryParams } from "@/hooks/useQueryParams";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import DataPageHeader from "@/components/shared/DataPageHeader";
import FilterPopover from "@/components/shared/FilterPopover";
import type { FilterField } from "@/components/shared/FilterPopover";
import StatusBadge from "@/components/shared/StatusBadge";
import { fmtDate } from "@/lib/formatters";
import { ACTIVITY_TYPES } from "@/types/enums";
import type { Activity } from "@/types/api.types";

const TYPE_LABELS: Record<string, string> = {
  CALL: "Call", MEETING: "Meeting", FOLLOW_UP: "Follow-up",
  SURVEY: "Survey", EMAIL: "Email", DEMO: "Demo", SITE_VISIT: "Site Visit", OTHER: "Other",
};

const FILTER_FIELDS: FilterField[] = [
  {
    key: "type", label: "Activity Type", type: "select",
    options: ACTIVITY_TYPES.map((t) => ({ label: TYPE_LABELS[t] ?? t, value: t })),
  },
  {
    key: "relatedType", label: "Related To", type: "select",
    options: [
      { label: "Lead", value: "LEAD" },
      { label: "Customer", value: "CUSTOMER" },
      { label: "Opportunity", value: "OPPORTUNITY" },
    ],
  },
  { key: "activityDateFrom", label: "Date From", type: "date" },
  { key: "activityDateTo",   label: "Date To",   type: "date" },
];

const COLUMNS: ColumnDef<Activity>[] = [
  {
    key: "type", header: "Type",
    cell: (row) => (
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {TYPE_LABELS[row.type] ?? row.type}
      </span>
    ),
  },
  {
    key: "relatedType", header: "Related To",
    cell: (row) => (
      <div className="text-sm">
        <span className="text-xs text-slate-500">{row.relatedType}</span>
        <p className="font-mono text-xs text-slate-400 truncate w-28">{row.relatedId.slice(0, 8)}…</p>
      </div>
    ),
  },
  {
    key: "assignedUser", header: "Assigned To",
    cell: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.assignedUser?.name ?? "—"}</span>,
  },
  {
    key: "activityDate", header: "Date", sortable: true,
    cell: (row) => <span className="text-sm text-slate-600">{fmtDate(row.activityDate)}{row.activityTime ? ` ${row.activityTime}` : ""}</span>,
  },
  {
    key: "outcome", header: "Outcome",
    cell: (row) => row.outcome ? (
      <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{row.outcome}</span>
    ) : <span className="text-slate-400">—</span>,
  },
  {
    key: "nextFollowUp", header: "Next Follow-up",
    cell: (row) => row.nextFollowUp ? (
      <span className="text-sm text-slate-500">{fmtDate(row.nextFollowUp)}</span>
    ) : <span className="text-slate-400">—</span>,
  },
  {
    key: "status", header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

export default function ActivityList() {
  const router = useRouter();
  const { params, setParam, setParams, resetParams } = useQueryParams();

  const page  = Number(params.page  ?? 1);
  const limit = Number(params.limit ?? 20);
  const search = params.search ?? "";
  const sort   = params.sort ?? "-activityDate";

  const { data, isLoading, isError, refetch } = useActivities({
    page, limit, sort,
    ...(search                   && { search }),
    ...(params.type              && { type: params.type }),
    ...(params.relatedType       && { relatedType: params.relatedType }),
    ...(params.relatedId         && { relatedId: params.relatedId }),
    ...(params.activityDateFrom  && { activityDateFrom: params.activityDateFrom }),
    ...(params.activityDateTo    && { activityDateTo: params.activityDateTo }),
  });

  const rawSort = params.sort ?? "-activityDate";

  return (
    <div className="p-6">
      <DataPageHeader
        title="Activities"
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        filterFields={FILTER_FIELDS}
        filterValues={{
          type:            params.type            ?? "",
          relatedType:     params.relatedType     ?? "",
          activityDateFrom: params.activityDateFrom ?? "",
          activityDateTo:   params.activityDateTo   ?? "",
        }}
        onFilterApply={(v) => setParams({ ...v, page: "1" })}
        onFilterReset={resetParams}
        createHref="/activities/new"
        createLabel="New Activity"
      />
      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load activities.
          <button onClick={() => refetch()} className="ml-3 font-medium underline">Retry</button>
        </div>
      )}
      <DataTable<Activity>
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(p) => setParam("page", String(p))}
        onPageSizeChange={(s) => setParams({ limit: String(s), page: "1" })}
        sortKey={rawSort.replace(/^-/, "")}
        sortDir={rawSort.startsWith("-") ? "desc" : "asc"}
        onSort={(key) => setParam("sort", (params.sort ?? "-activityDate") === `-${key}` ? key : `-${key}`)}
        getRowKey={(row) => row.id}
        emptyMessage="No activities found."
        emptyAction={{ label: "+ New Activity", onClick: () => router.push("/activities/new") }}
        rowActions={[
          { label: "View", icon: Eye, onClick: (row) => router.push(`/activities/${row.id}`) },
        ]}
      />
    </div>
  );
}
