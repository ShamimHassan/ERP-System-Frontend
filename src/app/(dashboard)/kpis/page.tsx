"use client";

import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import KpiTable from "@/components/features/kpis/KpiTable";
import KpiTargetForm from "@/components/features/kpis/KpiTargetForm";
import { Separator } from "@/components/ui/separator";

export default function KpisPage() {
  const user = useAuthStore((s) => s.user);
  const canSetTargets = can.setKpiTargets((user?.role as Role) ?? "MARKETING");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">KPIs</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track target vs. achievement metrics for the selected period.
          {canSetTargets && " Click any target value to edit inline, or use the form below."}
        </p>
      </div>

      {/* KPI Table — shows current user's metrics by default */}
      <KpiTable />

      {/* Set Target Form — ADMIN/MANAGER only */}
      {canSetTargets && (
        <>
          <Separator />
          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-200">Set Target</h2>
            <KpiTargetForm />
          </div>
        </>
      )}
    </div>
  );
}
