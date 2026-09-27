import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const BADGE_MAP: Record<string, BadgeVariant> = {
  // Lead statuses
  NEW: "secondary",
  CONTACTED: "outline",
  QUALIFIED: "default",
  PROPOSAL: "outline",
  NEGOTIATION: "secondary",
  WON: "default",
  LOST: "destructive",
  // Quotation statuses
  DRAFT: "secondary",
  SENT: "default",
  VIEWED: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  EXPIRED: "outline",
  CONVERTED: "outline",
  // Order statuses
  CONFIRMED: "default",
  PROCESSING: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
  // Survey statuses
  PENDING: "secondary",
  SCHEDULED: "default",
  // Generic
  ACTIVE: "default",
  INACTIVE: "destructive",
};

const LABEL_MAP: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CONVERTED: "Converted",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
  SCHEDULED: "Scheduled",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variant: BadgeVariant = BADGE_MAP[status] ?? "outline";
  const label = LABEL_MAP[status] ?? status;
  return <Badge variant={variant}>{label}</Badge>;
}
