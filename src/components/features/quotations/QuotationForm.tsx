"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useCreateQuotation } from "./useQuotations";
import { useAuthStore } from "@/store/auth.store";
import QuotationItemsEditor from "./QuotationItemsEditor";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Customer } from "@/types/api.types";

// Schema matching backend exactly
const formSchema = z.object({
  customerId:     z.string().uuid("Select a customer"),
  opportunityId:  z.string().uuid().optional().or(z.literal("")),
  quotationDate:  z.string().date("Enter a valid date"),
  expiryDate:     z.string().date("Enter a valid date"),
  discountTotal:  z.coerce.number().min(0).default(0),
  taxTotal:       z.coerce.number().min(0).default(0),
  paymentTerms:   z.string().max(500).optional(),
  notes:          z.string().max(2000).optional(),
  managerId:      z.string().uuid().optional(),
  marketingPersonId: z.string().uuid().optional(),
  status:         z.enum(["DRAFT", "SENT"] as const).default("DRAFT"),
  items: z.array(z.object({
    productId: z.string().uuid("Select a product"),
    quantity:  z.coerce.number().int().positive("Must be ≥ 1"),
    unitPrice: z.coerce.number().nonnegative("Must be ≥ 0"),
    discount:  z.coerce.number().min(0).max(100).default(0),
    tax:       z.coerce.number().min(0).max(100).default(0),
  })).min(1, "Add at least one item"),
});

type FormData = z.infer<typeof formSchema>;

interface QuotationFormProps {
  prefillCustomerId?: string;
  prefillOpportunityId?: string;
}

export default function QuotationForm({ prefillCustomerId, prefillOpportunityId }: QuotationFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isMarketing = user?.role === "MARKETING";
  const isManager   = user?.role === "MANAGER";
  const create = useCreateQuotation();

  const { data: customersData } = useQuery<{ data: Customer[] }>({
    queryKey: ["customers-list"],
    queryFn: () => api.get("/customers", { params: { limit: 200 } }) as unknown as Promise<{ data: Customer[] }>,
  });
  const customers = customersData?.data ?? [];

  const { data: usersData } = useQuery<{ data: { id: string; name: string; role: string }[] }>({
    queryKey: ["users-list"],
    queryFn: () => api.get("/users", { params: { limit: 100 } }) as unknown as Promise<{ data: { id: string; name: string; role: string }[] }>,
    enabled: !isMarketing,
  });
  const marketingUsers = usersData?.data?.filter((u) => u.role === "MARKETING") ?? [];
  const managerUsers   = usersData?.data?.filter((u) => u.role === "MANAGER")   ?? [];

  const today    = new Date().toISOString().split("T")[0];
  const plus30   = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId:        prefillCustomerId    ?? "",
      opportunityId:     prefillOpportunityId ?? "",
      quotationDate:     today,
      expiryDate:        plus30,
      discountTotal:     0,
      taxTotal:          0,
      paymentTerms:      "",
      notes:             "",
      status:            "DRAFT",
      managerId:         isMarketing ? (user?.managerId ?? "") : "",
      marketingPersonId: isMarketing ? (user?.id        ?? "") : "",
      items:             [],
    },
  });

  const { isSubmitting } = form.formState;
  const discountTotal = form.watch("discountTotal");
  const taxTotal      = form.watch("taxTotal");

  useEffect(() => {
    if (isMarketing && user) {
      form.setValue("marketingPersonId", user.id);
      if (user.managerId) form.setValue("managerId", user.managerId);
    }
  }, [isMarketing, user, form]);

  function onSubmit(values: FormData) {
    const payload = {
      ...values,
      opportunityId:  values.opportunityId  || null,
      paymentTerms:   values.paymentTerms   || null,
      notes:          values.notes          || null,
      managerId:      values.managerId      || null,
      marketingPersonId: values.marketingPersonId || null,
    };
    create.mutate(payload);
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

          {/* Header */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quotation Header</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="customerId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || !!prefillCustomerId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.contactPerson}{c.companyName ? ` — ${c.companyName}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="opportunityId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity</FormLabel>
                  <FormControl><Input {...field} placeholder="Opportunity UUID (optional)" disabled={isSubmitting || !!prefillOpportunityId} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="quotationDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quotation Date <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} type="date" disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="expiryDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} type="date" disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Net 30 days" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Save as Draft</SelectItem>
                      <SelectItem value="SENT">Send Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="discountTotal" render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Discount (BDT)</FormLabel>
                  <FormControl><Input {...field} type="number" min={0} step="0.01" className="h-9" disabled={isSubmitting} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="taxTotal" render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Tax (BDT)</FormLabel>
                  <FormControl><Input {...field} type="number" min={0} step="0.01" className="h-9" disabled={isSubmitting} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea {...field} rows={2} placeholder="Any notes for the customer…" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <QuotationItemsEditor discountTotal={discountTotal} taxTotal={taxTotal} />
            </CardContent>
          </Card>

          {/* Assignment */}
          {!isMarketing && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assignment</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="marketingPersonId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketing Person</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger></FormControl>
                      <SelectContent>{marketingUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {!isManager && (
                  <FormField control={form.control} name="managerId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger></FormControl>
                        <SelectContent>{managerUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </CardContent>
            </Card>
          )}

          <Separator />
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Creating…</> : "Create Quotation"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
