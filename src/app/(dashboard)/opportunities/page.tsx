import { Suspense } from "react";
import OpportunityList from "@/components/features/opportunities/OpportunityList";
import SkeletonList from "@/components/shared/SkeletonList";
export default function OpportunitiesPage() {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><OpportunityList /></Suspense>;
}
