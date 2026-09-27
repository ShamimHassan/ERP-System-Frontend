"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, AlertTriangle } from "lucide-react";

import { useQuotation } from "./useQuotations";
import ApprovalActions from "./ApprovalActions";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonList from "@/components/shared/SkeletonList";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fmtBDT, fmtDate, fmtDateTime } from "@/lib/formatters";

const BILLING_LABELS: Record<string, string> = {
  MONTHLY: "Monthly", QUARTERLY: "Quarterly", YEARLY: "Yearly", ONE_TIME: "One-time",
};

interface QuotationDetailProps { id: string }

export default function QuotationDetail({ id }: QuotationDetailProps) {
  const router = useRouter();
  const { data: quotation, isLoading, isError, error } = useQuotation(id);

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {status === 404 ? "Quotation not found." : "Failed to load quotation."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/quotations")}>← Back</Button>
      </div>
    );
  }

  if (isLoading || !quotation) return <div className="p-6"><SkeletonList rows={8} /></div>;

  const subtotal = quotation.items.reduce((s, it) => s + Number(it.lineTotal), 0);

  return (
    <div className="space-y-5 p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/quotations" className="hover:text-slate-900 dark:hover:text-slate-100">Quotations</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-mono text-slate-900 dark:text-slate-100">{quotation.quotationNumber}</span>
      </nav>

      {/* Header */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-50">{quotation.quotationNumber}</h1>
                <StatusBadge status={quotation.status} />
              </div>
              {quotation.customer && (
                <div>
                  <Link href={`/customers/${quotation.customerId}`} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {quotation.customer.contactPerson}{quotation.customer.companyName ? ` — ${quotation.customer.companyName}` : ""}
                  </Link>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span>Date: <strong>{fmtDate(quotation.quotationDate)}</strong></span>
                <span>Expires: <strong>{fmtDate(quotation.expiryDate)}</strong></span>
                {quotation.paymentTerms && <span>Terms: <strong>{quotation.paymentTerms}</strong></span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{fmtBDT(Number(quotation.grandTotal))}</p>
              <ApprovalActions quotation={quotation} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
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
                {quotation.items.map((item, i) => {
                  const unitPrice  = Number(item.unitPrice);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                        {item.product?.name ?? item.productId}
                        {item.product?.unit && <span className="ml-1 text-xs text-slate-400">({item.product.unit})</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{fmtBDT(unitPrice)}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-500">{Number(item.discount)}%</td>
                      <td className="px-4 py-3 text-slate-500">{Number(item.tax)}%</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{fmtBDT(Number(item.lineTotal))}</td>
                    </tr>
                  );
                })}
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
              {Number(quotation.discountTotal) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span>− {fmtBDT(Number(quotation.discountTotal))}</span>
                </div>
              )}
              {Number(quotation.taxTotal) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax</span>
                  <span>+ {fmtBDT(Number(quotation.taxTotal))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-50">
                <span>Grand Total</span>
                <span>{fmtBDT(Number(quotation.grandTotal))}</span>
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
              { label: "Status",       value: <StatusBadge status={quotation.status} /> },
              { label: "Marketing",    value: quotation.marketingPerson?.name ?? "—" },
              { label: "Manager",      value: quotation.manager?.name ?? "—" },
              { label: "Opportunity",  value: quotation.opportunityId ? (
                <Link href={`/opportunities/${quotation.opportunityId}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  {quotation.opportunity?.name ?? "View →"}
                </Link>
              ) : "—" },
              { label: "Created",      value: fmtDateTime(quotation.createdAt) },
              { label: "Updated",      value: fmtDateTime(quotation.updatedAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value}</dd>
              </div>
            ))}
            {quotation.notes && (
              <div className="sm:col-span-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{quotation.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
