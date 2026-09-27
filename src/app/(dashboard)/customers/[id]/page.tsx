import { Suspense } from "react";
import CustomerDetail from "@/components/features/customers/CustomerDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props {
  params: { id: string };
  searchParams: { edit?: string };
}

export default function CustomerDetailPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}>
      <CustomerDetail id={params.id} defaultEdit={searchParams.edit === "true"} />
    </Suspense>
  );
}
