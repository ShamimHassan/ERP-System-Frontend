import { Suspense } from "react";
import LeadDetail from "@/components/features/leads/LeadDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function LeadDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { edit } = await searchParams;
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}>
      <LeadDetail id={id} defaultEdit={edit === "true"} />
    </Suspense>
  );
}
