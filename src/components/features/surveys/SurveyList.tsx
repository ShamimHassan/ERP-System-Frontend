"use client";

import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { useSurveys } from "./useSurveys";
import { useQueryParams } from "@/hooks/useQueryParams";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import DataPageHeader from "@/components/shared/DataPageHeader";
import type { FilterField } from "@/components/shared/FilterPopover";
import StatusBadge from "@/components/shared/StatusBadge";
import { fmtBDT, fmtDate } from "@/lib/formatters";
import { SURVEY_STATUSES } from "@/types/enums";
import type { Survey } from "@/types/api.types";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

const FILTER_FIELDS: FilterField[] = [
  {
    key: "status", label: "Status", type: "select",
    options: SURVEY_STATUSES.map((s) => ({ label: STATUS_LABELS[s] ?? s, value: s })),
  },
  { key: "surveyDateFrom", label: "Survey Date From", type: "date" },
  { key: "surveyDateTo",   label: "Survey Date To",   type: "date" },
];

const COLUMNS: ColumnDef<Survey>[] = [
  {
    key: "location", header: "Location", sortable: true,
    cell: (row) => <span className="font-medium text-slate-900 dark:text-slate-50">{row.location}</span>,
  },
  {
    key: "opportunity", header: "Opportunity",
    cell: (row) => row.opportunity ? (
      <span className="text-sm text-slate-600 dark:text-slate-400">{row.opportunity.name}</span>
    ) : <span className="text-slate-400">—</span>,
  },
  {
    key: "customer", header: "Customer",
    cell: (row) => row.customer ? (
      <span className="text-sm text-slate-600">{row.customer.companyName ?? row.customer.contactPerson}</span>
    ) : <span className="text-slate-400">—</span>,
  },
  {
    key: "surveyDate", header: "Survey Date", sortable: true,
    cell: (row) => <span className="text-sm text-slate-500">{fmtDate(row.surveyDate)}</span>,
  },
  {
    key: "budget", header: "Budget",
    cell: (row) => row.budget != null ? <span className="font-medium">{fmtBDT(row.budget)}</span> : <span className="text-slate-400">—</span>,
  },
  {
    key: "assignedPerson", header: "Assigned To",
    cell: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.assignedPerson?.name ?? "—"}</span>,
  },
  {
    key: "status", header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

export default function SurveyList() {
  const router = useRouter();
  const { params, setParam, setParams, resetParams } = useQueryParams();

  const page  = Number(params.page  ?? 1);
  const limit = Number(params.limit ?? 20);
  const search = params.search ?? "";
  const sort   = params.sort ?? "-surveyDate";

  const { data, isLoading, isError, refetch } = useSurveys({
    page, limit, sort,
    ...(search                  && { search }),
    ...(params.status           && { status: params.status }),
    ...(params.surveyDateFrom   && { surveyDateFrom: params.surveyDateFrom }),
    ...(params.surveyDateTo     && { surveyDateTo: params.surveyDateTo }),
  });

  const rawSort = params.sort ?? "-surveyDate";

  return (
    <div className="p-6">
      <DataPageHeader
        title="Surveys"
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        filterFields={FILTER_FIELDS}
        filterValues={{
          status:         params.status         ?? "",
          surveyDateFrom: params.surveyDateFrom ?? "",
          surveyDateTo:   params.surveyDateTo   ?? "",
        }}
        onFilterApply={(v) => setParams({ ...v, page: "1" })}
        onFilterReset={resetParams}
        createHref="/surveys/new"
        createLabel="New Survey"
      />
      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load surveys.
          <button onClick={() => refetch()} className="ml-3 font-medium underline">Retry</button>
        </div>
      )}
      <DataTable<Survey>
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(p) => setParam("page", String(p))}
        onPageSizeChange={(s) => setParams({ limit: String(s), page: "1" })}
        sortKey={rawSort.replace(/^-/, "")}
        sortDir={rawSort.startsWith("-") ? "desc" : "asc"}
        onSort={(key) => setParam("sort", (params.sort ?? "-surveyDate") === `-${key}` ? key : `-${key}`)}
        getRowKey={(row) => row.id}
        emptyMessage="No surveys found."
        emptyAction={{ label: "+ New Survey", onClick: () => router.push("/surveys/new") }}
        rowActions={[
          { label: "View", icon: Eye,    onClick: (row) => router.push(`/surveys/${row.id}`) },
          { label: "Edit", icon: Pencil, onClick: (row) => router.push(`/surveys/${row.id}?edit=true`) },
        ]}
      />
    </div>
  );
}
