"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { History, Plus, AlertTriangle } from "lucide-react";
import { z } from "zod";

import { useProducts, useCurrentPrice, useAddPrice } from "./useCatalog";
import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { fmtBDT, fmtDate } from "@/lib/formatters";
import { BILLING_TYPES } from "@/types/enums";
import type { Product } from "@/types/api.types";

const priceSchema = z.object({
  regularPrice:  z.coerce.number().positive("Must be positive"),
  sellingPrice:  z.coerce.number().positive("Must be positive"),
  minimumPrice:  z.coerce.number().positive("Must be positive"),
  billingType:   z.enum(BILLING_TYPES),
  effectiveDate: z.string().date("Enter a valid date"),
}).refine((d) => d.sellingPrice >= d.minimumPrice, {
  message: "Selling price must be ≥ minimum price",
  path: ["sellingPrice"],
}).refine((d) => d.regularPrice >= d.sellingPrice, {
  message: "Regular price must be ≥ selling price",
  path: ["regularPrice"],
});
type PriceFormData = z.infer<typeof priceSchema>;

const BILLING_LABELS: Record<string, string> = {
  MONTHLY: "Monthly", QUARTERLY: "Quarterly", YEARLY: "Yearly", ONE_TIME: "One-time",
};

function PriceCard({ productId }: { productId: string }) {
  const user = useAuthStore((s) => s.user);
  const canEdit = can.editPricing((user?.role as Role) ?? "MARKETING");
  const { data: price, isLoading } = useCurrentPrice(productId);
  const addPrice = useAddPrice(productId);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<PriceFormData>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      regularPrice:  price?.regularPrice ?? 0,
      sellingPrice:  price?.sellingPrice ?? 0,
      minimumPrice:  price?.minimumPrice ?? 0,
      billingType:   price?.billingType  ?? "MONTHLY",
      effectiveDate: new Date().toISOString().split("T")[0],
    },
  });

  const { isSubmitting } = form.formState;
  const sellingVal  = form.watch("sellingPrice");
  const minimumVal  = form.watch("minimumPrice");
  const belowMin    = sellingVal > 0 && minimumVal > 0 && sellingVal < minimumVal;

  function onSubmit(values: PriceFormData) {
    addPrice.mutate(values, { onSuccess: () => { form.reset(); setShowForm(false); } });
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Current Active Price
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs text-slate-500">
          <Link href={`/catalog/prices/${productId}/history`}>
            <History className="mr-1 h-3.5 w-3.5" /> History
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {price ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><p className="text-xs text-slate-500">Regular</p><p className="font-semibold">{fmtBDT(price.regularPrice)}</p></div>
            <div><p className="text-xs text-slate-500">Selling</p><p className="font-semibold text-emerald-700 dark:text-emerald-400">{fmtBDT(price.sellingPrice)}</p></div>
            <div><p className="text-xs text-slate-500">Minimum</p><p className="font-semibold text-red-600 dark:text-red-400">{fmtBDT(price.minimumPrice)}</p></div>
            <div><p className="text-xs text-slate-500">Billing</p><p className="font-medium">{BILLING_LABELS[price.billingType] ?? price.billingType}</p></div>
            <div className="col-span-2"><p className="text-xs text-slate-500">Effective From</p><p className="font-medium">{fmtDate(price.effectiveDate)}</p></div>
            {price.createdBy && <div className="col-span-2"><p className="text-xs text-slate-500">Set By</p><p className="text-sm">{price.createdBy.name}</p></div>}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No active price set for this product.</p>
        )}

        {canEdit && !showForm && (
          <Button size="sm" variant="outline" className="gap-1.5 mt-2" onClick={() => {
            if (price) { form.setValue("regularPrice", price.regularPrice); form.setValue("sellingPrice", price.sellingPrice); form.setValue("minimumPrice", price.minimumPrice); form.setValue("billingType", price.billingType); }
            setShowForm(true);
          }}>
            <Plus className="h-3.5 w-3.5" /> Set New Price
          </Button>
        )}

        {canEdit && showForm && (
          <>
            <Separator />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">New Price</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Regular Price*</label>
                  <Input {...form.register("regularPrice")} type="number" min={0} step="0.01" className="h-8 text-sm" disabled={isSubmitting} />
                  {form.formState.errors.regularPrice && <p className="mt-0.5 text-xs text-red-500">{form.formState.errors.regularPrice.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Selling Price*</label>
                  <Input {...form.register("sellingPrice")} type="number" min={0} step="0.01" className="h-8 text-sm" disabled={isSubmitting} />
                  {belowMin && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="h-3 w-3" />Below minimum — approval required</p>
                  )}
                  {form.formState.errors.sellingPrice && <p className="mt-0.5 text-xs text-red-500">{form.formState.errors.sellingPrice.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Minimum Price*</label>
                  <Input {...form.register("minimumPrice")} type="number" min={0} step="0.01" className="h-8 text-sm" disabled={isSubmitting} />
                  {form.formState.errors.minimumPrice && <p className="mt-0.5 text-xs text-red-500">{form.formState.errors.minimumPrice.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Billing Type*</label>
                  <Select value={form.watch("billingType")} onValueChange={(v) => form.setValue("billingType", v as PriceFormData["billingType"])} disabled={isSubmitting}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{BILLING_TYPES.map((b) => <SelectItem key={b} value={b}>{BILLING_LABELS[b] ?? b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Effective Date*</label>
                  <Input {...form.register("effectiveDate")} type="date" className="h-8 text-sm" disabled={isSubmitting} />
                  {form.formState.errors.effectiveDate && <p className="mt-0.5 text-xs text-red-500">{form.formState.errors.effectiveDate.message}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save Price"}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function PricingPanel() {
  const { data: productsData, isLoading } = useProducts({ limit: 100 });
  const products = productsData?.data ?? [];
  const [selectedProductId, setSelectedProductId] = useState("");

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Pricing</h1>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Product</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-9 w-64" /> : (
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Choose a product to manage pricing…" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.category && <Badge variant="outline" className="text-[10px]">{p.category.name}</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{selectedProduct.name}</h2>
            {selectedProduct.category && <Badge variant="outline">{selectedProduct.category.name}</Badge>}
          </div>
          <PriceCard productId={selectedProductId} />
        </>
      )}
    </div>
  );
}
