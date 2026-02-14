import { APPLICATION_STAGE } from "@/shared/constants/types";

const STAGE_ORDER: APPLICATION_STAGE[] = [
  APPLICATION_STAGE.DRAFT,
  APPLICATION_STAGE.SUBMITTED,
  APPLICATION_STAGE.IN_REVIEW,
  APPLICATION_STAGE.OFFER_LETTER,
  APPLICATION_STAGE.GS_ASSESSMENT,
  APPLICATION_STAGE.COE_ISSUED,
  APPLICATION_STAGE.ACCEPTED,
];

export const isStageAtLeast = (
  current: APPLICATION_STAGE | null | undefined,
  target: APPLICATION_STAGE,
) => {
  if (!current || current === APPLICATION_STAGE.REJECTED) return false;
  const currentIndex = STAGE_ORDER.indexOf(current);
  const targetIndex = STAGE_ORDER.indexOf(target);
  return currentIndex >= targetIndex && targetIndex !== -1;
};

export const isRejectedStage = (
  stage?: APPLICATION_STAGE | null,
): stage is APPLICATION_STAGE.REJECTED => stage === APPLICATION_STAGE.REJECTED;

const normalizeStage = (
  stage?: string | APPLICATION_STAGE | null,
): APPLICATION_STAGE | null => {
  if (!stage) return null;
  return Object.values(APPLICATION_STAGE).includes(stage as APPLICATION_STAGE)
    ? (stage as APPLICATION_STAGE)
    : null;
};

export const shouldShowGsRoute = (
  stage?: string | APPLICATION_STAGE | null,
): boolean => {
  const normalizedStage = normalizeStage(stage);
  return (
    isRejectedStage(normalizedStage) ||
    isStageAtLeast(normalizedStage, APPLICATION_STAGE.GS_ASSESSMENT)
  );
};

export const shouldShowCoeRoute = (
  stage?: string | APPLICATION_STAGE | null,
): boolean => {
  const normalizedStage = normalizeStage(stage);
  return (
    isRejectedStage(normalizedStage) ||
    isStageAtLeast(normalizedStage, APPLICATION_STAGE.COE_ISSUED)
  );
};
