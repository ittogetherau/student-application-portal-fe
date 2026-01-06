import { Badge } from "@/components/ui/badge";
import { APPLICATION_STAGE } from "@/constants/types";
import { cn } from "@/lib/utils";

const STAGE_BADGE_CONFIG: Record<
  APPLICATION_STAGE,
  { label: string; className: string }
> = {
  [APPLICATION_STAGE.DRAFT]: {
    label: "Draft",
    className: "bg-gray-500 hover:bg-gray-600",
  },
  [APPLICATION_STAGE.SUBMITTED]: {
    label: "Submitted",
    className: "bg-blue-500 hover:bg-blue-600",
  },
  [APPLICATION_STAGE.STAFF_REVIEW]: {
    label: "Staff Review",
    className: "bg-amber-500 hover:bg-amber-600",
  },
  [APPLICATION_STAGE.AWAITING_DOCUMENTS]: {
    label: "Awaiting Documents",
    className: "bg-orange-500 hover:bg-orange-600",
  },
  [APPLICATION_STAGE.GS_ASSESSMENT]: {
    label: "GS Assessment",
    className: "bg-cyan-500 hover:bg-cyan-600",
  },
  [APPLICATION_STAGE.OFFER_GENERATED]: {
    label: "Offer Generated",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  [APPLICATION_STAGE.OFFER_ACCEPTED]: {
    label: "Offer Accepted",
    className: "bg-emerald-500 hover:bg-emerald-600",
  },
  [APPLICATION_STAGE.ENROLLED]: {
    label: "Enrolled",
    className: "bg-green-600 hover:bg-green-700",
  },
  [APPLICATION_STAGE.REJECTED]: {
    label: "Rejected",
    className: "bg-red-500 hover:bg-red-600",
  },
  [APPLICATION_STAGE.WITHDRAWN]: {
    label: "Withdrawn",
    className: "bg-slate-500 hover:bg-slate-600",
  },
};

const STAGE_ALIAS_MAP: Record<string, APPLICATION_STAGE> = {
  draft: APPLICATION_STAGE.DRAFT,
  submitted: APPLICATION_STAGE.SUBMITTED,
  under_review: APPLICATION_STAGE.STAFF_REVIEW,
  staff_review: APPLICATION_STAGE.STAFF_REVIEW,
  initial_review: APPLICATION_STAGE.STAFF_REVIEW,
  document_verification: APPLICATION_STAGE.AWAITING_DOCUMENTS,
  awaiting_documents: APPLICATION_STAGE.AWAITING_DOCUMENTS,
  gs_documents_pending: APPLICATION_STAGE.AWAITING_DOCUMENTS,
  gs_assessment: APPLICATION_STAGE.GS_ASSESSMENT,
  gs_interview_scheduled: APPLICATION_STAGE.GS_ASSESSMENT,
  gs_approved: APPLICATION_STAGE.GS_ASSESSMENT,
  offer_sent: APPLICATION_STAGE.OFFER_GENERATED,
  offer_generated: APPLICATION_STAGE.OFFER_GENERATED,
  offer_generation: APPLICATION_STAGE.OFFER_GENERATED,
  offer_acceptance: APPLICATION_STAGE.OFFER_ACCEPTED,
  offer_accepted: APPLICATION_STAGE.OFFER_ACCEPTED,
  fee_payment: APPLICATION_STAGE.OFFER_ACCEPTED,
  fee_payment_pending: APPLICATION_STAGE.OFFER_ACCEPTED,
  coe_generation: APPLICATION_STAGE.ENROLLED,
  coe_issued: APPLICATION_STAGE.ENROLLED,
  enrolled: APPLICATION_STAGE.ENROLLED,
  completed: APPLICATION_STAGE.ENROLLED,
  rejected: APPLICATION_STAGE.REJECTED,
  withdrawn: APPLICATION_STAGE.WITHDRAWN,
};

const normalizeStage = (value: string): APPLICATION_STAGE => {
  const key = value?.toLowerCase();
  return STAGE_ALIAS_MAP[key] ?? APPLICATION_STAGE.DRAFT;
};

interface ApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const stage = normalizeStage(status);
  const config = STAGE_BADGE_CONFIG[stage];

  const label =
    config?.label ??
    (stage ? stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "N/A");

  return (
    <Badge className={cn(config?.className, className)}>
      {label}
    </Badge>
  );
}
