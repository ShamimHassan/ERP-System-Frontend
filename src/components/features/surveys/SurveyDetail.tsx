"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, X } from "lucide-react";

import { useSurvey, useUpdateSurvey } from "./useSurveys";
import SurveyForm from "./SurveyForm";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonList from "@/components/shared/SkeletonList";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtBDT, fmtDate, fmtDateTime } from "@/lib/formatters";
import { SURVEY_STATUSES } from "@/types/enums";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled",
};
const STATUS_FLOW: Record<string, string[]> = {
  PENDING:   ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

interface SurveyDetailProps { id: string; defaultEdit?: boolean; }

export default function SurveyDetail({ id, defaultEdit = false }: SurveyDetailProps) {
  const router = useRouter();
  const { data: survey, isLoading, isError, error } = useSurvey(id);
  const updateSurvey = useUpdateSurvey(id);
  const [editMode, setEditMode] = useState(defaultEdit);

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {status === 404 ? "Survey not found." : "Failed to load survey."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/surveys")}>← Back to Surveys</Button>
      </div>
    );
  }

  if (isLoading || !survey) return <div className="p-6"><SkeletonList rows={6} /></div>;

  if (editMode) {
    return (
      <div className="p-6">
        <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
          <Link href="/surveys" className="hover:text-slate-900 dark:hover:text-slate-100">Surveys</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-slate-100">Edit</span>
        </nav>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Edit Survey</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}><X className="mr-1 h-4 w-4" /> Cancel</Button>
        </div>
        <SurveyForm survey={survey} onSuccess={() => setEditMode(false)} />
      </div>
    );
  }

  const nextStatuses = STATUS_FLOW[survey.status] ?? [];

  return (
    <div className="space-y-5 p-6">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/surveys" className="hover:text-slate-900 dark:hover:text-slate-100">Surveys</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">{survey.location}</span>
      </nav>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{survey.location}</h1>
                <StatusBadge status={survey.status} />
              </div>
              {survey.opportunity && (
                <p className="text-sm text-slate-600">
                  Opportunity: <Link href={`/opportunities/${survey.opportunityId}`} className="text-blue-600 hover:underline dark:text-blue-400">{survey.opportunity.name}</Link>
                </p>
              )}
              {survey.customer && (
                <p className="text-sm text-slate-600">Customer: {survey.customer.companyName ?? survey.customer.contactPerson}</p>
              )}
              <p className="text-sm text-slate-600">Survey Date: <span className="font-medium">{fmtDate(survey.surveyDate)}</span></p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {/* Status transition */}
              {nextStatuses.length > 0 && (
                <Select
                  value=""
                  onValueChange={(v) => updateSurvey.mutate({ status: v as typeof SURVEY_STATUSES[number] })}
                >
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="Change status…" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditMode(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details">
        <TabsList className="border-b border-slate-200 bg-transparent dark:border-slate-800">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-4">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  { label: "Status",      value: <StatusBadge status={survey.status} /> },
                  { label: "Budget",      value: survey.budget != null ? fmtBDT(survey.budget) : "—" },
                  { label: "Quantity",    value: survey.quantity ?? "—" },
                  { label: "Assigned To", value: survey.assignedPerson?.name ?? "—" },
                  { label: "Service",     value: survey.service?.name ?? "—" },
                  { label: "Product",     value: survey.product?.name ?? "—" },
                  { label: "Created",     value: fmtDateTime(survey.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
                    <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Requirement</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{survey.requirement}</dd>
                </div>
                {survey.technicalRequirement && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Technical Requirement</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{survey.technicalRequirement}</dd>
                  </div>
                )}
                {survey.result && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Result</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{survey.result}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Activities</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/activities?relatedType=OPPORTUNITY&relatedId=${survey.opportunityId}`}>View Related</Link>
              </Button>
            </CardHeader>
            <CardContent><p className="text-sm text-slate-500">Activities linked via opportunity.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
