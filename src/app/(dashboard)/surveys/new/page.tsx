import SurveyForm from "@/components/features/surveys/SurveyForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
interface Props { searchParams: { opportunityId?: string } }
export default function NewSurveyPage({ searchParams }: Props) {
  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/surveys" className="hover:text-slate-900 dark:hover:text-slate-100">Surveys</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">New Survey</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">New Survey</h1>
      <SurveyForm prefillOpportunityId={searchParams.opportunityId} />
    </div>
  );
}
