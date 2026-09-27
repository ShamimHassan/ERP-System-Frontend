import { Suspense } from "react";
import OrderDetail from "@/components/features/orders/OrderDetail";
import SkeletonList from "@/components/shared/SkeletonList";
interface Props { params: { id: string } }
export default function OrderDetailPage({ params }: Props) {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><OrderDetail id={params.id} /></Suspense>;
}
