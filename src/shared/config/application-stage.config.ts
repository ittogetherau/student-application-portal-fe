import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  BadgeCheck,
  CircleQuestionMark,
  CircleX,
  ClipboardCheck,
  ListTodo,
  ScanSearch,
  Signature,
  User,
  type LucideIcon,
} from "lucide-react";

type StageRoleLabels = {
  agent: string;
  staff: string;
};

type StageConfig = {
  label: string;
  className: string;
  roleLabels: StageRoleLabels;
  kanbanColor: string;
  kanbanBackground: string;
  icon: LucideIcon;
};

export const APPLICATION_STAGE_CONFIG: Record<APPLICATION_STAGE, StageConfig> = {
  [APPLICATION_STAGE.DRAFT]: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-100",
    roleLabels: {
      agent: "Draft",
      staff: "Draft",
    },
    kanbanColor: "bg-gray-500",
    kanbanBackground: "bg-gray-500/5",
    icon: User,
  },
  [APPLICATION_STAGE.SUBMITTED]: {
    label: "Submitted",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
    roleLabels: {
      agent: "Application Submitted",
      staff: "Application Received",
    },
    kanbanColor: "bg-blue-500",
    kanbanBackground: "bg-blue-500/5",
    icon: ClipboardCheck,
  },
  [APPLICATION_STAGE.IN_REVIEW]: {
    label: "In Review",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    roleLabels: {
      agent: "Application Under Review",
      staff: "Application Under Review",
    },
    kanbanColor: "bg-yellow-500",
    kanbanBackground: "bg-yellow-500/5",
    icon: ScanSearch,
  },
  [APPLICATION_STAGE.OFFER_LETTER]: {
    label: "Offer Letter",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
    roleLabels: {
      agent: "Sign Offer Letter",
      staff: "Awaiting Offer Signature",
    },
    kanbanColor: "bg-orange-500",
    kanbanBackground: "bg-orange-500/5",
    icon: Signature,
  },
  [APPLICATION_STAGE.GS_ASSESSMENT]: {
    label: "GS Assessment",
    className:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200",
    roleLabels: {
      agent: "GS Process",
      staff: "GS Process",
    },
    kanbanColor: "bg-cyan-500",
    kanbanBackground: "bg-cyan-500/5",
    icon: ListTodo,
  },
  [APPLICATION_STAGE.COE_ISSUED]: {
    label: "Confirmation of Enrollment",
    className:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200",
    roleLabels: {
      agent: "Confirmation of Enrollment",
      staff: "Confirmation of Enrollment",
    },
    kanbanColor: "bg-emerald-500",
    kanbanBackground: "bg-emerald-500/5",
    icon: CircleQuestionMark,
  },
  [APPLICATION_STAGE.ACCEPTED]: {
    label: "Accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
    roleLabels: {
      agent: "Accepted",
      staff: "Accepted",
    },
    kanbanColor: "bg-lime-600",
    kanbanBackground: "bg-lime-500/5",
    icon: BadgeCheck,
  },
  [APPLICATION_STAGE.REJECTED]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
    roleLabels: {
      agent: "Rejected",
      staff: "Rejected",
    },
    kanbanColor: "bg-rose-600",
    kanbanBackground: "bg-rose-500/5",
    icon: CircleX,
  },
};

export const APPLICATION_KANBAN_STAGES: APPLICATION_STAGE[] = [
  APPLICATION_STAGE.DRAFT,
  APPLICATION_STAGE.SUBMITTED,
  APPLICATION_STAGE.IN_REVIEW,
  APPLICATION_STAGE.OFFER_LETTER,
  APPLICATION_STAGE.GS_ASSESSMENT,
  APPLICATION_STAGE.COE_ISSUED,
  APPLICATION_STAGE.ACCEPTED,
  APPLICATION_STAGE.REJECTED,
];

export const STAGE_PILL_CONFIG: Record<
  APPLICATION_STAGE,
  { label: string; className: string }
> = Object.fromEntries(
  Object.entries(APPLICATION_STAGE_CONFIG).map(([stage, config]) => [
    stage,
    { label: config.label, className: config.className },
  ]),
) as Record<APPLICATION_STAGE, { label: string; className: string }>;

export const ROLE_STATUS_LABELS: Record<APPLICATION_STAGE, StageRoleLabels> =
  Object.fromEntries(
    Object.entries(APPLICATION_STAGE_CONFIG).map(([stage, config]) => [
      stage,
      config.roleLabels,
    ]),
  ) as Record<APPLICATION_STAGE, StageRoleLabels>;

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

export const getStageLabel = (stage: APPLICATION_STAGE, role?: USER_ROLE | string) =>
  getRoleStageLabel(stage, role) ?? APPLICATION_STAGE_CONFIG[stage].label;

export const getStageKanbanColor = (stage: APPLICATION_STAGE) =>
  APPLICATION_STAGE_CONFIG[stage].kanbanColor;

export const getStageKanbanBackground = (stage: APPLICATION_STAGE) =>
  APPLICATION_STAGE_CONFIG[stage].kanbanBackground;

export const getStageIcon = (stage: APPLICATION_STAGE): LucideIcon =>
  APPLICATION_STAGE_CONFIG[stage].icon;
