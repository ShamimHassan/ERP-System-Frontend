"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Pencil, Trash2, Phone, Mail,
  Building2, User, Calendar, TrendingUp, X, Save,
} from "lucide-react";

import { useLead, useDeleteLead } from "./useLeads";
import ConvertLeadButton from "./ConvertLeadButton";
import LeadForm from "./LeadForm";

import StatusBadge from "@/components/shared/StatusBadge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import SkeletonList from "@/components/shared/SkeletonList";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { fmtBDT, fmtDate, fmtDateTime } from "@/lib/formatters";

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website", FACEBOOK: "Facebook", GOOGLE: "Google", PHONE: "Phone",
  EMAIL: "Email", REFERRAL: "Referral", EXISTING_CUSTOMER: "Existing Customer",
  DIGITAL_MARKETING: "Digital Marketing", PARTNER: "Partner", OTHER: "Other",
};

interface LeadDetailProps {
  id: string;
  defaultEdit?: boolean;
}

export default function LeadDetail({ id, defaultEdit = false }: LeadDetailProps) {
  const router = useRouter();
  const { data: lead, isLoading, isError, error } = useLead(id);
  const deleteMutation = useDeleteLead();
  const [editMode, setEditMode] = useState(defaultEdit);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 404 → not-found message
  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {status === 404 ? "Lead not found." : "Failed to load lead."}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {status === 404
            ? "This lead doesn't exist or you don't have access."
            : "Please try again."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/leads")}>
          ← Back to Leads
        </Button>
      </div>
    );
  }

  if (isLoading || !lead) {
    return <div className="p-6"><SkeletonList rows={6} /></div>;
  }

  if (editMode) {
    return (
      <div className="p-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
          <Link href="/leads" className="hover:text-slate-900 dark:hover:text-slate-100">Leads</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/leads/${id}`} className="hover:text-slate-900 dark:hover:text-slate-100">
            {lead.leadName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-slate-100">Edit</span>
        </nav>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Edit Lead</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
            <X className="mr-1 h-4 w-4" /> Cancel Edit
          </Button>
        </div>
        <LeadForm lead={lead} onSuccess={() => setEditMode(false)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/leads" className="hover:text-slate-900 dark:hover:text-slate-100">Leads</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">{lead.leadName}</span>
      </nav>

      {/* ── Header card ── */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Lead name + badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {lead.leadName}
                </h1>
                <StatusBadge status={lead.status} />
                <StatusBadge status={lead.priority} />
              </div>
              <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                {lead.companyName}
              </p>
              {lead.phone && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="h-3.5 w-3.5" />
                  <a href={`tel:${lead.phone}`} className="hover:text-blue-600 hover:underline">
                    {lead.phone}
                  </a>
                </p>
              )}
              {lead.email && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${lead.email}`} className="hover:text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <ConvertLeadButton lead={lead} />
              <Button variant="outline" size="sm" className="gap-1.5"
                onClick={() => setEditMode(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm"
                className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Key metrics row ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        {lead.estimatedValue != null && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Est. Value</p>
                <p className="font-bold text-slate-900 dark:text-slate-50">{fmtBDT(lead.estimatedValue)}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {lead.nextFollowUp && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Next Follow-up</p>
                <p className="font-bold text-slate-900 dark:text-slate-50">{fmtDate(lead.nextFollowUp)}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {lead.marketingPerson && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Assigned To</p>
                <p className="font-bold text-slate-900 dark:text-slate-50">{lead.marketingPerson.name}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="details">
        <TabsList className="border-b border-slate-200 bg-transparent dark:border-slate-800">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
        </TabsList>

        {/* Details tab */}
        <TabsContent value="details" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Lead Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  { label: "Lead Source",    value: SOURCE_LABELS[lead.leadSource] ?? lead.leadSource },
                  { label: "Status",         value: <StatusBadge status={lead.status} /> },
                  { label: "Priority",       value: <StatusBadge status={lead.priority} /> },
                  { label: "Est. Value",     value: lead.estimatedValue != null ? fmtBDT(lead.estimatedValue) : "—" },
                  { label: "Next Follow-up", value: lead.nextFollowUp ? fmtDate(lead.nextFollowUp) : "—" },
                  { label: "Service",        value: lead.service?.name ?? "—" },
                  { label: "Manager",        value: lead.manager?.name ?? "—" },
                  { label: "Marketing",      value: lead.marketingPerson?.name ?? "—" },
                  { label: "Created",        value: fmtDateTime(lead.createdAt) },
                  { label: "Updated",        value: fmtDateTime(lead.updatedAt) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">
                      {value}
                    </dd>
                  </div>
                ))}

                {lead.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Notes
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                      {lead.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities tab */}
        <TabsContent value="activities" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Activities
              </CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/activities?leadId=${lead.id}`}>+ Add Activity</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Activities timeline — implemented in Step 15.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities tab */}
        <TabsContent value="opportunities" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Opportunities
              </CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/opportunities/new?leadId=${lead.id}`}>+ New Opportunity</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Related opportunities — implemented in Step 15.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotations tab */}
        <TabsContent value="quotations" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Quotations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Related quotations — implemented in Step 17.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        resourceName="Lead"
        itemLabel={lead.leadName}
        onConfirm={() =>
          deleteMutation.mutate(lead.id, {
            onSuccess: () => { setDeleteOpen(false); router.push("/leads"); },
          })
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
