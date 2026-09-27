import { Suspense } from "react";
import QuotationList from "@/components/features/quotations/QuotationList";
import SkeletonList from "@/components/shared/SkeletonList";
export default function QuotationsPage() {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><QuotationList /></Suspense>;
}
