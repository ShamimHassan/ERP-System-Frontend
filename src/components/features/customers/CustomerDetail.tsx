"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Pencil, Phone, Mail,
  Building2, ArrowLeft, X,
} from "lucide-react";

import { useCustomer } from "./useCustomers";
import CustomerForm from "./CustomerForm";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonList from "@/components/shared/SkeletonList";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { fmtDateTime } from "@/lib/formatters";

const TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual", BUSINESS: "Business", CORPORATE: "Corporate",
  GOVERNMENT: "Government", PARTNER: "Partner",
};

interface CustomerDetailProps {
  id: string;
  defaultEdit?: boolean;
}

export default function CustomerDetail({ id, defaultEdit = false }: CustomerDetailProps) {
  const router = useRouter();
  const { data: customer, isLoading, isError, error } = useCustomer(id);
  const [editMode, setEditMode] = useState(defaultEdit);

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {status === 404 ? "Customer not found." : "Failed to load customer."}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {status === 404 ? "This customer doesn't exist or you don't have access." : "Please try again."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          ← Back to Customers
        </Button>
      </div>
    );
  }

  if (isLoading || !customer) return <div className="p-6"><SkeletonList rows={6} /></div>;

  if (editMode) {
    return (
      <div className="p-6">
        <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
          <Link href="/customers" className="hover:text-slate-900 dark:hover:text-slate-100">Customers</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/customers/${id}`} className="hover:text-slate-900 dark:hover:text-slate-100">
            {customer.contactPerson}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-slate-100">Edit</span>
        </nav>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Edit Customer</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
            <X className="mr-1 h-4 w-4" /> Cancel Edit
          </Button>
        </div>
        <CustomerForm customer={customer} onSuccess={() => setEditMode(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/customers" className="hover:text-slate-900 dark:hover:text-slate-100">Customers</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">{customer.contactPerson}</span>
      </nav>

      {/* ── Header card ── */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              {/* Back to lead link */}
              {customer.convertedFromLeadId && (
                <div>
                  <Link
                    href={`/leads/${customer.convertedFromLeadId}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back to Lead
                  </Link>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {customer.contactPerson}
                </h1>
                <StatusBadge status={customer.status} />
                <Badge variant="outline" className="text-xs">
                  {TYPE_LABELS[customer.customerType] ?? customer.customerType}
                </Badge>
              </div>
              {customer.companyName && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <Building2 className="h-3.5 w-3.5" />
                  {customer.companyName}
                </p>
              )}
              {customer.phone && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="h-3.5 w-3.5" />
                  <a href={`tel:${customer.phone}`} className="hover:text-blue-600 hover:underline">
                    {customer.phone}
                  </a>
                </p>
              )}
              {customer.email && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${customer.email}`} className="hover:text-blue-600 hover:underline">
                    {customer.email}
                  </a>
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditMode(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs defaultValue="details">
        <TabsList className="border-b border-slate-200 bg-transparent dark:border-slate-800">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Details */}
        <TabsContent value="details" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  { label: "Customer Type",    value: TYPE_LABELS[customer.customerType] ?? customer.customerType },
                  { label: "Status",           value: <StatusBadge status={customer.status} /> },
                  { label: "Tax / VAT No.",    value: customer.taxVatNo ?? "—" },
                  { label: "Address",          value: customer.address ?? "—" },
                  { label: "Billing Address",  value: customer.billingAddress ?? "—" },
                  { label: "Manager",          value: customer.manager?.name ?? "—" },
                  { label: "Marketing",        value: customer.marketingPerson?.name ?? "—" },
                  { label: "Created",          value: fmtDateTime(customer.createdAt) },
                  { label: "Updated",          value: fmtDateTime(customer.updatedAt) },
                  ...(customer.convertedFromLeadId ? [
                    {
                      label: "Converted From",
                      value: (
                        <Link
                          href={`/leads/${customer.convertedFromLeadId}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View Lead →
                        </Link>
                      ),
                    },
                  ] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities */}
        <TabsContent value="activities" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Activities</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/activities?customerId=${customer.id}`}>+ Add Activity</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Activities timeline — implemented in Step 15.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities */}
        <TabsContent value="opportunities" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Opportunities</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/opportunities/new?customerId=${customer.id}`}>+ New Opportunity</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Related opportunities — implemented in Step 15.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotations */}
        <TabsContent value="quotations" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Related quotations — implemented in Step 17.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Related orders — implemented in Step 19.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
