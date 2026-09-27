"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/enums";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "DRAFT",      label: "Draft" },
  { key: "CONFIRMED",  label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED",  label: "Completed" },
];

interface OrderStatusTimelineProps {
  status: OrderStatus;
  onAdvance?: (next: OrderStatus) => void;
  isUpdating?: boolean;
}

const NEXT_STATUS: Record<string, OrderStatus | null> = {
  DRAFT:      "CONFIRMED",
  CONFIRMED:  "PROCESSING",
  PROCESSING: "COMPLETED",
  COMPLETED:  null,
  CANCELLED:  null,
};

export default function OrderStatusTimeline({
  status, onAdvance, isUpdating,
}: OrderStatusTimelineProps) {
  const isCancelled = status === "CANCELLED";
  const currentIdx  = STEPS.findIndex((s) => s.key === status);
  const next        = NEXT_STATUS[status] ?? null;

  return (
    <div className="space-y-3">
      {/* Steps row */}
      <div className="flex items-center">
        {isCancelled ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="font-semibold text-red-600 dark:text-red-400">Cancelled</span>
          </div>
        ) : (
          STEPS.map((step, idx) => {
            const isPast    = idx < currentIdx;
            const isCurrent = step.key === status;
            const isLast    = idx === STEPS.length - 1;

            let dotCls = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ";
            if (isCurrent && step.key === "COMPLETED") dotCls += "border-emerald-500 bg-emerald-500 text-white";
            else if (isCurrent) dotCls += "border-blue-600 bg-blue-600 text-white";
            else if (isPast)    dotCls += "border-slate-300 bg-slate-300 text-white dark:border-slate-600 dark:bg-slate-600";
            else                dotCls += "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900";

            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={dotCls}>
                    {isPast || (isCurrent && step.key === "COMPLETED")
                      ? <Check className="h-4 w-4" />
                      : idx + 1}
                  </div>
                  <span className={cn(
                    "hidden text-[11px] font-medium sm:block",
                    isCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                  )}>
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div className={cn(
                    "mx-1 h-0.5 flex-1",
                    isPast || isCurrent ? "bg-slate-300 dark:bg-slate-600" : "bg-slate-100 dark:bg-slate-800"
                  )} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Advance button */}
      {onAdvance && next && !isCancelled && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Current: <span className="font-semibold">{STEPS.find((s) => s.key === status)?.label ?? status}</span>
          </span>
          <button
            type="button"
            onClick={() => onAdvance(next)}
            disabled={isUpdating}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating…" : `→ Advance to ${STEPS.find((s) => s.key === next)?.label}`}
          </button>
        </div>
      )}

      {status === "COMPLETED" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5" /> Order Completed
        </span>
      )}
    </div>
  );
}
