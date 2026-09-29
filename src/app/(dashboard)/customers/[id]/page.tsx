import { Suspense } from "react";
import CustomerDetail from "@/components/features/customers/CustomerDetail";
import SkeletonList from "@/components/shared/SkeletonList";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function CustomerDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { edit } = await searchParams;
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList rows={6} /></div>}>
      <CustomerDetail id={id} defaultEdit={edit === "true"} />
    </Suspense>
  );
}
