import QuotationForm from "@/components/features/quotations/QuotationForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
interface Props { searchParams: { customerId?: string; opportunityId?: string } }
export default function NewQuotationPage({ searchParams }: Props) {
  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/quotations" className="hover:text-slate-900 dark:hover:text-slate-100">Quotations</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">New Quotation</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">New Quotation</h1>
      <QuotationForm prefillCustomerId={searchParams.customerId} prefillOpportunityId={searchParams.opportunityId} />
    </div>
  );
}
