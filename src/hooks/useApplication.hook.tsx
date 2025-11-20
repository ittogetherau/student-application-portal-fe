"use client";

import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import applicationService from "@/service/application.service";
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
} from "@/validation/application";
import { buildApplicationPayload, type FormDataState } from "@/utils/application-form";
import type { ApplicationCreateValues } from "@/validation/application";

type StepMutationFn<TInput> = (
  applicationId: string,
  payload: TInput,
) => Promise<unknown>;

export const STEP_SAVE_ORDER = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
] as const;
export type StepNumber = (typeof STEP_SAVE_ORDER)[number];

const createStepMutationHook = <TInput,>(
  stepId: StepNumber,
  mutationFn: StepMutationFn<TInput>,
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
              : `Failed to save step ${stepId}.`,
          );
        }
        return response;
      },
    });
};

export const usePersonalDetailsStepMutation = createStepMutationHook<
  PersonalDetailsValues
>(1, applicationService.updatePersonalDetails.bind(applicationService));

export const useEmergencyContactStepMutation = createStepMutationHook<
  EmergencyContactValues
>(2, applicationService.updateEmergencyContact.bind(applicationService));

export const useHealthCoverStepMutation = createStepMutationHook<
  HealthCoverValues
>(3, applicationService.updateHealthCover.bind(applicationService));

export const useLanguageStepMutation = createStepMutationHook<
  LanguageCulturalValues
>(4, applicationService.updateLanguageCultural.bind(applicationService));

export const useDisabilityStepMutation = createStepMutationHook<
  DisabilitySupportValues
>(5, applicationService.updateDisabilitySupport.bind(applicationService));

export const useSchoolingStepMutation = createStepMutationHook<
  SchoolingHistoryValues
>(6, applicationService.updateSchoolingHistory.bind(applicationService));

export const useQualificationsStepMutation = createStepMutationHook<
  PreviousQualificationsValues
>(7, applicationService.updatePreviousQualifications.bind(applicationService));

export const useEmploymentStepMutation = createStepMutationHook<
  EmploymentHistoryValues
>(8, applicationService.updateEmploymentHistory.bind(applicationService));

export const useUsiStepMutation = createStepMutationHook<UsiValues>(
  9,
  applicationService.updateUsi.bind(applicationService),
);

export const useAdditionalServicesStepMutation = createStepMutationHook<
  AdditionalServicesValues
>(
  10,
  applicationService.updateAdditionalServices.bind(applicationService),
);

export const useSurveyStepMutation = createStepMutationHook<SurveyValues>(
  11,
  applicationService.updateSurvey.bind(applicationService),
);

export const useApplicationStepMutations = (
  applicationId: string | null,
) => {
  const personalDetailsMutation =
    usePersonalDetailsStepMutation(applicationId);
  const emergencyContactMutation =
    useEmergencyContactStepMutation(applicationId);
  const healthCoverMutation = useHealthCoverStepMutation(applicationId);
  const languageMutation = useLanguageStepMutation(applicationId);
  const disabilityMutation = useDisabilityStepMutation(applicationId);
  const schoolingMutation = useSchoolingStepMutation(applicationId);
  const qualificationsMutation =
    useQualificationsStepMutation(applicationId);
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
    ],
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
        payload,
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
