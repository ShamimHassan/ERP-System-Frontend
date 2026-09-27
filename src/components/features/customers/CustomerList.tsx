"use client";

import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";

import { useCustomers } from "./useCustomers";
import { useQueryParams } from "@/hooks/useQueryParams";

import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import DataPageHeader from "@/components/shared/DataPageHeader";
import FilterPopover, { DATE_RANGE_FIELDS, STATUS_FIELD } from "@/components/shared/FilterPopover";
import type { FilterField } from "@/components/shared/FilterPopover";
import StatusBadge from "@/components/shared/StatusBadge";

import { fmtDate } from "@/lib/formatters";
import { CUSTOMER_TYPES } from "@/types/enums";
import type { Customer } from "@/types/api.types";
import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";

const TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual", BUSINESS: "Business", CORPORATE: "Corporate",
  GOVERNMENT: "Government", PARTNER: "Partner",
};

const CUSTOMER_FILTER_FIELDS: FilterField[] = [
  {
    key: "customerType", label: "Customer Type", type: "select",
    options: CUSTOMER_TYPES.map((t) => ({ label: TYPE_LABELS[t] ?? t, value: t })),
  },
  STATUS_FIELD([
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ]),
  ...DATE_RANGE_FIELDS,
];

const COLUMNS: ColumnDef<Customer>[] = [
  {
    key: "contactPerson",
    header: "Contact Person",
    sortable: true,
    cell: (row) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-50">{row.contactPerson}</p>
        {row.companyName && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.companyName}</p>
        )}
      </div>
    ),
  },
  {
    key: "customerType",
    header: "Type",
    cell: (row) => (
      <span className="text-xs text-slate-600 dark:text-slate-400">
        {TYPE_LABELS[row.customerType] ?? row.customerType}
      </span>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    cell: (row) => (
      <a href={`tel:${row.phone}`} className="text-blue-600 hover:underline dark:text-blue-400">
        {row.phone}
      </a>
    ),
  },
  {
    key: "email",
    header: "Email",
    cell: (row) =>
      row.email ? (
        <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline dark:text-blue-400 text-sm">
          {row.email}
        </a>
      ) : <span className="text-slate-400">—</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "marketingPerson",
    header: "Assigned To",
    cell: (row) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {row.marketingPerson?.name ?? "—"}
      </span>
    ),
  },
  {
    key: "convertedFromLeadId",
    header: "Source",
    cell: (row) =>
      row.convertedFromLeadId ? (
        <span className="text-xs text-emerald-700 dark:text-emerald-400">From Lead</span>
      ) : (
        <span className="text-xs text-slate-400">Direct</span>
      ),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    cell: (row) => (
      <span className="text-sm text-slate-500 dark:text-slate-400">{fmtDate(row.createdAt)}</span>
    ),
  },
];

export default function CustomerList() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { params, setParam, setParams, resetParams } = useQueryParams();

  const page  = Number(params.page  ?? 1);
  const limit = Number(params.limit ?? 20);
  const search = params.search ?? "";
  const sort   = params.sort ?? "-createdAt";

  const queryParams = {
    page, limit, sort,
    ...(search                && { search }),
    ...(params.status         && { status: params.status }),
    ...(params.customerType   && { customerType: params.customerType }),
    ...(params.dateFrom       && { dateFrom: params.dateFrom }),
    ...(params.dateTo         && { dateTo: params.dateTo }),
  };

  const { data, isLoading, isError, refetch } = useCustomers(queryParams);

  const rawSort = params.sort ?? "-createdAt";
  const sortDir = rawSort.startsWith("-") ? "desc" : "asc";
  const sortKey = rawSort.replace(/^-/, "");

  const canCreate = can.createCustomer((user?.role as Role) ?? "MARKETING");

  return (
    <div className="p-6">
      <DataPageHeader
        title="Customers"
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        filterFields={CUSTOMER_FILTER_FIELDS}
        filterValues={{
          customerType: params.customerType ?? "",
          status:       params.status       ?? "",
          dateFrom:     params.dateFrom     ?? "",
          dateTo:       params.dateTo       ?? "",
        }}
        onFilterApply={(v) => setParams({ ...v, page: "1" })}
        onFilterReset={resetParams}
        createHref="/customers/new"
        createLabel="New Customer"
        canCreate={canCreate}
      />

      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load customers.
          <button onClick={() => refetch()} className="ml-3 font-medium underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      <DataTable<Customer>
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(p) => setParam("page", String(p))}
        onPageSizeChange={(s) => setParams({ limit: String(s), page: "1" })}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(key) => {
          const cur = params.sort ?? "-createdAt";
          setParam("sort", cur === key ? `-${key}` : cur === `-${key}` ? key : `-${key}`);
        }}
        getRowKey={(row) => row.id}
        emptyMessage="No customers found."
        emptyAction={canCreate ? { label: "+ New Customer", onClick: () => router.push("/customers/new") } : undefined}
        rowActions={[
          { label: "View", icon: Eye, onClick: (row) => router.push(`/customers/${row.id}`) },
          { label: "Edit", icon: Pencil, onClick: (row) => router.push(`/customers/${row.id}?edit=true`) },
        ]}
      />
    </div>
  );
}
