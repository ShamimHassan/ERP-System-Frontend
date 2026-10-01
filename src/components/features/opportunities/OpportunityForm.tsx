"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { createOpportunitySchema } from "@/lib/zod-schemas";
import { useCreateOpportunity, useUpdateOpportunity } from "./useOpportunities";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { OPPORTUNITY_STAGES } from "@/types/enums";
import type { Opportunity } from "@/types/api.types";

type OpportunityFormData = z.infer<typeof createOpportunitySchema>;

const STAGE_LABELS: Record<string, string> = {
  QUALIFICATION: "Qualification", REQUIREMENT_ANALYSIS: "Requirement Analysis",
  SURVEY: "Survey", PROPOSAL: "Proposal", NEGOTIATION: "Negotiation",
  DECISION: "Decision", WON: "Won", LOST: "Lost",
};

interface OpportunityFormProps {
  opportunity?: Opportunity;
  /** Pre-fill leadId from lead detail page */
  prefillLeadId?: string;
  /** Pre-fill customerId from customer detail page */
  prefillCustomerId?: string;
  onSuccess?: () => void;
}

export default function OpportunityForm({ opportunity, prefillLeadId, prefillCustomerId, onSuccess }: OpportunityFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!opportunity;
  const isMarketing = user?.role === "MARKETING";
  const isManager   = user?.role === "MANAGER";

  const createOpp = useCreateOpportunity();
  const updateOpp = useUpdateOpportunity(opportunity?.id ?? "");

  const { data: usersData } = useQuery<{ data: { id: string; name: string; role: string }[] }>({
    queryKey: ["users-list"],
    queryFn: async () => {
      const res = await api.get("/users", { params: { limit: 100 } }) as unknown;
      if (res && typeof res === "object" && "data" in (res as object)) return res as { data: { id: string; name: string; role: string }[] };
      if (Array.isArray(res)) return { data: res as { id: string; name: string; role: string }[] };
      return res as { data: { id: string; name: string; role: string }[] };
    },
    enabled: !isMarketing && !!user,
    staleTime: 5 * 60_000,
  });
  const marketingUsers = usersData?.data?.filter((u) => u.role === "MARKETING") ?? [];
  const managerUsers   = usersData?.data?.filter((u) => u.role === "MANAGER")   ?? [];

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(createOpportunitySchema) as never,
    defaultValues: {
      name:                opportunity?.name                ?? "",
      leadId:              opportunity?.leadId              ?? prefillLeadId     ?? "",
      customerId:          opportunity?.customerId          ?? prefillCustomerId ?? "",
      stage:               opportunity?.stage               ?? "QUALIFICATION",
      estimatedValue:      opportunity?.estimatedValue      ?? undefined,
      expectedClosingDate: opportunity?.expectedClosingDate ? opportunity.expectedClosingDate.split("T")[0] : "",
      notes:               opportunity?.notes               ?? "",
      managerId:           opportunity?.managerId           ?? (isMarketing ? user?.managerId ?? "" : ""),
      marketingPersonId:   opportunity?.marketingPersonId   ?? (isMarketing ? user?.id       ?? "" : ""),
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (isMarketing && user) {
      form.setValue("marketingPersonId", user.id);
      if (user.managerId) form.setValue("managerId", user.managerId);
    }
  }, [isMarketing, user, form]);

  function onSubmit(values: OpportunityFormData) {
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );
    if (isEdit) {
      updateOpp.mutate(payload, { onSuccess: () => { onSuccess?.(); router.push(`/opportunities/${opportunity!.id}`); } });
    } else {
      createOpp.mutate(payload, { onSuccess: () => { onSuccess?.(); router.push("/opportunities"); } });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Basic Info</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Opportunity Name <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="e.g. GreenField ERP Implementation" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="stage" render={({ field }) => (
              <FormItem>
                <FormLabel>Stage <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {OPPORTUNITY_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{STAGE_LABELS[s] ?? s}</SelectItem>
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
                  <Input {...field} type="number" min={0} placeholder="50000" disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="expectedClosingDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Closing Date</FormLabel>
                <FormControl><Input {...field} type="date" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notes</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormControl><Textarea {...field} placeholder="Additional notes…" rows={3} disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {!isMarketing && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assignment</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="marketingPersonId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Marketing Person</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {marketingUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
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
                        {managerUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
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
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{isEdit ? "Saving…" : "Creating…"}</> : isEdit ? "Save Changes" : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
