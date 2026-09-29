import { Suspense } from "react";
import OrderDetail from "@/components/features/orders/OrderDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}>
      <OrderDetail id={id} />
    </Suspense>
  );
}
