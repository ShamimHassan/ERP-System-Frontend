import { Suspense } from "react";
import OrderList from "@/components/features/orders/OrderList";
import SkeletonList from "@/components/shared/SkeletonList";
export default function OrdersPage() {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><OrderList /></Suspense>;
}
