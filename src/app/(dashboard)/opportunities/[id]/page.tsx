import { Suspense } from "react";
import OpportunityDetail from "@/components/features/opportunities/OpportunityDetail";
import SkeletonList from "@/components/shared/SkeletonList";
interface Props { params: { id: string }; searchParams: { edit?: string } }
export default function OpportunityDetailPage({ params, searchParams }: Props) {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}><OpportunityDetail id={params.id} defaultEdit={searchParams.edit === "true"} /></Suspense>;
}
