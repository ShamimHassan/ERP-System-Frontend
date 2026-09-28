"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtBDT } from "@/lib/formatters";
import type { Product, ProductPrice } from "@/types/api.types";

interface QuotationItemsEditorProps {
  /** Watch these to recompute totals */
  discountTotal: number;
  taxTotal: number;
}

export default function QuotationItemsEditor({ discountTotal, taxTotal }: QuotationItemsEditorProps) {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  // Load all active products for the product selector
  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ["products-active"],
    queryFn: () => api.get("/products", { params: { limit: 200, status: "ACTIVE" } }) as unknown as Promise<{ data: Product[] }>,
  });
  const products = productsData?.data ?? [];

  // Current prices map: productId → price
  const productIds = fields
    .map((_, i) => form.watch(`items.${i}.productId`) as string)
    .filter(Boolean);

  const { data: pricesData } = useQuery<{ data: ProductPrice[] }>({
    queryKey: ["prices-current-multi", productIds],
    queryFn: async () => {
      const results = await Promise.all(
        productIds.map((id) =>
          api.get(`/products/${id}/prices/current`).catch(() => null)
        )
      );
      return { data: (results.filter(Boolean) as unknown[]) as ProductPrice[] };
    },
    enabled: productIds.length > 0,
  });

  const priceMap: Record<string, ProductPrice> = {};
  pricesData?.data.forEach((p) => { if (p?.productId) priceMap[p.productId] = p; });

  // Compute totals client-side (UX only — backend recalculates)
  function getLineTotal(i: number): number {
    const qty      = Number(form.watch(`items.${i}.quantity`)  ?? 0);
    const unit     = Number(form.watch(`items.${i}.unitPrice`) ?? 0);
    const disc     = Number(form.watch(`items.${i}.discount`)  ?? 0);
    const tax      = Number(form.watch(`items.${i}.tax`)       ?? 0);
    const base     = qty * unit;
    const afterDisc = base * (1 - disc / 100);
    const afterTax  = afterDisc * (1 + tax / 100);
    return Math.round(afterTax * 100) / 100;
  }

  const subtotal = fields.reduce((sum, _, i) => sum + getLineTotal(i), 0);
  const grandTotal = Math.round((subtotal - Number(discountTotal) + Number(taxTotal)) * 100) / 100;

  function handleProductChange(i: number, productId: string) {
    form.setValue(`items.${i}.productId`, productId);
    // Auto-fill unit price from active price
    const price = priceMap[productId];
    if (price) {
      form.setValue(`items.${i}.unitPrice`, Number(price.sellingPrice));
    }
  }

  function addItem() {
    append({ productId: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 });
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 sm:grid">
        <span>Product</span>
        <span>Unit Price</span>
        <span>Qty</span>
        <span>Disc %</span>
        <span>Tax %</span>
        <span>Line Total</span>
        <span></span>
      </div>

      {fields.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-500">No items yet. Click &quot;+ Add Item&quot; to start.</p>
      )}

      {fields.map((field, i) => {
        const productId   = form.watch(`items.${i}.productId`) as string;
        const unitPrice   = Number(form.watch(`items.${i}.unitPrice`) ?? 0);
        const priceInfo   = priceMap[productId];
        const belowMin    = priceInfo && unitPrice > 0 && unitPrice < Number(priceInfo.minimumPrice);
        const lineTotal   = getLineTotal(i);
        const errors      = form.formState.errors?.items as Record<number, Record<string, { message?: string }>> | undefined;
        const itemErrors  = errors?.[i];

        return (
          <div key={field.id} className="space-y-1.5 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] sm:items-start">
              {/* Product */}
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">Product</label>
                <Select value={productId} onValueChange={(v) => handleProductChange(i, v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select product…" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span>{p.name}</span>
                        {p.category && <span className="ml-2 text-xs text-slate-400">({p.category.name})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {itemErrors?.productId && <p className="text-xs text-red-500">{itemErrors.productId.message}</p>}
              </div>

              {/* Unit Price */}
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">Unit Price</label>
                <Input
                  {...form.register(`items.${i}.unitPrice`, { valueAsNumber: true })}
                  type="number" min={0} step="0.01"
                  className={`h-8 text-sm ${belowMin ? "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/20" : ""}`}
                />
                {belowMin && (
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Below min ({fmtBDT(Number(priceInfo!.minimumPrice))}) — approval needed
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">Qty</label>
                <Input
                  {...form.register(`items.${i}.quantity`, { valueAsNumber: true })}
                  type="number" min={1} step="1" className="h-8 text-sm"
                />
              </div>

              {/* Discount % */}
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">Disc %</label>
                <Input
                  {...form.register(`items.${i}.discount`, { valueAsNumber: true })}
                  type="number" min={0} max={100} step="0.01" className="h-8 text-sm"
                />
              </div>

              {/* Tax % */}
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">Tax %</label>
                <Input
                  {...form.register(`items.${i}.tax`, { valueAsNumber: true })}
                  type="number" min={0} max={100} step="0.01" className="h-8 text-sm"
                />
              </div>

              {/* Line Total (read-only) */}
              <div className="flex items-center">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {fmtBDT(lineTotal)}
                </span>
              </div>

              {/* Remove */}
              <div className="flex items-start">
                <Button
                  type="button" variant="ghost" size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-600"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add item + totals */}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addItem}>
          <Plus className="h-3.5 w-3.5" /> Add Item
        </Button>

        <div className="space-y-1 text-right text-sm">
          <div className="flex justify-end gap-8">
            <span className="text-slate-500">Subtotal</span>
            <span className="w-28 font-medium">{fmtBDT(subtotal)}</span>
          </div>
          {Number(discountTotal) > 0 && (
            <div className="flex justify-end gap-8 text-slate-500">
              <span>Discount</span>
              <span className="w-28">− {fmtBDT(Number(discountTotal))}</span>
            </div>
          )}
          {Number(taxTotal) > 0 && (
            <div className="flex justify-end gap-8 text-slate-500">
              <span>Tax</span>
              <span className="w-28">+ {fmtBDT(Number(taxTotal))}</span>
            </div>
          )}
          <div className="flex justify-end gap-8 border-t border-slate-200 pt-1 dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-slate-50">Grand Total</span>
            <span className="w-28 text-base font-bold text-slate-900 dark:text-slate-50">{fmtBDT(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Items error */}
      {(form.formState.errors?.items as { message?: string } | undefined)?.message && (
        <p className="text-sm text-red-500">{(form.formState.errors.items as { message?: string }).message}</p>
      )}
    </div>
  );
}
