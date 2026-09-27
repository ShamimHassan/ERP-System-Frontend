"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { z } from "zod";

import { createActivitySchema } from "@/lib/zod-schemas";
import { useCreateActivity } from "./useActivities";
import { useAuthStore } from "@/store/auth.store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ACTIVITY_TYPES } from "@/types/enums";

type ActivityFormData = z.infer<typeof createActivitySchema>;

const RELATED_TYPES = ["LEAD", "CUSTOMER", "OPPORTUNITY"] as const;
const TYPE_LABELS: Record<string, string> = {
  CALL: "Call", MEETING: "Meeting", FOLLOW_UP: "Follow-up",
  SURVEY: "Survey", EMAIL: "Email", DEMO: "Demo", SITE_VISIT: "Site Visit", OTHER: "Other",
};

interface ActivityFormProps {
  prefillRelatedType?: string;
  prefillRelatedId?: string;
  onSuccess?: () => void;
}

export default function ActivityForm({ prefillRelatedType, prefillRelatedId, onSuccess }: ActivityFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createActivity = useCreateActivity();

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      relatedType:   (prefillRelatedType as ActivityFormData["relatedType"]) ?? "LEAD",
      relatedId:     prefillRelatedId ?? "",
      type:          "CALL",
      activityDate:  new Date().toISOString().split("T")[0],
      activityTime:  "",
      outcome:       "",
      nextFollowUp:  "",
      notes:         "",
      status:        "ACTIVE",
      assignedUserId: user?.id ?? "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (user) form.setValue("assignedUserId", user.id);
  }, [user, form]);

  function onSubmit(values: ActivityFormData) {
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );
    createActivity.mutate(payload, { onSuccess: () => { onSuccess?.(); router.back(); } });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Activity Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Type <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t] ?? t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="relatedType" render={({ field }) => (
              <FormItem>
                <FormLabel>Related To <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || !!prefillRelatedType}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {RELATED_TYPES.map((t) => <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="relatedId" render={({ field }) => (
              <FormItem>
                <FormLabel>Related Record ID <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} placeholder="UUID of lead/customer/opportunity" disabled={isSubmitting || !!prefillRelatedId} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="activityDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Date <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} type="date" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="activityTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl><Input {...field} type="time" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
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

            <FormField control={form.control} name="outcome" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Outcome</FormLabel>
                <FormControl><Input {...field} placeholder="Brief outcome of this activity" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea {...field} rows={3} placeholder="Additional notes…" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Creating…</> : "Create Activity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
