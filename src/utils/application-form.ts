import {
  ApplicationCreateValues,
  applicationCreateSchema,
} from "@/validation/application.validation";

export type StepFormData = Record<string, unknown>;
export type FormDataState = Record<number, StepFormData>;

export const clampStep = (step: number, totalSteps: number) =>
  Math.max(1, Math.min(step, totalSteps));

export const buildApplicationPayload = (
  formData: FormDataState,
): ApplicationCreateValues =>
  applicationCreateSchema.parse({
    personalDetails: formData[1],
    emergencyContact: formData[2],
    healthCover: formData[3],
    languageCultural: formData[4],
    disabilitySupport: formData[5],
    schoolingHistory: formData[6],
    previousQualifications: formData[7],
    employmentHistory: formData[8],
    usi: formData[9],
    additionalServices: formData[10],
    survey: formData[11],
    documents: formData[12],
  });
