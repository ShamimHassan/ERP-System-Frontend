"use client";

import { useState } from "react";
import { Pencil, Trash2, KeyRound, Plus } from "lucide-react";

import { useUsers, useDeleteUser, type UserRow } from "./useUsers";
import { useAuthStore } from "@/store/auth.store";
import { useQueryParams } from "@/hooks/useQueryParams";

import DataTable, { type ColumnDef } from "@/components/shared/DataTable";
import DataPageHeader from "@/components/shared/DataPageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import UserForm from "./UserForm";
import SetPasswordDialog from "./SetPasswordDialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/formatters";

const ROLE_BADGE: Record<string, string> = {
  ADMIN:     "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300",
  MANAGER:   "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  MARKETING: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function UsersList() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { params, setParam, setParams } = useQueryParams();

  const page  = Number(params.page  ?? 1);
  const limit = Number(params.limit ?? 20);
  const search = params.search ?? "";

  const { data, isLoading, isError, refetch } = useUsers({
    page, limit,
    ...(search && { search }),
    ...(params.status && { status: params.status }),
  });

  const deleteMutation = useDeleteUser();
  const [deleteTarget,   setDeleteTarget]   = useState<UserRow | null>(null);
  const [editTarget,     setEditTarget]     = useState<UserRow | null>(null);
  const [showCreate,     setShowCreate]     = useState(false);
  const [pwTarget,       setPwTarget]       = useState<UserRow | null>(null);

  const COLUMNS: ColumnDef<UserRow>[] = [
    {
      key: "name", header: "Name", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-50">{row.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role", header: "Role",
      cell: (row) => (
        <Badge variant="outline" className={`text-xs ${ROLE_BADGE[row.role] ?? ""}`}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: "manager", header: "Manager",
      cell: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{row.manager?.name ?? "—"}</span>
      ),
    },
    {
      key: "status", header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt", header: "Created", sortable: true,
      cell: (row) => <span className="text-sm text-slate-500">{fmtDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? "Manage all system users." : "Your team members (read-only)."}
          </p>
        </div>
        {isAdmin && (
          <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> New User
          </Button>
        )}
      </div>

      <DataPageHeader
        title=""
        search={search}
        onSearchChange={(v) => setParams({ search: v, page: "1" })}
        canCreate={false}
      />

      {isError && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to load users.
          <button onClick={() => refetch()} className="ml-3 font-medium underline">Retry</button>
        </div>
      )}

      <DataTable<UserRow>
        columns={COLUMNS}
        data={data?.data}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(p) => setParam("page", String(p))}
        onPageSizeChange={(s) => setParams({ limit: String(s), page: "1" })}
        getRowKey={(row) => row.id}
        emptyMessage="No users found."
        rowActions={isAdmin ? [
          { label: "Edit",         icon: Pencil,   onClick: (row) => setEditTarget(row) },
          { label: "Set Password", icon: KeyRound,  onClick: (row) => setPwTarget(row) },
          {
            label: "Delete", icon: Trash2, destructive: true,
            hidden: (row) => row.id === user?.id,
            onClick: (row) => setDeleteTarget(row),
          },
        ] : []}
      />

      {/* Create / Edit dialog */}
      <UserForm open={showCreate} onOpenChange={setShowCreate} />
      <UserForm open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)} user={editTarget ?? undefined} />

      {/* Set Password dialog */}
      {pwTarget && (
        <SetPasswordDialog
          open={!!pwTarget}
          onOpenChange={(v) => !v && setPwTarget(null)}
          userId={pwTarget.id}
          userName={pwTarget.name}
        />
      )}

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        resourceName="User"
        itemLabel={deleteTarget?.name}
        onConfirm={() =>
          deleteMutation.mutate(deleteTarget!.id, { onSuccess: () => setDeleteTarget(null) })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
