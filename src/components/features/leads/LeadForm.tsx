"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { createLeadSchema, type CreateLeadFormData } from "@/lib/zod-schemas";
import { useCreateLead, useUpdateLead } from "./useLeads";
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

import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES } from "@/types/enums";
import type { Lead } from "@/types/api.types";

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website", FACEBOOK: "Facebook", GOOGLE: "Google", PHONE: "Phone",
  EMAIL: "Email", REFERRAL: "Referral", EXISTING_CUSTOMER: "Existing Customer",
  DIGITAL_MARKETING: "Digital Marketing", PARTNER: "Partner", OTHER: "Other",
};

interface LeadFormProps {
  /** Provide for edit mode */
  lead?: Lead;
  onSuccess?: () => void;
}

export default function LeadForm({ lead, onSuccess }: LeadFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!lead;
  const isMarketing = user?.role === "MARKETING";
  const isManager  = user?.role === "MANAGER";

  const createLead = useCreateLead();
  const updateLead = useUpdateLead(lead?.id ?? "");

  // ── Cascading selects data ────────────────────────────────────────────
  const { data: services } = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ["services-list"],
    queryFn: () => api.get("/services", { params: { limit: 100 } }) as unknown as Promise<{ data: { id: string; name: string }[] }>,
  });

  // ── Assignable users (for ADMIN/MANAGER roles) ────────────────────────
  const { data: usersData } = useQuery<{ data: { id: string; name: string; role: string; managerId?: string }[] }>({
    queryKey: ["users-list"],
    queryFn: () => api.get("/users", { params: { limit: 100 } }) as unknown as Promise<{ data: { id: string; name: string; role: string; managerId?: string }[] }>,
    enabled: !isMarketing, // MARKETING users don't need this
  });

  const marketingUsers = usersData?.data?.filter((u) => u.role === "MARKETING") ?? [];
  const managerUsers   = usersData?.data?.filter((u) => u.role === "MANAGER")   ?? [];

  // ── Form ──────────────────────────────────────────────────────────────
  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema) as never,
    defaultValues: {
      leadName:          lead?.leadName          ?? "",
      companyName:       lead?.companyName        ?? "",
      phone:             lead?.phone              ?? "",
      email:             lead?.email              ?? "",
      leadSource:        lead?.leadSource         ?? undefined,
      priority:          lead?.priority           ?? "MEDIUM",
      status:            lead?.status             ?? "NEW",
      estimatedValue:    lead?.estimatedValue     ?? undefined,
      nextFollowUp:      lead?.nextFollowUp       ? lead.nextFollowUp.split("T")[0] : "",
      notes:             lead?.notes              ?? "",
      managerId:         lead?.managerId          ?? (isMarketing ? user?.managerId ?? "" : ""),
      marketingPersonId: lead?.marketingPersonId  ?? (isMarketing ? user?.id       ?? "" : ""),
    },
  });

  const { isSubmitting } = form.formState;

  // Auto-set marketing fields for MARKETING role
  useEffect(() => {
    if (isMarketing && user) {
      form.setValue("marketingPersonId", user.id);
      if (user.managerId) form.setValue("managerId", user.managerId);
    }
  }, [isMarketing, user, form]);

  async function onSubmit(values: CreateLeadFormData) {
    // Clean empty strings → undefined
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined)
    );

    if (isEdit) {
      updateLead.mutate(payload, { onSuccess: () => { onSuccess?.(); router.push(`/leads/${lead!.id}`); } });
    } else {
      createLead.mutate(payload, { onSuccess: () => { onSuccess?.(); router.push("/leads"); } });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* ── Basic Info ── */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="leadName" render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Name <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="e.g. Acme Corp" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="e.g. Acme Corp Ltd" disabled={isSubmitting} /></FormControl>
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
                <FormControl><Input {...field} type="email" placeholder="contact@company.com" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="leadSource" render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {LEAD_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>{SOURCE_LABELS[s] ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="estimatedValue" render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Value (BDT)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    placeholder="e.g. 50000"
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ── Status & Priority ── */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Status & Priority
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="priority" render={({ field }) => (
              <FormItem>
                <FormLabel>Priority <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="nextFollowUp" render={({ field }) => (
              <FormItem>
                <FormLabel>Next Follow-up</FormLabel>
                <FormControl><Input {...field} type="date" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ── Service (optional) ── */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Service (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {/* serviceId is valid in the Lead API but not in the Zod schema — use uncontrolled */}
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select
                onValueChange={(v) => (form.setValue as (name: string, value: unknown) => void)("serviceId", v === "__none__" ? "" : v)}
                value={((form.watch as (name: string) => unknown)("serviceId") as string) ?? ""}
                disabled={isSubmitting}
              >
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {(services?.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </CardContent>
        </Card>

        {/* ── Assignment (role-gated) ── */}
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
                    <FormControl><SelectTrigger><SelectValue placeholder="Select marketing person" /></SelectTrigger></FormControl>
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

        {/* ── Notes ── */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Any additional notes about this lead…"
                    rows={4}
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : (
              isEdit ? "Save Changes" : "Create Lead"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

