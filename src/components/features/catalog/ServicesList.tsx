"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { z } from "zod";

import { useServices, useCreateService, useUpdateService, useDeleteService } from "./useCatalog";
import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import StatusBadge from "@/components/shared/StatusBadge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtDate } from "@/lib/formatters";
import type { CatalogService } from "@/types/api.types";

const schema = z.object({
  name:        z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  status:      z.enum(["ACTIVE", "INACTIVE"] as const).default("ACTIVE"),
});
type FormData = z.infer<typeof schema>;

function ServiceRow({ service, canEdit }: { service: CatalogService; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const update = useUpdateService(service.id);
  const del    = useDeleteService();

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: service.name, description: service.description ?? "", status: service.status as "ACTIVE" | "INACTIVE" },
  });

  function onSubmit(values: FormData) {
    update.mutate(values, { onSuccess: () => setEditing(false) });
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2 border-b border-slate-100 py-3 px-4 dark:border-slate-800">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 items-center gap-2">
          <Input {...form.register("name")} className="h-8 w-40 text-sm" disabled={update.isPending} autoFocus />
          <Input {...form.register("description")} placeholder="Description" className="h-8 flex-1 text-sm" disabled={update.isPending} />
          <Button type="submit" size="icon" className="h-7 w-7" disabled={update.isPending}><Check className="h-3.5 w-3.5" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5" /></Button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 py-3 px-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 dark:text-slate-50">{service.name}</p>
          {service.description && <p className="text-xs text-slate-500 dark:text-slate-400">{service.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3 ml-4">
          <StatusBadge status={service.status} />
          <span className="text-xs text-slate-400">{fmtDate(service.createdAt)}</span>
          {canEdit && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => setDeleteOpen(true)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        resourceName="Service" itemLabel={service.name}
        onConfirm={() => del.mutate(service.id, { onSuccess: () => setDeleteOpen(false) })}
        isDeleting={del.isPending}
      />
    </>
  );
}

export default function ServicesList() {
  const user = useAuthStore((s) => s.user);
  const canEdit = can.createService((user?.role as Role) ?? "MARKETING");
  const { data, isLoading } = useServices();
  const create = useCreateService();
  const [showAdd, setShowAdd] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: "", description: "", status: "ACTIVE" },
  });

  function onAdd(values: FormData) {
    create.mutate(values, { onSuccess: () => { form.reset(); setShowAdd(false); } });
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Services</h1>
        {canEdit && (
          <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> New Service
          </Button>
        )}
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        {showAdd && canEdit && (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
            <form onSubmit={form.handleSubmit(onAdd)} className="flex items-center gap-2">
              <Input {...form.register("name")} placeholder="Service name*" className="h-8 w-40 text-sm" autoFocus disabled={create.isPending} />
              <Input {...form.register("description")} placeholder="Description (optional)" className="h-8 flex-1 text-sm" disabled={create.isPending} />
              <Button type="submit" size="sm" className="h-8" disabled={create.isPending}>{create.isPending ? "Adding…" : "Add"}</Button>
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => { setShowAdd(false); form.reset(); }}>Cancel</Button>
            </form>
            {form.formState.errors.name && <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>
        )}

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data?.data.length ? (
            <p className="p-8 text-center text-sm text-slate-500">No services yet.{canEdit ? " Click \"New Service\" to add one." : ""}</p>
          ) : (
            data.data.map((s) => <ServiceRow key={s.id} service={s} canEdit={canEdit} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

