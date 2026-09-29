import { Suspense } from "react";
import QuotationDetail from "@/components/features/quotations/QuotationDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props { params: Promise<{ id: string }> }

export default async function QuotationDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}>
      <QuotationDetail id={id} />
    </Suspense>
  );
}
