"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useLeads, useDeleteLead } from "./useLeads";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useAuthStore } from "@/store/auth.store";

import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import DataPageHeader from "@/components/shared/DataPageHeader";
import FilterPopover, {
  DATE_RANGE_FIELDS, STATUS_FIELD, PRIORITY_FIELD,
} from "@/components/shared/FilterPopover";
import StatusBadge from "@/components/shared/StatusBadge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

import { fmtBDT, fmtDate } from "@/lib/formatters";
import { LEAD_STATUSES } from "@/types/enums";
import type { Lead } from "@/types/api.types";

// ── Filter fields for Leads ───────────────────────────────────────────────
const LEAD_FILTER_FIELDS = [
  STATUS_FIELD(
    LEAD_STATUSES.map((s) => ({
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      value: s,
    }))
  ),
  PRIORITY_FIELD,
  ...DATE_RANGE_FIELDS,
];

// ── Source label map ──────────────────────────────────────────────────────
const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website", FACEBOOK: "Facebook", GOOGLE: "Google",
  PHONE: "Phone", EMAIL: "Email", REFERRAL: "Referral",
  EXISTING_CUSTOMER: "Existing", DIGITAL_MARKETING: "Digital",
  PARTNER: "Partner", OTHER: "Other",
};

// ── Column definitions ────────────────────────────────────────────────────
const COLUMNS: ColumnDef<Lead>[] = [
  {
    key: "leadName",
    header: "Lead Name",
    sortable: true,
    cell: (row) => (
      <span className="font-medium text-slate-900 dark:text-slate-50">
        {row.leadName}
      </span>
    ),
  },
  {
    key: "companyName",
    header: "Company",
    sortable: true,
    cell: (row) => row.companyName,
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
        <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline dark:text-blue-400 text-xs">
          {row.email}
        </a>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
  {
    key: "address",
    header: "Address",
    cell: (row) =>
      row.address ? (
        <span className="text-xs text-slate-600 dark:text-slate-400 max-w-[160px] block truncate" title={row.address}>
          {row.address}
        </span>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
  {
    key: "leadSource",
    header: "Source",
    cell: (row) => (
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {SOURCE_LABELS[row.leadSource] ?? row.leadSource}
      </span>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    cell: (row) => <StatusBadge status={row.priority} />,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "estimatedValue",
    header: "Est. Value",
    cell: (row) =>
      row.estimatedValue != null ? (
        <span className="font-medium">{fmtBDT(row.estimatedValue)}</span>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
  {
    key: "marketingPerson",
    header: "Assigned To",
    cell: (row) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.marketingPerson?.name ?? "—"}
      </span>
    ),
  },
  {
    key: "nextFollowUp",
    header: "Next Follow-up",
    sortable: true,
    cell: (row) =>
      row.nextFollowUp ? (
        <span className="text-slate-600 dark:text-slate-400">{fmtDate(row.nextFollowUp)}</span>
      ) : (
        <span className="text-slate-400">—</span>
      ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function LeadList() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { params, setParam, setParams, resetParams } = useQueryParams();

  // Parse URL params
  const page   = Number(params.page   ?? 1);
  const limit  = Number(params.limit  ?? 20);
  const search = params.search  ?? "";
  const sort   = params.sort    ?? "-createdAt";

  // Build query params for API
  const queryParams = {
    page,
    limit,
    ...(search && { search }),
    sort,
    ...(params.status   && { status: params.status }),
    ...(params.priority && { priority: params.priority }),
    ...(params.dateFrom && { dateFrom: params.dateFrom }),
    ...(params.dateTo   && { dateTo: params.dateTo }),
  };

  const { data, isLoading, isError, refetch } = useLeads(queryParams);
  const deleteMutation = useDeleteLead();

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  // Sort toggle
  function handleSort(key: string) {
    const currentSort = params.sort ?? "-createdAt";
    let nextSort: string;
    if (currentSort === key)        nextSort = `-${key}`;
    else if (currentSort === `-${key}`) nextSort = key;
    else nextSort = `-${key}`;
    setParam("sort", nextSort);
  }

  // Derive sortKey and sortDir from URL sort param
  const rawSort = params.sort ?? "-createdAt";
  const sortDir = rawSort.startsWith("-") ? "desc" : "asc";
  const sortKey = rawSort.replace(/^-/, "");

  // Filter apply/reset
  function handleFilterApply(values: Record<string, string>) {
    setParams({ ...values, page: "1" });
  }

  function handleFilterReset() {
    resetParams();
  }

  // Active filter values (exclude pagination/sort/search)
  const filterValues = {
    status:   params.status   ?? "",
    priority: params.priority ?? "",
    dateFrom: params.dateFrom ?? "",
    dateTo:   params.dateTo   ?? "",
  };

  return (
    <div className="p-6">
      <DataPageHeader
        title="Leads"
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        filterFields={LEAD_FILTER_FIELDS}
        filterValues={filterValues}
        onFilterApply={handleFilterApply}
        onFilterReset={handleFilterReset}
        createHref="/leads/new"
        createLabel="New Lead"
        canCreate={true}
      />

      {/* Error state */}
      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load leads.
          <button
            onClick={() => refetch()}
            className="ml-3 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <DataTable<Lead>
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(p) => setParam("page", String(p))}
        onPageSizeChange={(s) => setParams({ limit: String(s), page: "1" })}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        getRowKey={(row) => row.id}
        emptyMessage="No leads found."
        emptyAction={
          user?.role !== undefined
            ? { label: "+ New Lead", onClick: () => router.push("/leads/new") }
            : undefined
        }
        rowActions={[
          {
            label: "View",
            icon: Eye,
            onClick: (row) => router.push(`/leads/${row.id}`),
          },
          {
            label: "Edit",
            icon: Pencil,
            onClick: (row) => router.push(`/leads/${row.id}?edit=true`),
          },
          {
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteTarget(row),
          },
        ]}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        resourceName="Lead"
        itemLabel={deleteTarget?.leadName}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
