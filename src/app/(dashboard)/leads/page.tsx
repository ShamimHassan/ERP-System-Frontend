import { Suspense } from "react";
import LeadList from "@/components/features/leads/LeadList";
import SkeletonList from "@/components/shared/SkeletonList";

export default function LeadsPage() {
  return (
    // Suspense needed for useSearchParams inside LeadList
    <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}>
      <LeadList />
    </Suspense>
  );
}
