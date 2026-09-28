import { Suspense } from "react";
import AuditLogTable from "@/components/features/audit-logs/AuditLogTable";
import SkeletonList from "@/components/shared/SkeletonList";
export default function AuditLogsPage() {
  return <Suspense fallback={<div className="p-6"><SkeletonList rows={8} /></div>}><AuditLogTable /></Suspense>;
}
