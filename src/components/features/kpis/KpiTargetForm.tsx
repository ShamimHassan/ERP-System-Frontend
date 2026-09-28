"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useSetKpiTarget } from "./useKpis";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { METRICS, PERIOD_TYPES } from "@/types/enums";

const METRIC_LABELS: Record<string, string> = {
  NEW_LEADS: "New Leads", QUALIFIED_LEADS: "Qualified Leads", CALLS: "Calls",
  MEETINGS: "Meetings", SURVEYS: "Surveys", FOLLOW_UPS: "Follow-ups",
  QUOTATIONS: "Quotations", WON_DEALS: "Won Deals", NEW_CUSTOMERS: "New Customers",
  REVENUE: "Revenue", COLLECTION: "Collection", CONVERSION_RATE: "Conversion Rate",
};

const schema = z.object({
  userId:      z.string().uuid("Select a user"),
  periodType:  z.enum(PERIOD_TYPES),
  periodStart: z.string().min(1, "Select a period"),
  metric:      z.enum(METRICS),
  targetValue: z.coerce.number().positive("Must be positive"),
});
type FormData = z.infer<typeof schema>;

export default function KpiTargetForm() {
  const user = useAuthStore((s) => s.user);
  const setTarget = useSetKpiTarget();

  const { data: usersData } = useQuery<{ data: { id: string; name: string; role: string }[] }>({
    queryKey: ["users-list"],
    queryFn: () => api.get("/users", { params: { limit: 100 } }) as unknown as Promise<{ data: { id: string; name: string; role: string }[] }>,
  });

  const today = new Date();
  const defaultPeriodStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId:      user?.id ?? "",
      periodType:  "MONTHLY",
      periodStart: defaultPeriodStart,
      metric:      "REVENUE",
      targetValue: 0,
    },
  });

  const { isSubmitting } = form.formState;
  const periodType = form.watch("periodType");

  function onSubmit(values: FormData) {
    // Convert month input to first day of month
    const periodStart = values.periodStart.length === 7
      ? `${values.periodStart}-01`
      : values.periodStart;
    setTarget.mutate({ ...values, periodStart }, { onSuccess: () => form.reset({ ...form.getValues() }) });
  }

  const teamUsers = usersData?.data ?? [];

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Set KPI Target
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" noValidate>
            <FormField control={form.control} name="userId" render={({ field }) => (
              <FormItem>
                <FormLabel>User <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select user…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {teamUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} <span className="text-xs text-slate-400">({u.role})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="metric" render={({ field }) => (
              <FormItem>
                <FormLabel>Metric <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {METRICS.map((m) => (
                      <SelectItem key={m} value={m}>{METRIC_LABELS[m] ?? m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="periodType" render={({ field }) => (
              <FormItem>
                <FormLabel>Period Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {PERIOD_TYPES.map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="periodStart" render={({ field }) => (
              <FormItem>
                <FormLabel>Period Start <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={periodType === "MONTHLY" ? "month" : "date"}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="targetValue" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Value <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step="any"
                    placeholder="e.g. 1200000"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Saving…</>
                ) : "Set Target"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
