import { APPLICATION_FORM_STEPS } from "@/features/application-form/constants/form-step-config";

export const APPLICATION_STEP_IDS = APPLICATION_FORM_STEPS.map(
  (step) => step.id,
).filter((id) => id !== 13) as [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const REVIEW_STEP_ID = APPLICATION_FORM_STEPS.length - 1;
export const TOTAL_APPLICATION_STEPS = APPLICATION_FORM_STEPS.length;

export type ApplicationStepId = (typeof APPLICATION_STEP_IDS)[number];
