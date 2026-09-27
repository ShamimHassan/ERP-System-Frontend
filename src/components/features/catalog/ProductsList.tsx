"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, X, Check, DollarSign } from "lucide-react";
import { z } from "zod";

import { useProducts, useServices, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from "./useCatalog";
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
import type { Product } from "@/types/api.types";

const schema = z.object({
  categoryId:  z.string().uuid("Select a category"),
  name:        z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).optional(),
  unit:        z.string().min(1, "Unit is required").max(50),
  status:      z.enum(["ACTIVE", "INACTIVE"] as const).default("ACTIVE"),
});
type FormData = z.infer<typeof schema>;

function ProductRow({ product, categories, canEdit }: { product: Product; categories: { id: string; name: string }[]; canEdit: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const update = useUpdateProduct(product.id);
  const del    = useDeleteProduct();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: product.category?.id ?? "", name: product.name, description: product.description ?? "", unit: product.unit, status: product.status as "ACTIVE" | "INACTIVE" },
  });

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
        <form onSubmit={form.handleSubmit((v) => update.mutate(v, { onSuccess: () => setEditing(false) }))} className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={form.watch("categoryId")} onValueChange={(v) => form.setValue("categoryId", v)} disabled={update.isPending}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input {...form.register("name")} placeholder="Product name*" className="h-8 w-40 text-sm" autoFocus disabled={update.isPending} />
          <Input {...form.register("unit")} placeholder="Unit (e.g. Mbps)*" className="h-8 w-24 text-sm" disabled={update.isPending} />
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
          <p className="font-medium text-slate-900 dark:text-slate-50">{product.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {product.category && (
              <Badge variant="outline" className="text-[10px]">{product.category.name}</Badge>
            )}
            {product.category?.service && (
              <Badge variant="outline" className="text-[10px] text-slate-400">{product.category.service.name}</Badge>
            )}
            <span className="text-xs text-slate-400">Unit: {product.unit}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 ml-4">
          <StatusBadge status={product.status} />
          <span className="text-xs text-slate-400">{fmtDate(product.createdAt)}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-emerald-600" title="Set Price"
            onClick={() => router.push(`/catalog/prices?productId=${product.id}`)}>
            <DollarSign className="h-3.5 w-3.5" />
          </Button>
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
        resourceName="Product" itemLabel={product.name}
        onConfirm={() => del.mutate(product.id, { onSuccess: () => setDeleteOpen(false) })}
        isDeleting={del.isPending}
      />
    </>
  );
}

export default function ProductsList() {
  const user = useAuthStore((s) => s.user);
  const canEdit = can.createService((user?.role as Role) ?? "MARKETING");

  const { data: servicesData } = useServices();
  const services = servicesData?.data ?? [];

  const [filterServiceId, setFilterServiceId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  const { data: categoriesData } = useCategories(filterServiceId ? { serviceId: filterServiceId } : {});
  const categories = categoriesData?.data ?? [];

  const { data, isLoading } = useProducts({
    ...(filterServiceId  && { serviceId:  filterServiceId }),
    ...(filterCategoryId && { categoryId: filterCategoryId }),
  });

  const create = useCreateProduct();
  const [showAdd, setShowAdd] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: "", name: "", description: "", unit: "", status: "ACTIVE" },
  });

  function onAdd(values: FormData) {
    create.mutate(values, { onSuccess: () => { form.reset(); setShowAdd(false); } });
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Products</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterServiceId} onValueChange={(v) => { setFilterServiceId(v === "__all__" ? "" : v); setFilterCategoryId(""); }}>
            <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Filter: Service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Services</SelectItem>
              {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCategoryId} onValueChange={(v) => setFilterCategoryId(v === "__all__" ? "" : v)} disabled={!filterServiceId}>
            <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Filter: Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {canEdit && (
            <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5" /> New Product
            </Button>
          )}
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        {showAdd && canEdit && (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
            <form onSubmit={form.handleSubmit(onAdd)} className="flex flex-wrap items-center gap-2">
              <Select value={form.watch("categoryId")} onValueChange={(v) => form.setValue("categoryId", v)} disabled={create.isPending}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Category*" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input {...form.register("name")} placeholder="Product name*" className="h-8 w-44 text-sm" autoFocus disabled={create.isPending} />
              <Input {...form.register("unit")} placeholder="Unit (Mbps, GB...)*" className="h-8 w-28 text-sm" disabled={create.isPending} />
              <Button type="submit" size="sm" className="h-8" disabled={create.isPending}>{create.isPending ? "Adding…" : "Add"}</Button>
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => { setShowAdd(false); form.reset(); }}>Cancel</Button>
            </form>
            {form.formState.errors.categoryId && <p className="mt-1 text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
            {form.formState.errors.name && <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>
        )}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !data?.data.length ? (
            <p className="p-8 text-center text-sm text-slate-500">No products found.</p>
          ) : (
            data.data.map((p) => <ProductRow key={p.id} product={p} categories={categories} canEdit={canEdit} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
