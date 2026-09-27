import ActivityForm from "@/components/features/activities/ActivityForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
interface Props { searchParams: { relatedType?: string; relatedId?: string } }
export default function NewActivityPage({ searchParams }: Props) {
  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/activities" className="hover:text-slate-900 dark:hover:text-slate-100">Activities</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-100">New Activity</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">New Activity</h1>
      <ActivityForm prefillRelatedType={searchParams.relatedType} prefillRelatedId={searchParams.relatedId} />
    </div>
  );
}
