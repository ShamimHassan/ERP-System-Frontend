import { Suspense } from "react";
import UsersList from "@/components/features/users/UsersList";
import SkeletonList from "@/components/shared/SkeletonList";
export default function UsersPage() {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><UsersList /></Suspense>;
}
