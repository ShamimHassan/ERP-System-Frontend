"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { createCustomerSchema } from "@/lib/zod-schemas";
import type { z } from "zod";
import { useCreateCustomer, useUpdateCustomer } from "./useCustomers";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CUSTOMER_TYPES } from "@/types/enums";
import type { Customer } from "@/types/api.types";

type CustomerFormData = z.infer<typeof createCustomerSchema>;

const TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual", BUSINESS: "Business", CORPORATE: "Corporate",
  GOVERNMENT: "Government", PARTNER: "Partner",
};

interface CustomerFormProps {
  customer?: Customer;
  /** Pre-fill from lead conversion */
  prefillFromLead?: { contactPerson?: string; companyName?: string; phone?: string; email?: string };
  onSuccess?: () => void;
}

export default function CustomerForm({ customer, prefillFromLead, onSuccess }: CustomerFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!customer;
  const isMarketing = user?.role === "MARKETING";
  const isManager   = user?.role === "MANAGER";

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customer?.id ?? "");

  // Users for assignment (ADMIN/MANAGER)
  const { data: usersData } = useQuery<{ data: { id: string; name: string; role: string }[] }>({
    queryKey: ["users-list"],
    queryFn: () => api.get("/users", { params: { limit: 100 } }) as unknown as Promise<{ data: { id: string; name: string; role: string }[] }>,
    enabled: !isMarketing,
  });

  const marketingUsers = usersData?.data?.filter((u) => u.role === "MARKETING") ?? [];
  const managerUsers   = usersData?.data?.filter((u) => u.role === "MANAGER")   ?? [];

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      customerType:      customer?.customerType       ?? "BUSINESS",
      companyName:       customer?.companyName        ?? prefillFromLead?.companyName ?? "",
      contactPerson:     customer?.contactPerson      ?? prefillFromLead?.contactPerson ?? "",
      phone:             customer?.phone              ?? prefillFromLead?.phone ?? "",
      email:             customer?.email              ?? prefillFromLead?.email ?? "",
      address:           customer?.address            ?? "",
      billingAddress:    customer?.billingAddress     ?? "",
      taxVatNo:          customer?.taxVatNo           ?? "",
      status:            customer?.status             ?? "ACTIVE",
      managerId:         customer?.managerId          ?? (isMarketing ? user?.managerId ?? "" : ""),
      marketingPersonId: customer?.marketingPersonId  ?? (isMarketing ? user?.id ?? "" : ""),
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (isMarketing && user) {
      form.setValue("marketingPersonId", user.id);
      if (user.managerId) form.setValue("managerId", user.managerId);
    }
  }, [isMarketing, user, form]);

  async function onSubmit(values: CustomerFormData) {
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );

    if (isEdit) {
      updateCustomer.mutate(payload, {
        onSuccess: () => { onSuccess?.(); router.push(`/customers/${customer!.id}`); },
      });
    } else {
      createCustomer.mutate(payload, {
        onSuccess: () => { onSuccess?.(); router.push("/customers"); },
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* ── Customer Type + Status ── */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="customerType" render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Type <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CUSTOMER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t] ?? t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ── Contact Info ── */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="contactPerson" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="Mr. John Doe" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl><Input {...field} placeholder="Acme Corp Ltd" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} type="tel" placeholder="01XXXXXXXXX" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input {...field} type="email" placeholder="contact@company.com" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="taxVatNo" render={({ field }) => (
              <FormItem>
                <FormLabel>Tax / VAT No.</FormLabel>
                <FormControl><Input {...field} placeholder="VAT-XXXXXXXX" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ── Address ── */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Physical address" rows={2} disabled={isSubmitting} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="billingAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Address</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Billing address (if different)" rows={2} disabled={isSubmitting} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ── Assignment (ADMIN/MANAGER only) ── */}
        {!isMarketing && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="marketingPersonId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Marketing Person</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {marketingUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
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
                      <SelectContent>
                        {managerUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
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
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? "Save Changes" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
