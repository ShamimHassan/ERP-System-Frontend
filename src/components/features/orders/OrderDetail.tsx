"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, XCircle, CheckCircle } from "lucide-react";

import { useOrder, useUpdateOrderStatus, useCancelOrder } from "./useOrders";
import OrderStatusTimeline from "./OrderStatusTimeline";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonList from "@/components/shared/SkeletonList";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { fmtBDT, fmtDate, fmtDateTime } from "@/lib/formatters";
import type { OrderStatus } from "@/types/enums";

interface OrderDetailProps { id: string }

export default function OrderDetail({ id }: OrderDetailProps) {
  const router = useRouter();
  const { data: order, isLoading, isError, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus(id);
  const cancel       = useCancelOrder(id);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {status === 404 ? "Order not found." : "Failed to load order."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/orders")}>← Back</Button>
      </div>
    );
  }

  if (isLoading || !order) return <div className="p-6"><SkeletonList rows={8} /></div>;

  const subtotal = order.items.reduce((s, it) => s + Number(it.lineTotal), 0);
  const canCancel = order.status !== "CANCELLED" && order.status !== "COMPLETED";

  return (
    <div className="space-y-5 p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/orders" className="hover:text-slate-900 dark:hover:text-slate-100">Orders</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-mono text-slate-900 dark:text-slate-100">{order.orderNumber}</span>
      </nav>

      {/* Header card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-50">{order.orderNumber}</h1>
                <StatusBadge status={order.status} />
              </div>
              {order.customer && (
                <Link href={`/customers/${order.customerId}`}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                  {order.customer.contactPerson}{order.customer.companyName ? ` — ${order.customer.companyName}` : ""}
                </Link>
              )}
              {order.quotation && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  From quotation:{" "}
                  <Link href={`/quotations/${order.quotationId}`}
                    className="font-mono font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {order.quotation.quotationNumber}
                  </Link>
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span>Order Date: <strong>{fmtDate(order.orderDate)}</strong></span>
                {order.expectedActivationDate && (
                  <span>Activation: <strong>{fmtDate(order.expectedActivationDate)}</strong></span>
                )}
                {order.paymentTerms && (
                  <span>Terms: <strong>{order.paymentTerms}</strong></span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{fmtBDT(Number(order.grandTotal))}</p>
              {canCancel && (
                <Button
                  size="sm" variant="outline"
                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                  onClick={() => setCancelOpen(true)}
                  disabled={cancel.isPending}
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel Order
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status timeline */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusTimeline
            status={order.status as OrderStatus}
            isUpdating={updateStatus.isPending}
            onAdvance={(next) => updateStatus.mutate(next)}
          />
        </CardContent>
      </Card>

      {/* Invoice status */}
      {order.invoice && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-slate-500">Invoice #</p>
                <p className="font-mono font-medium">{order.invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Amount</p>
                <p className="font-semibold">{fmtBDT(Number(order.invoice.amount))}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <StatusBadge status={order.invoice.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Issued</p>
                <p className="text-sm">{fmtDate(order.invoice.issuedAt)}</p>
              </div>
              {order.invoice.paidAt && (
                <div>
                  <p className="text-xs text-slate-500">Paid</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">{fmtDate(order.invoice.paidAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line items */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                  {["#", "Product", "Unit Price", "Qty", "Disc %", "Tax %", "Line Total"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                      {item.product?.name ?? item.productId}
                      {item.product?.unit && <span className="ml-1 text-xs text-slate-400">({item.product.unit})</span>}
                    </td>
                    <td className="px-4 py-3 font-medium">{fmtBDT(Number(item.unitPrice))}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-500">{Number(item.discount)}%</td>
                    <td className="px-4 py-3 text-slate-500">{Number(item.tax)}%</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{fmtBDT(Number(item.lineTotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{fmtBDT(subtotal)}</span>
              </div>
              {Number(order.discountTotal) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span>− {fmtBDT(Number(order.discountTotal))}</span>
                </div>
              )}
              {Number(order.taxTotal) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax</span>
                  <span>+ {fmtBDT(Number(order.taxTotal))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-50">
                <span>Grand Total</span>
                <span>{fmtBDT(Number(order.grandTotal))}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
            {[
              { label: "Status",     value: <StatusBadge status={order.status} /> },
              { label: "Marketing",  value: order.marketingPerson?.name ?? "—" },
              { label: "Manager",    value: order.manager?.name ?? "—" },
              { label: "Created",    value: fmtDateTime(order.createdAt) },
              { label: "Updated",    value: fmtDateTime(order.updatedAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Cancel confirmation */}
      <DeleteConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        resourceName="Order"
        itemLabel={order.orderNumber}
        onConfirm={() => cancel.mutate(undefined, { onSuccess: () => setCancelOpen(false) })}
        isDeleting={cancel.isPending}
      />
    </div>
  );
}
