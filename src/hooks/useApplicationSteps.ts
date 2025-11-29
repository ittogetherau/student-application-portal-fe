"use client";

import { useMutation } from "@tanstack/react-query";

import applicationStepsService from "@/service/application-steps.service";
import {
  AdditionalServicesValues,
  DisabilitySupportValues,
  EmergencyContactValues,
  EmploymentHistoryValues,
  HealthCoverValues,
  LanguageCulturalValues,
  PersonalDetailsValues,
  PreviousQualificationsValues,
  SchoolingHistoryValues,
  SurveyValues,
  UsiValues,
} from "@/validation/application.validation";
import {
  APPLICATION_STEP_IDS,
  type ApplicationStepId,
} from "@/components/forms/application-forms/form-step-registry";

type StepMutationFn<TInput> = (
  applicationId: string,
  payload: TInput
) => Promise<unknown>;

export const STEP_SAVE_ORDER = APPLICATION_STEP_IDS;
export type StepNumber = ApplicationStepId;

const useStepMutation = <TInput,>(
  stepId: StepNumber,
  mutationFn: StepMutationFn<TInput>,
  applicationId: string | null
) =>
  useMutation<unknown, Error, TInput>({
    mutationKey: ["application-step", stepId, applicationId],
    mutationFn: async (payload: TInput) => {
      if (!applicationId) return null;
      const response = await mutationFn(applicationId, payload);
      if (
        typeof response === "object" &&
        response !== null &&
        "success" in response &&
        response.success === false
      ) {
        throw new Error(
          "message" in response && typeof response.message === "string"
            ? response.message
            : `Failed to save step ${stepId}.`
        );
      }
      return response;
    },
  });

export const useApplicationStepMutations = (applicationId: string | null) => ({
  1: useStepMutation<PersonalDetailsValues>(
    1,
    (id, payload) => applicationStepsService.updatePersonalDetails(id, payload),
    applicationId
  ),
  2: useStepMutation<EmergencyContactValues>(
    2,
    (id, payload) => applicationStepsService.updateEmergencyContact(id, payload),
    applicationId
  ),
  3: useStepMutation<HealthCoverValues>(
    3,
    (id, payload) => applicationStepsService.updateHealthCover(id, payload),
    applicationId
  ),
  4: useStepMutation<LanguageCulturalValues>(
    4,
    (id, payload) =>
      applicationStepsService.updateLanguageCultural(id, payload),
    applicationId
  ),
  5: useStepMutation<DisabilitySupportValues>(
    5,
    (id, payload) => applicationStepsService.updateDisabilitySupport(id, payload),
    applicationId
  ),
  6: useStepMutation<SchoolingHistoryValues>(
    6,
    (id, payload) => applicationStepsService.updateSchoolingHistory(id, payload),
    applicationId
  ),
  7: useStepMutation<PreviousQualificationsValues>(
    7,
    (id, payload) =>
      applicationStepsService.updatePreviousQualifications(id, payload),
    applicationId
  ),
  8: useStepMutation<EmploymentHistoryValues>(
    8,
    (id, payload) => applicationStepsService.updateEmploymentHistory(id, payload),
    applicationId
  ),
  9: useStepMutation<UsiValues>(
    9,
    (id, payload) => applicationStepsService.updateUsi(id, payload),
    applicationId
  ),
  10: useStepMutation<AdditionalServicesValues>(
    10,
    (id, payload) =>
      applicationStepsService.updateAdditionalServices(id, payload),
    applicationId
  ),
  11: useStepMutation<SurveyValues>(
    11,
    (id, payload) => applicationStepsService.updateSurvey(id, payload),
    applicationId
  ),
});
