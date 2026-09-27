import { Suspense } from "react";
import SurveyDetail from "@/components/features/surveys/SurveyDetail";
import SkeletonList from "@/components/shared/SkeletonList";
interface Props { params: { id: string }; searchParams: { edit?: string } }
export default function SurveyDetailPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}>
      <SurveyDetail id={params.id} defaultEdit={searchParams.edit === "true"} />
    </Suspense>
  );
}
