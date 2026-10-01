import { Suspense } from "react";
import SurveyList from "@/components/features/surveys/SurveyList";
import SkeletonList from "@/components/shared/SkeletonList";
export default function SurveysPage() {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><SurveyList /></Suspense>;
}
