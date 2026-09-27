"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { OpportunityStage } from "@/types/enums";

const STAGES: { key: OpportunityStage; label: string; short: string }[] = [
  { key: "QUALIFICATION",        label: "Qualification",        short: "Qual" },
  { key: "REQUIREMENT_ANALYSIS", label: "Requirement Analysis", short: "Req" },
  { key: "SURVEY",               label: "Survey",               short: "Survey" },
  { key: "PROPOSAL",             label: "Proposal",             short: "Prop" },
  { key: "NEGOTIATION",          label: "Negotiation",          short: "Neg" },
  { key: "DECISION",             label: "Decision",             short: "Dec" },
  { key: "WON",                  label: "Won",                  short: "Won" },
  { key: "LOST",                 label: "Lost",                 short: "Lost" },
];

const TERMINAL_STAGES: OpportunityStage[] = ["WON", "LOST"];
const ACTIVE_STAGES = STAGES.filter((s) => !TERMINAL_STAGES.includes(s.key));

interface StageProgressProps {
  currentStage: OpportunityStage;
  onAdvance?: (nextStage: OpportunityStage) => void;
  isUpdating?: boolean;
}

export default function StageProgress({ currentStage, onAdvance, isUpdating }: StageProgressProps) {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);
  const isTerminal = TERMINAL_STAGES.includes(currentStage);

  // Next non-terminal stage
  const nextStage = !isTerminal
    ? ACTIVE_STAGES[ACTIVE_STAGES.findIndex((s) => s.key === currentStage) + 1]?.key ?? null
    : null;

  return (
    <div className="space-y-3">
      {/* Stage dots */}
      <div className="flex items-center">
        {STAGES.map((stage, idx) => {
          const isPast    = idx < currentIdx;
          const isCurrent = stage.key === currentStage;
          const isWon     = stage.key === "WON";
          const isLost    = stage.key === "LOST";
          const isLast    = idx === STAGES.length - 1;

          let dotClass = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors ";
          if (isCurrent && isWon)  dotClass += "border-emerald-500 bg-emerald-500 text-white";
          else if (isCurrent && isLost) dotClass += "border-red-500 bg-red-500 text-white";
          else if (isCurrent)      dotClass += "border-blue-600 bg-blue-600 text-white";
          else if (isPast)         dotClass += "border-slate-300 bg-slate-300 text-white dark:border-slate-600 dark:bg-slate-600";
          else                     dotClass += "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900";

          return (
            <div key={stage.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={dotClass}>
                  {isPast  ? <Check className="h-3.5 w-3.5" /> :
                   isCurrent && isWon  ? <Check className="h-3.5 w-3.5" /> :
                   isCurrent && isLost ? <X className="h-3.5 w-3.5" /> :
                   <span>{idx + 1}</span>}
                </div>
                <span className={cn(
                  "hidden text-[10px] font-medium sm:block",
                  isCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                )}>
                  {stage.short}
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
        })}
      </div>

      {/* Current stage label + advance button */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Current: <span className="font-semibold">{STAGES[currentIdx]?.label}</span>
        </span>

        {onAdvance && !isTerminal && nextStage && (
          <button
            type="button"
            onClick={() => onAdvance(nextStage)}
            disabled={isUpdating}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isUpdating ? "Updating…" : `→ Advance to ${STAGES.find((s) => s.key === nextStage)?.label}`}
          </button>
        )}

        {onAdvance && !isTerminal && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onAdvance("WON")}
              disabled={isUpdating || currentStage === "WON"}
              className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Mark Won ✓
            </button>
            <button
              type="button"
              onClick={() => onAdvance("LOST")}
              disabled={isUpdating || currentStage === "LOST"}
              className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              Mark Lost ✗
            </button>
          </div>
        )}

        {isTerminal && (
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            currentStage === "WON"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          )}>
            {currentStage === "WON" ? "Deal Won 🎉" : "Deal Lost"}
          </span>
        )}
      </div>
    </div>
  );
}
