"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { z } from "zod";

import { createSurveySchema } from "@/lib/zod-schemas";
import { useCreateSurvey, useUpdateSurvey } from "./useSurveys";
import { useAuthStore } from "@/store/auth.store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SURVEY_STATUSES } from "@/types/enums";
import type { Survey } from "@/types/api.types";

type SurveyFormData = z.infer<typeof createSurveySchema>;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

interface SurveyFormProps {
  survey?: Survey;
  prefillOpportunityId?: string;
  onSuccess?: () => void;
}

export default function SurveyForm({ survey, prefillOpportunityId, onSuccess }: SurveyFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!survey;
  const create = useCreateSurvey();
  const update = useUpdateSurvey(survey?.id ?? "");

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      opportunityId:        survey?.opportunityId        ?? prefillOpportunityId ?? "",
      location:             survey?.location             ?? "",
      requirement:          survey?.requirement          ?? "",
      technicalRequirement: survey?.technicalRequirement ?? "",
      quantity:             survey?.quantity             ?? undefined,
      budget:               survey?.budget               ?? undefined,
      surveyDate:           survey?.surveyDate           ? survey.surveyDate.split("T")[0] : "",
      result:               survey?.result               ?? "",
      notes:                survey?.notes                ?? "",
      status:               survey?.status               ?? "PENDING",
      assignedPersonId:     survey?.assignedPersonId     ?? user?.id ?? "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (user && !survey) form.setValue("assignedPersonId", user.id);
  }, [user, survey, form]);

  function onSubmit(values: SurveyFormData) {
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );
    if (isEdit) {
      update.mutate(payload, { onSuccess: () => { onSuccess?.(); router.push(`/surveys/${survey!.id}`); } });
    } else {
      create.mutate(payload, { onSuccess: () => { onSuccess?.(); router.push("/surveys"); } });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Survey Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="opportunityId" render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity ID <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Opportunity UUID" disabled={isSubmitting || !!prefillOpportunityId} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="surveyDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Survey Date <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} type="date" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} placeholder="Survey location address" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SURVEY_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="quantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={1} placeholder="e.g. 5" disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="budget" render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (BDT)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} placeholder="e.g. 50000" disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="requirement" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Requirement <span className="text-red-500">*</span></FormLabel>
                <FormControl><Textarea {...field} rows={3} placeholder="Client requirements…" disabled={isSubmitting} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="technicalRequirement" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Technical Requirements</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Technical specs…" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="result" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Result / Findings</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Survey findings…" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Additional notes…" disabled={isSubmitting} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{isEdit ? "Saving…" : "Creating…"}</> : isEdit ? "Save Changes" : "Create Survey"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
