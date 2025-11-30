"use client";

import { useMutation } from "@tanstack/react-query";

import applicationService from "@/service/application.service";
import {
  buildApplicationPayload,
  type FormDataState,
} from "@/utils/application-form";
import type { ApplicationCreateValues } from "@/validation/application.validation";
import type { ApplicationDetail } from "@/service/application.service";
import type { ServiceResponse } from "@/types/service";

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
    onSuccess: (data) => {
      console.log("[Application] submitApplication success", {
        applicationId,
        response: data,
      });
    },
    onError: (error) => {
      console.error("[Application] submitApplication failed", error);
    },
  });

export const useApplicationGetMutation = (applicationId: string | null) =>
  useMutation<ServiceResponse<ApplicationDetail>, Error, void>({
    mutationKey: ["application-get", applicationId],
    mutationFn: async () => {
      if (!applicationId) {
        throw new Error("Missing application reference.");
      }
      const response = await applicationService.getApplication(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: (response) => {
      console.log("[Application] getApplication success", {
        applicationId,
        response,
      });
    },
    onError: (error) => {
      console.error("[Application] getApplication failed", error);
    },
  });

const DEFAULT_CREATE_PAYLOAD_temp = {
  agent_profile_id: "ea7cab76-0e47-4de8-b923-834f0d53abf1",
  course_offering_id: "4ba78380-8158-4941-9420-a1495d88e9d6",
};

export const useApplicationCreateMutation = () =>
  useMutation({
    mutationKey: ["application-create"],
    mutationFn: async (
      payload: ApplicationCreateValues = DEFAULT_CREATE_PAYLOAD_temp
    ) => {
      const response = await applicationService.createApplication(payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      const applicationId = data?.application?.id;

      console.log("[Application] createApplication success", {
        applicationId,
        response: data,
      });

      if (applicationId && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("applicationId", applicationId);
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${params.toString()}`
        );
      } else if (!applicationId) {
        console.warn(
          "[Application] createApplication response missing id",
          data
        );
      }
    },
    onError: (error) => {
      console.error("[Application] createApplication failed", error);
    },
  });
