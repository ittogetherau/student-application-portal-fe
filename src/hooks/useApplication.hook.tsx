"use client";

import { useMutation } from "@tanstack/react-query";

import applicationService from "@/service/application.service";
import {
  buildApplicationPayload,
  type FormDataState,
} from "@/utils/application-form";
import type { ApplicationCreateValues } from "@/validation/application.validation";

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
