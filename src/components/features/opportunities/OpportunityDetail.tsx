"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, X } from "lucide-react";

import { useOpportunity, useUpdateOpportunity } from "./useOpportunities";
import OpportunityForm from "./OpportunityForm";
import StageProgress from "./StageProgress";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonList from "@/components/shared/SkeletonList";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtBDT, fmtDate, fmtDateTime } from "@/lib/formatters";
import type { OpportunityStage } from "@/types/enums";

interface OpportunityDetailProps { id: string; defaultEdit?: boolean; }

export default function OpportunityDetail({ id, defaultEdit = false }: OpportunityDetailProps) {
  const router = useRouter();
  const { data: opp, isLoading, isError, error } = useOpportunity(id);
  const updateOpp = useUpdateOpportunity(id);
  const [editMode, setEditMode] = useState(defaultEdit);

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {status === 404 ? "Opportunity not found." : "Failed to load opportunity."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/opportunities")}>← Back to Opportunities</Button>
      </div>
    );
  }

  if (isLoading || !opp) return <div className="p-6"><SkeletonList rows={6} /></div>;

  if (editMode) {
    return (
      <div className="p-6">
        <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
          <Link href="/opportunities" className="hover:text-slate-900 dark:hover:text-slate-100">Opportunities</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-slate-100">Edit</span>
        </nav>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Edit Opportunity</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}><X className="mr-1 h-4 w-4" /> Cancel</Button>
        </div>
        <OpportunityForm opportunity={opp} onSuccess={() => setEditMode(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/opportunities" className="hover:text-slate-900 dark:hover:text-slate-100">Opportunities</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">{opp.name}</span>
      </nav>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{opp.name}</h1>
                <StatusBadge status={opp.stage} />
              </div>
              {opp.lead && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Lead: <Link href={`/leads/${opp.leadId}`} className="text-blue-600 hover:underline dark:text-blue-400">{opp.lead.leadName}</Link>
                </p>
              )}
              {opp.customer && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Customer: <Link href={`/customers/${opp.customerId}`} className="text-blue-600 hover:underline dark:text-blue-400">{opp.customer.companyName ?? opp.customer.contactPerson}</Link>
                </p>
              )}
              {opp.estimatedValue != null && (
                <p className="text-sm text-slate-600 dark:text-slate-400">Value: <span className="font-semibold text-slate-900 dark:text-slate-50">{fmtBDT(opp.estimatedValue)}</span></p>
              )}
              {opp.expectedClosingDate && (
                <p className="text-sm text-slate-600 dark:text-slate-400">Close by: <span className="font-medium">{fmtDate(opp.expectedClosingDate)}</span></p>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setEditMode(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stage Progress */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stage Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <StageProgress
            currentStage={opp.stage}
            isUpdating={updateOpp.isPending}
            onAdvance={(nextStage) => updateOpp.mutate({ stage: nextStage as OpportunityStage })}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="border-b border-slate-200 bg-transparent dark:border-slate-800">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-4">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  { label: "Stage",          value: <StatusBadge status={opp.stage} /> },
                  { label: "Service",        value: opp.service?.name ?? "—" },
                  { label: "Product",        value: opp.product?.name ?? "—" },
                  { label: "Est. Value",     value: opp.estimatedValue != null ? fmtBDT(opp.estimatedValue) : "—" },
                  { label: "Closing Date",   value: opp.expectedClosingDate ? fmtDate(opp.expectedClosingDate) : "—" },
                  { label: "Manager",        value: opp.manager?.name ?? "—" },
                  { label: "Marketing",      value: opp.marketingPerson?.name ?? "—" },
                  { label: "Created",        value: fmtDateTime(opp.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
                    <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value}</dd>
                  </div>
                ))}
                {opp.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{opp.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Surveys</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/surveys/new?opportunityId=${opp.id}`}>+ New Survey</Link>
              </Button>
            </CardHeader>
            <CardContent><p className="text-sm text-slate-500">Surveys — implemented in Step 15.</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Activities</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/activities?relatedType=OPPORTUNITY&relatedId=${opp.id}`}>+ Add Activity</Link>
              </Button>
            </CardHeader>
            <CardContent><p className="text-sm text-slate-500">Activities — rendered from Activity list.</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Quotations</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-slate-500">Related quotations — Step 17.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
