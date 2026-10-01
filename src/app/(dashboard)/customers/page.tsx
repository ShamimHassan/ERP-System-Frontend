import { Suspense } from "react";
import CustomerList from "@/components/features/customers/CustomerList";
import SkeletonList from "@/components/shared/SkeletonList";

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}>
      <CustomerList />
    </Suspense>
  );
}
