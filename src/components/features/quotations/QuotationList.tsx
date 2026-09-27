"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { useQuotations } from "./useQuotations";
import { useQueryParams } from "@/hooks/useQueryParams";
import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import DataPageHeader from "@/components/shared/DataPageHeader";
import type { FilterField } from "@/components/shared/FilterPopover";
import StatusBadge from "@/components/shared/StatusBadge";
import { fmtBDT, fmtDate } from "@/lib/formatters";
import { QUOTATION_STATUSES } from "@/types/enums";
import type { Quotation } from "@/types/api.types";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", SENT: "Sent", VIEWED: "Viewed", NEGOTIATION: "Negotiation",
  APPROVED: "Approved", REJECTED: "Rejected", EXPIRED: "Expired", CONVERTED: "Converted",
};

const FILTER_FIELDS: FilterField[] = [
  {
    key: "status", label: "Status", type: "select",
    options: QUOTATION_STATUSES.map((s) => ({ label: STATUS_LABELS[s] ?? s, value: s })),
  },
  { key: "dateFrom", label: "Date From", type: "date" },
  { key: "dateTo",   label: "Date To",   type: "date" },
];

const COLUMNS: ColumnDef<Quotation>[] = [
  {
    key: "quotationNumber", header: "Quotation #", sortable: true,
    cell: (row) => <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-50">{row.quotationNumber}</span>,
  },
  {
    key: "customer", header: "Customer",
    cell: (row) => (
      <div className="text-sm">
        <p className="font-medium text-slate-900 dark:text-slate-50">{row.customer?.contactPerson ?? "—"}</p>
        {row.customer?.companyName && <p className="text-xs text-slate-500">{row.customer.companyName}</p>}
      </div>
    ),
  },
  {
    key: "status", header: "Status", sortable: true,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "grandTotal", header: "Grand Total",
    cell: (row) => <span className="font-semibold">{fmtBDT(Number(row.grandTotal))}</span>,
  },
  {
    key: "quotationDate", header: "Date", sortable: true,
    cell: (row) => <span className="text-sm text-slate-500">{fmtDate(row.quotationDate)}</span>,
  },
  {
    key: "expiryDate", header: "Expiry",
    cell: (row) => <span className="text-sm text-slate-500">{fmtDate(row.expiryDate)}</span>,
  },
  {
    key: "marketingPerson", header: "Marketing",
    cell: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.marketingPerson?.name ?? "—"}</span>,
  },
];

export default function QuotationList() {
  const router = useRouter();
  const { params, setParam, setParams, resetParams } = useQueryParams();

  const page  = Number(params.page  ?? 1);
  const limit = Number(params.limit ?? 20);
  const search = params.search ?? "";
  const sort   = params.sort   ?? "-quotationDate";

  const { data, isLoading, isError, refetch } = useQuotations({
    page, limit, sort,
    ...(search && { search }),
    ...(params.status   && { status:   params.status }),
    ...(params.dateFrom && { dateFrom: params.dateFrom }),
    ...(params.dateTo   && { dateTo:   params.dateTo }),
  });

  const rawSort = params.sort ?? "-quotationDate";

  return (
    <div className="p-6">
      <DataPageHeader
        title="Quotations"
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        filterFields={FILTER_FIELDS}
        filterValues={{ status: params.status ?? "", dateFrom: params.dateFrom ?? "", dateTo: params.dateTo ?? "" }}
        onFilterApply={(v) => setParams({ ...v, page: "1" })}
        onFilterReset={resetParams}
        createHref="/quotations/new"
        createLabel="New Quotation"
      />
      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load quotations.
          <button onClick={() => refetch()} className="ml-3 font-medium underline">Retry</button>
        </div>
      )}
      <DataTable<Quotation>
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(p) => setParam("page", String(p))}
        onPageSizeChange={(s) => setParams({ limit: String(s), page: "1" })}
        sortKey={rawSort.replace(/^-/, "")}
        sortDir={rawSort.startsWith("-") ? "desc" : "asc"}
        onSort={(key) => setParam("sort", (params.sort ?? "-quotationDate") === `-${key}` ? key : `-${key}`)}
        getRowKey={(row) => row.id}
        emptyMessage="No quotations found."
        emptyAction={{ label: "+ New Quotation", onClick: () => router.push("/quotations/new") }}
        rowActions={[
          { label: "View", icon: Eye, onClick: (row) => router.push(`/quotations/${row.id}`) },
        ]}
      />
    </div>
  );
}
