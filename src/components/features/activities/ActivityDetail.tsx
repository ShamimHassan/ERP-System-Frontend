"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Calendar, Clock, User, Tag, FileText, AlarmClock } from "lucide-react";
import { useActivity } from "./useActivities";
import { useAuthStore } from "@/store/auth.store";
import { can } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import { fmtDate } from "@/lib/formatters";

const TYPE_LABELS: Record<string, string> = {
  CALL: "Call", MEETING: "Meeting", FOLLOW_UP: "Follow-up",
  SURVEY: "Survey", EMAIL: "Email", DEMO: "Demo", SITE_VISIT: "Site Visit", OTHER: "Other",
};

interface Props { id: string }

function DetailRow({ label, value, icon: Icon }: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <div className="mt-0.5 text-sm text-slate-900 dark:text-slate-50">{value ?? <span className="text-slate-400">—</span>}</div>
      </div>
    </div>
  );
}

export default function ActivityDetail({ id }: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canEdit = can.createService((user?.role as Role) ?? "MARKETING");

  const { data: activity, isLoading, isError } = useActivity(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Activity not found or failed to load.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {TYPE_LABELS[activity.type] ?? activity.type} Activity
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {fmtDate(activity.activityDate)}
              {activity.activityTime ? ` · ${activity.activityTime}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={activity.status} />
        </div>
      </div>

      {/* Details card */}
      <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Activity Details
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800 p-0 px-4">
          <DetailRow label="Type" icon={Tag}
            value={
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {TYPE_LABELS[activity.type] ?? activity.type}
              </span>
            }
          />
          <DetailRow label="Date" icon={Calendar} value={fmtDate(activity.activityDate)} />
          {activity.activityTime && (
            <DetailRow label="Time" icon={Clock} value={activity.activityTime} />
          )}
          <DetailRow label="Related To" icon={Tag}
            value={`${activity.relatedType} · ${activity.relatedId}`}
          />
          <DetailRow label="Assigned To" icon={User}
            value={activity.assignedUser?.name}
          />
          {activity.nextFollowUp && (
            <DetailRow label="Next Follow-up" icon={AlarmClock}
              value={fmtDate(activity.nextFollowUp)}
            />
          )}
          {activity.outcome && (
            <DetailRow label="Outcome" icon={FileText} value={activity.outcome} />
          )}
          {activity.notes && (
            <DetailRow label="Notes" icon={FileText} value={
              <p className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-400">
                {activity.notes}
              </p>
            } />
          )}
        </CardContent>
      </Card>

      {/* Back button */}
      <Button variant="outline" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to Activities
      </Button>
    </div>
  );
}
