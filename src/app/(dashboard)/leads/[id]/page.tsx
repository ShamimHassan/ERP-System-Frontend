import { Suspense } from "react";
import LeadDetail from "@/components/features/leads/LeadDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props {
  params: { id: string };
  searchParams: { edit?: string };
}

export default function LeadDetailPage({ params, searchParams }: Props) {
  const defaultEdit = searchParams.edit === "true";
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}>
      <LeadDetail id={params.id} defaultEdit={defaultEdit} />
    </Suspense>
  );
}
