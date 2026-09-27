import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge — maps every backend enum status to a consistent
 * color-coded badge following the frontend.md spec:
 *
 * NEW=blue, CONTACTED=slate, QUALIFIED=green, WON=emerald,
 * LOST=red, DRAFT=gray, APPROVED=emerald, REJECTED=rose,
 * CANCELLED=red, COMPLETED=green, PENDING=amber, PROCESSING=orange, etc.
 *
 * shadcn/ui's Badge only ships 4 variants (default/secondary/destructive/outline).
 * We extend with Tailwind color overrides via className.
 */

type StatusConfig = {
  label: string;
  className: string;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  // ── Lead statuses ──────────────────────────────────────────────────────
  NEW:         { label: "New",         className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  CONTACTED:   { label: "Contacted",   className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  QUALIFIED:   { label: "Qualified",   className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" },
  PROPOSAL:    { label: "Proposal",    className: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800" },
  NEGOTIATION: { label: "Negotiation", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" },
  WON:         { label: "Won",         className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
  LOST:        { label: "Lost",        className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },

  // ── Quotation statuses ─────────────────────────────────────────────────
  DRAFT:       { label: "Draft",       className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" },
  SENT:        { label: "Sent",        className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  VIEWED:      { label: "Viewed",      className: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800" },
  APPROVED:    { label: "Approved",    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
  REJECTED:    { label: "Rejected",    className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800" },
  EXPIRED:     { label: "Expired",     className: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700" },
  CONVERTED:   { label: "Converted",   className: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800" },

  // ── Order statuses ─────────────────────────────────────────────────────
  CONFIRMED:   { label: "Confirmed",   className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  PROCESSING:  { label: "Processing",  className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800" },
  COMPLETED:   { label: "Completed",   className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" },
  CANCELLED:   { label: "Cancelled",   className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },

  // ── Survey statuses ────────────────────────────────────────────────────
  PENDING:     { label: "Pending",     className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" },
  SCHEDULED:   { label: "Scheduled",   className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },

  // ── Opportunity stages ─────────────────────────────────────────────────
  QUALIFICATION:       { label: "Qualification",       className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  REQUIREMENT_ANALYSIS:{ label: "Requirement Analysis",className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  SURVEY:              { label: "Survey",              className: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800" },
  DECISION:            { label: "Decision",            className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" },

  // ── Generic ────────────────────────────────────────────────────────────
  ACTIVE:      { label: "Active",      className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" },
  INACTIVE:    { label: "Inactive",    className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },

  // ── Priority ───────────────────────────────────────────────────────────
  LOW:         { label: "Low",         className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" },
  MEDIUM:      { label: "Medium",      className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" },
  HIGH:        { label: "High",        className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status];

  if (!config) {
    // Unknown status — render as plain outline badge with raw value
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
