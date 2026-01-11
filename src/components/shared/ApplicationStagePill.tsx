import type { DataTableFacetedFilterOption } from "@/components/data-table/data-table";
import { APPLICATION_STAGE } from "@/constants/types";
import { cn } from "@/lib/utils";

const STAGE_PILL_CONFIG: Record<
  APPLICATION_STAGE,
  { label: string; className: string }
> = {
  [APPLICATION_STAGE.DRAFT]: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-100",
  },
  [APPLICATION_STAGE.SUBMITTED]: {
    label: "Submitted",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  },
  [APPLICATION_STAGE.STAFF_REVIEW]: {
    label: "Staff Review",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  },
  [APPLICATION_STAGE.AWAITING_DOCUMENTS]: {
    label: "Awaiting Documents",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
  },
  [APPLICATION_STAGE.GS_ASSESSMENT]: {
    label: "GS Assessment",
    className:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200",
  },
  [APPLICATION_STAGE.OFFER_GENERATED]: {
    label: "Offer Generated",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200",
  },
  [APPLICATION_STAGE.OFFER_ACCEPTED]: {
    label: "Offer Accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  [APPLICATION_STAGE.ENROLLED]: {
    label: "Enrolled",
    className:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
  },
  [APPLICATION_STAGE.REJECTED]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
  },
  [APPLICATION_STAGE.WITHDRAWN]: {
    label: "Withdrawn",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200",
  },
};

const STAGE_ALIAS_MAP: Record<string, APPLICATION_STAGE> = {
  draft: APPLICATION_STAGE.DRAFT,
  submitted: APPLICATION_STAGE.SUBMITTED,
  under_review: APPLICATION_STAGE.STAFF_REVIEW,
  "under review": APPLICATION_STAGE.STAFF_REVIEW,
  staff_review: APPLICATION_STAGE.STAFF_REVIEW,
  initial_review: APPLICATION_STAGE.STAFF_REVIEW,
  document_verification: APPLICATION_STAGE.AWAITING_DOCUMENTS,
  awaiting_documents: APPLICATION_STAGE.AWAITING_DOCUMENTS,
  "awaiting documents": APPLICATION_STAGE.AWAITING_DOCUMENTS,
  gs_documents_pending: APPLICATION_STAGE.AWAITING_DOCUMENTS,
  gs_assessment: APPLICATION_STAGE.GS_ASSESSMENT,
  "gs assessment": APPLICATION_STAGE.GS_ASSESSMENT,
  gs_interview_scheduled: APPLICATION_STAGE.GS_ASSESSMENT,
  gs_approved: APPLICATION_STAGE.GS_ASSESSMENT,
  offer_sent: APPLICATION_STAGE.OFFER_GENERATED,
  offer_generated: APPLICATION_STAGE.OFFER_GENERATED,
  "offer generated": APPLICATION_STAGE.OFFER_GENERATED,
  "offer issued": APPLICATION_STAGE.OFFER_GENERATED,
  offer_generation: APPLICATION_STAGE.OFFER_GENERATED,
  offer_acceptance: APPLICATION_STAGE.OFFER_ACCEPTED,
  offer_accepted: APPLICATION_STAGE.OFFER_ACCEPTED,
  "offer accepted": APPLICATION_STAGE.OFFER_ACCEPTED,
  accepted: APPLICATION_STAGE.OFFER_ACCEPTED,
  fee_payment: APPLICATION_STAGE.OFFER_ACCEPTED,
  fee_payment_pending: APPLICATION_STAGE.OFFER_ACCEPTED,
  coe_generation: APPLICATION_STAGE.ENROLLED,
  coe_issued: APPLICATION_STAGE.ENROLLED,
  enrolled: APPLICATION_STAGE.ENROLLED,
  completed: APPLICATION_STAGE.ENROLLED,
  rejected: APPLICATION_STAGE.REJECTED,
  withdrawn: APPLICATION_STAGE.WITHDRAWN,
};

const STATUS_ALIAS_CONFIG: Record<
  string,
  { stage: APPLICATION_STAGE; label: string }
> = {
  "under review": {
    stage: APPLICATION_STAGE.STAFF_REVIEW,
    label: "Under Review",
  },
  "pending decision": {
    stage: APPLICATION_STAGE.STAFF_REVIEW,
    label: "Pending Decision",
  },
  approved: {
    stage: APPLICATION_STAGE.ENROLLED,
    label: "Approved",
  },
  "offer issued": {
    stage: APPLICATION_STAGE.OFFER_GENERATED,
    label: "Offer Issued",
  },
  "offer generated": {
    stage: APPLICATION_STAGE.OFFER_GENERATED,
    label: "Offer Generated",
  },
  accepted: {
    stage: APPLICATION_STAGE.OFFER_ACCEPTED,
    label: "Accepted",
  },
  rejected: {
    stage: APPLICATION_STAGE.REJECTED,
    label: "Rejected",
  },
  waitlisted: {
    stage: APPLICATION_STAGE.GS_ASSESSMENT,
    label: "Waitlisted",
  },
  withdrawn: {
    stage: APPLICATION_STAGE.WITHDRAWN,
    label: "Withdrawn",
  },
  submitted: {
    stage: APPLICATION_STAGE.SUBMITTED,
    label: "Submitted",
  },
  draft: {
    stage: APPLICATION_STAGE.DRAFT,
    label: "Draft",
  },
};

const normalizeStage = (
  value?: APPLICATION_STAGE | string | null
): APPLICATION_STAGE | null => {
  if (!value) return null;
  if (Object.values(APPLICATION_STAGE).includes(value as APPLICATION_STAGE)) {
    return value as APPLICATION_STAGE;
  }
  const key = String(value).toLowerCase();
  return STAGE_ALIAS_MAP[key] ?? null;
};

export const applicationStageFilterOptions: DataTableFacetedFilterOption[] =
  Object.entries(STAGE_PILL_CONFIG).map(([stage, config]) => ({
    value: stage,
    label: config.label,
  }));

interface ApplicationStagePillProps {
  stage?: APPLICATION_STAGE | string | null;
  className?: string;
}

export function ApplicationStagePill({
  stage,
  className,
}: ApplicationStagePillProps) {
  const key = stage ? String(stage).toLowerCase() : "";
  const alias = key ? STATUS_ALIAS_CONFIG[key] : undefined;
  const normalizedStage = alias?.stage ?? normalizeStage(stage);
  const config = normalizedStage ? STAGE_PILL_CONFIG[normalizedStage] : null;
  const label =
    alias?.label ?? config?.label ?? (stage ? String(stage) : "N/A");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config?.className,
        className
      )}
    >
      {label}
    </span>
  );
}
