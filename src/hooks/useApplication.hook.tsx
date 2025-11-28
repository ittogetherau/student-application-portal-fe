"use client";

import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import applicationService from "@/service/application.service";
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
  buildApplicationPayload,
  type FormDataState,
} from "@/utils/application-form";
import type { ApplicationCreateValues } from "@/validation/application.validation";

type StepMutationFn<TInput> = (
  applicationId: string,
  payload: TInput
) => Promise<unknown>;

export const STEP_SAVE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type StepNumber = (typeof STEP_SAVE_ORDER)[number];

const createStepMutationHook = <TInput,>(
  stepId: StepNumber,
  mutationFn: StepMutationFn<TInput>
) => {
  return (applicationId: string | null) =>
    useMutation<unknown, Error, TInput>({
      mutationKey: ["application-step", stepId, applicationId],
      mutationFn: async (payload: TInput) => {
        if (!applicationId) {
          return null;
        }
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
};

export const usePersonalDetailsStepMutation =
  createStepMutationHook<PersonalDetailsValues>(1, (applicationId, payload) =>
    applicationStepsService.updatePersonalDetails(applicationId, payload)
  );

export const useEmergencyContactStepMutation =
  createStepMutationHook<EmergencyContactValues>(2, (applicationId, payload) =>
    applicationStepsService.updateEmergencyContact(applicationId, payload)
  );

export const useHealthCoverStepMutation =
  createStepMutationHook<HealthCoverValues>(3, (applicationId, payload) =>
    applicationStepsService.updateHealthCover(applicationId, payload)
  );

export const useLanguageStepMutation =
  createStepMutationHook<LanguageCulturalValues>(4, (applicationId, payload) =>
    applicationStepsService.updateLanguageCultural(applicationId, payload)
  );

export const useDisabilityStepMutation =
  createStepMutationHook<DisabilitySupportValues>(5, (applicationId, payload) =>
    applicationStepsService.updateDisabilitySupport(applicationId, payload)
  );

export const useSchoolingStepMutation =
  createStepMutationHook<SchoolingHistoryValues>(6, (applicationId, payload) =>
    applicationStepsService.updateSchoolingHistory(applicationId, payload)
  );

export const useQualificationsStepMutation =
  createStepMutationHook<PreviousQualificationsValues>(
    7,
    (applicationId, payload) =>
      applicationStepsService.updatePreviousQualifications(
        applicationId,
        payload
      )
  );

export const useEmploymentStepMutation =
  createStepMutationHook<EmploymentHistoryValues>(8, (applicationId, payload) =>
    applicationStepsService.updateEmploymentHistory(applicationId, payload)
  );

export const useUsiStepMutation = createStepMutationHook<UsiValues>(
  9,
  (applicationId, payload) =>
    applicationStepsService.updateUsi(applicationId, payload)
);

export const useAdditionalServicesStepMutation =
  createStepMutationHook<AdditionalServicesValues>(
    10,
    (applicationId, payload) =>
      applicationStepsService.updateAdditionalServices(applicationId, payload)
  );

export const useSurveyStepMutation = createStepMutationHook<SurveyValues>(
  11,
  (applicationId, payload) =>
    applicationStepsService.updateSurvey(applicationId, payload)
);

export const useApplicationStepMutations = (applicationId: string | null) => {
  const personalDetailsMutation = usePersonalDetailsStepMutation(applicationId);
  const emergencyContactMutation =
    useEmergencyContactStepMutation(applicationId);
  const healthCoverMutation = useHealthCoverStepMutation(applicationId);
  const languageMutation = useLanguageStepMutation(applicationId);
  const disabilityMutation = useDisabilityStepMutation(applicationId);
  const schoolingMutation = useSchoolingStepMutation(applicationId);
  const qualificationsMutation = useQualificationsStepMutation(applicationId);
  const employmentMutation = useEmploymentStepMutation(applicationId);
  const usiMutation = useUsiStepMutation(applicationId);
  const additionalServicesMutation =
    useAdditionalServicesStepMutation(applicationId);
  const surveyMutation = useSurveyStepMutation(applicationId);

  return useMemo(
    () => ({
      1: personalDetailsMutation,
      2: emergencyContactMutation,
      3: healthCoverMutation,
      4: languageMutation,
      5: disabilityMutation,
      6: schoolingMutation,
      7: qualificationsMutation,
      8: employmentMutation,
      9: usiMutation,
      10: additionalServicesMutation,
      11: surveyMutation,
    }),
    [
      personalDetailsMutation,
      emergencyContactMutation,
      healthCoverMutation,
      languageMutation,
      disabilityMutation,
      schoolingMutation,
      qualificationsMutation,
      employmentMutation,
      usiMutation,
      additionalServicesMutation,
      surveyMutation,
    ]
  );
};

export const useApplicationSubmitMutation = (applicationId: string | null) =>
  useMutation<unknown, Error, FormDataState>({
    mutationKey: ["application-submit", applicationId],
    mutationFn: async (latestFormData) => {
      if (!applicationId) {
        throw new Error("Missing application reference.");
      }
      const payload = buildApplicationPayload(latestFormData);
      const response = await applicationService.submitApplication(
        applicationId,
        payload
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
  });

export const useApplicationCreateMutation = () =>
  useMutation({
    mutationKey: ["application-create"],
    mutationFn: async (payload: ApplicationCreateValues) => {
      const response = await applicationService.createApplication(payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
  });
