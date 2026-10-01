"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { z } from "zod";

import { useCategories, useServices, useCreateCategory, useUpdateCategory, useDeleteCategory } from "./useCatalog";
import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import StatusBadge from "@/components/shared/StatusBadge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/formatters";
import type { Category } from "@/types/api.types";

const schema = z.object({
  serviceId: z.string().uuid("Select a service"),
  name:      z.string().min(1, "Name is required").max(100),
  status:    z.enum(["ACTIVE", "INACTIVE"] as const).default("ACTIVE"),
});
type FormData = z.infer<typeof schema>;

function CategoryRow({ cat, services, canEdit }: { cat: Category; services: { id: string; name: string }[]; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const update = useUpdateCategory(cat.id);
  const del    = useDeleteCategory();

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { serviceId: cat.service?.id ?? "", name: cat.name, status: cat.status as "ACTIVE" | "INACTIVE" },
  });

  if (editing) {
    return (
      <div className="flex items-start gap-2 border-b border-slate-100 py-3 px-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <form onSubmit={form.handleSubmit((v) => update.mutate(v, { onSuccess: () => setEditing(false) }))} className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={form.watch("serviceId")} onValueChange={(v) => form.setValue("serviceId", v)} disabled={update.isPending}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input {...form.register("name")} className="h-8 w-40 text-sm" disabled={update.isPending} autoFocus />
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
          <p className="font-medium text-slate-900 dark:text-slate-50">{cat.name}</p>
          {cat.service && <Badge variant="outline" className="mt-0.5 text-[10px]">{cat.service.name}</Badge>}
        </div>
        <div className="flex shrink-0 items-center gap-3 ml-4">
          <StatusBadge status={cat.status} />
          <span className="text-xs text-slate-400">{fmtDate(cat.createdAt)}</span>
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
        resourceName="Category" itemLabel={cat.name}
        onConfirm={() => del.mutate(cat.id, { onSuccess: () => setDeleteOpen(false) })}
        isDeleting={del.isPending}
      />
    </>
  );
}

export default function CategoriesList() {
  const user = useAuthStore((s) => s.user);
  const canEdit = can.createService((user?.role as Role) ?? "MARKETING");
  const { data: servicesData } = useServices();
  const services = servicesData?.data ?? [];

  const [filterServiceId, setFilterServiceId] = useState("");
  const { data, isLoading } = useCategories(filterServiceId ? { serviceId: filterServiceId } : {});
  const create = useCreateCategory();
  const [showAdd, setShowAdd] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { serviceId: "", name: "", status: "ACTIVE" },
  });

  function onAdd(values: FormData) {
    create.mutate(values, { onSuccess: () => { form.reset(); setShowAdd(false); } });
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Categories</h1>
        <div className="flex items-center gap-2">
          <Select value={filterServiceId} onValueChange={setFilterServiceId}>
            <SelectTrigger className="h-9 w-40 text-sm"><SelectValue placeholder="Filter by service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Services</SelectItem>
              {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {canEdit && (
            <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5" /> New Category
            </Button>
          )}
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        {showAdd && canEdit && (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
            <form onSubmit={form.handleSubmit(onAdd)} className="flex flex-wrap items-center gap-2">
              <Select value={form.watch("serviceId")} onValueChange={(v) => form.setValue("serviceId", v)} disabled={create.isPending}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Service*" /></SelectTrigger>
                <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input {...form.register("name")} placeholder="Category name*" className="h-8 w-44 text-sm" autoFocus disabled={create.isPending} />
              <Button type="submit" size="sm" className="h-8" disabled={create.isPending}>{create.isPending ? "Adding…" : "Add"}</Button>
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => { setShowAdd(false); form.reset(); }}>Cancel</Button>
            </form>
            {form.formState.errors.serviceId && <p className="mt-1 text-xs text-red-500">{form.formState.errors.serviceId.message}</p>}
            {form.formState.errors.name && <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>
        )}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data?.data?.length ? (
            <p className="p-8 text-center text-sm text-slate-500">No categories found.</p>
          ) : (
            data.data.map((c) => <CategoryRow key={c.id} cat={c} services={services} canEdit={canEdit} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

