import { Suspense } from "react";
import SurveyDetail from "@/components/features/surveys/SurveyDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string }> }

export default async function SurveyDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { edit } = await searchParams;
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}>
      <SurveyDetail id={id} defaultEdit={edit === "true"} />
    </Suspense>
  );
}
