"use client";

import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { useOpportunities } from "./useOpportunities";
import { useQueryParams } from "@/hooks/useQueryParams";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import DataPageHeader from "@/components/shared/DataPageHeader";
import FilterPopover, { DATE_RANGE_FIELDS } from "@/components/shared/FilterPopover";
import type { FilterField } from "@/components/shared/FilterPopover";
import StatusBadge from "@/components/shared/StatusBadge";
import { fmtBDT, fmtDate } from "@/lib/formatters";
import { OPPORTUNITY_STAGES } from "@/types/enums";
import type { Opportunity } from "@/types/api.types";

const STAGE_LABELS: Record<string, string> = {
  QUALIFICATION: "Qualification", REQUIREMENT_ANALYSIS: "Req. Analysis",
  SURVEY: "Survey", PROPOSAL: "Proposal", NEGOTIATION: "Negotiation",
  DECISION: "Decision", WON: "Won", LOST: "Lost",
};

const FILTER_FIELDS: FilterField[] = [
  {
    key: "stage", label: "Stage", type: "select",
    options: OPPORTUNITY_STAGES.map((s) => ({ label: STAGE_LABELS[s] ?? s, value: s })),
  },
  ...DATE_RANGE_FIELDS,
];

const COLUMNS: ColumnDef<Opportunity>[] = [
  {
    key: "name", header: "Opportunity", sortable: true,
    cell: (row) => <span className="font-medium text-slate-900 dark:text-slate-50">{row.name}</span>,
  },
  {
    key: "lead", header: "Lead / Customer",
    cell: (row) => (
      <div className="text-sm">
        {row.lead && <p className="text-slate-700 dark:text-slate-300">{row.lead.leadName}</p>}
        {row.customer && <p className="text-slate-500 dark:text-slate-400">{row.customer.companyName ?? row.customer.contactPerson}</p>}
        {!row.lead && !row.customer && <span className="text-slate-400">—</span>}
      </div>
    ),
  },
  {
    key: "stage", header: "Stage", sortable: true,
    cell: (row) => <StatusBadge status={row.stage} />,
  },
  {
    key: "estimatedValue", header: "Est. Value",
    cell: (row) => row.estimatedValue != null ? <span className="font-medium">{fmtBDT(row.estimatedValue)}</span> : <span className="text-slate-400">—</span>,
  },
  {
    key: "expectedClosingDate", header: "Closing Date", sortable: true,
    cell: (row) => row.expectedClosingDate ? <span className="text-sm text-slate-500">{fmtDate(row.expectedClosingDate)}</span> : <span className="text-slate-400">—</span>,
  },
  {
    key: "marketingPerson", header: "Assigned To",
    cell: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.marketingPerson?.name ?? "—"}</span>,
  },
];

export default function OpportunityList() {
  const router = useRouter();
  const { params, setParam, setParams, resetParams } = useQueryParams();

  const page  = Number(params.page  ?? 1);
  const limit = Number(params.limit ?? 20);
  const search = params.search ?? "";
  const sort   = params.sort ?? "-createdAt";

  const { data, isLoading, isError, refetch } = useOpportunities({
    page, limit, sort,
    ...(search && { search }),
    ...(params.stage    && { stage: params.stage }),
    ...(params.dateFrom && { dateFrom: params.dateFrom }),
    ...(params.dateTo   && { dateTo: params.dateTo }),
  });

  const rawSort = params.sort ?? "-createdAt";

  return (
    <div className="p-6">
      <DataPageHeader
        title="Opportunities"
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        filterFields={FILTER_FIELDS}
        filterValues={{ stage: params.stage ?? "", dateFrom: params.dateFrom ?? "", dateTo: params.dateTo ?? "" }}
        onFilterApply={(v) => setParams({ ...v, page: "1" })}
        onFilterReset={resetParams}
        createHref="/opportunities/new"
        createLabel="New Opportunity"
      />
      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load opportunities.
          <button onClick={() => refetch()} className="ml-3 font-medium underline">Retry</button>
        </div>
      )}
      <DataTable<Opportunity>
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(p) => setParam("page", String(p))}
        onPageSizeChange={(s) => setParams({ limit: String(s), page: "1" })}
        sortKey={rawSort.replace(/^-/, "")}
        sortDir={rawSort.startsWith("-") ? "desc" : "asc"}
        onSort={(key) => {
          const cur = params.sort ?? "-createdAt";
          setParam("sort", cur === key ? `-${key}` : `-${key}`);
        }}
        getRowKey={(row) => row.id}
        emptyMessage="No opportunities found."
        emptyAction={{ label: "+ New Opportunity", onClick: () => router.push("/opportunities/new") }}
        rowActions={[
          { label: "View", icon: Eye,    onClick: (row) => router.push(`/opportunities/${row.id}`) },
          { label: "Edit", icon: Pencil, onClick: (row) => router.push(`/opportunities/${row.id}?edit=true`) },
        ]}
      />
    </div>
  );
}
