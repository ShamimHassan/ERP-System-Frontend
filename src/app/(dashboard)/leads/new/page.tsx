import LeadForm from "@/components/features/leads/LeadForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewLeadPage() {
  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/leads" className="hover:text-slate-900 dark:hover:text-slate-100">Leads</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">New Lead</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        New Lead
      </h1>
      <LeadForm />
    </div>
  );
}
