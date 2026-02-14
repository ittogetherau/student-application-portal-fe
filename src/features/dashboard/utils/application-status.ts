import { STAGE_PILL_CONFIG, normalizeStage } from "@/shared/config/application-stage.config";
import { APPLICATION_STAGE } from "@/shared/constants/types";

export type DashboardStatusDatum = {
  name: string;
  value: number;
  color?: string;
};

const STAGE_ORDER: APPLICATION_STAGE[] = [
  APPLICATION_STAGE.SUBMITTED,
  APPLICATION_STAGE.IN_REVIEW,
  APPLICATION_STAGE.OFFER_LETTER,
  APPLICATION_STAGE.GS_ASSESSMENT,
  APPLICATION_STAGE.COE_ISSUED,
  APPLICATION_STAGE.ACCEPTED,
  APPLICATION_STAGE.REJECTED,
];

const STAGE_COLOR_MAP: Record<APPLICATION_STAGE, string> = {
  [APPLICATION_STAGE.DRAFT]: "#9CA3AF",
  [APPLICATION_STAGE.SUBMITTED]: "#3B82F6",
  [APPLICATION_STAGE.IN_REVIEW]: "#F59E0B",
  [APPLICATION_STAGE.OFFER_LETTER]: "#F97316",
  [APPLICATION_STAGE.GS_ASSESSMENT]: "#06B6D4",
  [APPLICATION_STAGE.COE_ISSUED]: "#14B8A6",
  [APPLICATION_STAGE.ACCEPTED]: "#10B981",
  [APPLICATION_STAGE.REJECTED]: "#EF4444",
};

const STAGE_ALIAS_TO_KEY: Record<string, APPLICATION_STAGE> = {
  draft: APPLICATION_STAGE.DRAFT,
  submitted: APPLICATION_STAGE.SUBMITTED,
  in_review: APPLICATION_STAGE.IN_REVIEW,
  under_review: APPLICATION_STAGE.IN_REVIEW,
  pending_decision: APPLICATION_STAGE.IN_REVIEW,
  staff_review: APPLICATION_STAGE.IN_REVIEW,
  application_submitted: APPLICATION_STAGE.SUBMITTED,
  application_received: APPLICATION_STAGE.SUBMITTED,
  application_under_review: APPLICATION_STAGE.IN_REVIEW,
  offer_generated: APPLICATION_STAGE.OFFER_LETTER,
  offer_issued: APPLICATION_STAGE.OFFER_LETTER,
  offer_letter: APPLICATION_STAGE.OFFER_LETTER,
  awaiting_offer_signature: APPLICATION_STAGE.OFFER_LETTER,
  sign_offer_letter: APPLICATION_STAGE.OFFER_LETTER,
  gs_assessment: APPLICATION_STAGE.GS_ASSESSMENT,
  gs_process: APPLICATION_STAGE.GS_ASSESSMENT,
  coe: APPLICATION_STAGE.COE_ISSUED,
  coe_issued: APPLICATION_STAGE.COE_ISSUED,
  confirmation_of_enrollment: APPLICATION_STAGE.COE_ISSUED,
  confirmation_of_enrolment: APPLICATION_STAGE.COE_ISSUED,
  completed: APPLICATION_STAGE.ACCEPTED,
  approved: APPLICATION_STAGE.ACCEPTED,
  accepted: APPLICATION_STAGE.ACCEPTED,
  rejected: APPLICATION_STAGE.REJECTED,
};

const canonicalizeStatus = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const toStageKey = (value: string): APPLICATION_STAGE | null => {
  const normalized = normalizeStage(value);
  if (normalized) return normalized;

  const canonical = canonicalizeStatus(value);
  const normalizedCanonical = normalizeStage(canonical);
  if (normalizedCanonical) return normalizedCanonical;

  return STAGE_ALIAS_TO_KEY[canonical] ?? null;
};

export const normalizeDashboardStatusItems = (
  items: DashboardStatusDatum[],
): Required<DashboardStatusDatum>[] => {
  const totalsByStage = new Map<APPLICATION_STAGE, number>();

  for (const item of items) {
    const stage = toStageKey(item.name);
    if (!stage || stage === APPLICATION_STAGE.DRAFT) continue;
    totalsByStage.set(stage, (totalsByStage.get(stage) ?? 0) + item.value);
  }

  const known = STAGE_ORDER.filter((stage) => (totalsByStage.get(stage) ?? 0) > 0).map(
    (stage) => ({
      name: STAGE_PILL_CONFIG[stage]?.label ?? stage,
      value: totalsByStage.get(stage) ?? 0,
      color: STAGE_COLOR_MAP[stage],
    }),
  );

  return known;
};
