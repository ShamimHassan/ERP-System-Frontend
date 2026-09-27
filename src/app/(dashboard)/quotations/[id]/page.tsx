import { Suspense } from "react";
import QuotationDetail from "@/components/features/quotations/QuotationDetail";
import SkeletonList from "@/components/shared/SkeletonList";
interface Props { params: { id: string } }
export default function QuotationDetailPage({ params }: Props) {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><QuotationDetail id={params.id} /></Suspense>;
}
