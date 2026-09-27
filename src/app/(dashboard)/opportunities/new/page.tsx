import { Suspense } from "react";
import OpportunityForm from "@/components/features/opportunities/OpportunityForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props { searchParams: { leadId?: string; customerId?: string } }

export default function NewOpportunityPage({ searchParams }: Props) {
  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/opportunities" className="hover:text-slate-900 dark:hover:text-slate-100">Opportunities</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">New Opportunity</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">New Opportunity</h1>
      <Suspense fallback={null}>
        <OpportunityForm prefillLeadId={searchParams.leadId} prefillCustomerId={searchParams.customerId} />
      </Suspense>
    </div>
  );
}
