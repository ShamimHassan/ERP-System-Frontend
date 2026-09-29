import { Suspense } from "react";
import ActivityDetail from "@/components/features/activities/ActivityDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props { params: Promise<{ id: string }> }

export default async function ActivityDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}>
      <ActivityDetail id={id} />
    </Suspense>
  );
}
