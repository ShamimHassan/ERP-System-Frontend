import { Suspense } from "react";
import ActivityList from "@/components/features/activities/ActivityList";
import SkeletonList from "@/components/shared/SkeletonList";
export default function ActivitiesPage() {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><ActivityList /></Suspense>;
}
