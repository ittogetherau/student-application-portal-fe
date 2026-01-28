import { APPLICATION_STAGE, USER_ROLE } from "@/constants/types";

export const STAGE_PILL_CONFIG: Record<
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
  [APPLICATION_STAGE.IN_REVIEW]: {
    label: "In Review",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  },
  [APPLICATION_STAGE.OFFER_LETTER]: {
    label: "Offer Letter",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
  },
  [APPLICATION_STAGE.GS_ASSESSMENT]: {
    label: "GS Assessment",
    className:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200",
  },
  [APPLICATION_STAGE.COE_ISSUED]: {
    label: "COE Issued",
    className:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200",
  },
  [APPLICATION_STAGE.ACCEPTED]: {
    label: "Accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  [APPLICATION_STAGE.REJECTED]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
  },
};

export const ROLE_STATUS_LABELS: Record<
  APPLICATION_STAGE,
  { agent: string; staff: string }
> = {
  [APPLICATION_STAGE.DRAFT]: {
    agent: "Draft",
    staff: "Draft",
  },
  [APPLICATION_STAGE.SUBMITTED]: {
    agent: "Application Submitted",
    staff: "Application Received",
  },
  [APPLICATION_STAGE.IN_REVIEW]: {
    agent: "Application Under Review",
    staff: "Application Under Review",
  },
  [APPLICATION_STAGE.OFFER_LETTER]: {
    agent: "Sign Offer Letter",
    staff: "Awaiting Signatures",
  },
  [APPLICATION_STAGE.GS_ASSESSMENT]: {
    agent: "GS Process",
    staff: "GS Process",
  },
  [APPLICATION_STAGE.COE_ISSUED]: {
    agent: "COE Issued",
    staff: "COE Issued",
  },
  [APPLICATION_STAGE.ACCEPTED]: {
    agent: "Accepted",
    staff: "Accepted",
  },
  [APPLICATION_STAGE.REJECTED]: {
    agent: "Rejected",
    staff: "Rejected",
  },
};

export const normalizeStage = (
  value?: APPLICATION_STAGE | string | null,
): APPLICATION_STAGE | null => {
  if (!value) return null;
  if (Object.values(APPLICATION_STAGE).includes(value as APPLICATION_STAGE)) {
    return value as APPLICATION_STAGE;
  }
  return null;
};

export const formatStageLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const getRoleVariant = (role?: USER_ROLE | string) => {
  const roleKey = role ? String(role).toLowerCase() : "";
  if (roleKey === USER_ROLE.STAFF) return "staff";
  if (roleKey === USER_ROLE.AGENT) return "agent";
  return null;
};

export const getRoleStageLabel = (
  stage: APPLICATION_STAGE,
  role?: USER_ROLE | string,
) => {
  const roleVariant = getRoleVariant(role);
  return roleVariant ? ROLE_STATUS_LABELS[stage]?.[roleVariant] : undefined;
};
