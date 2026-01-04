"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { siteRoutes } from "@/constants/site-routes";
import type { Application } from "@/constants/types";
import type {
  ApplicationDetailResponse,
  ApplicationListParams,
  ApplicationResponse,
} from "@/service/application.service";
import applicationService from "@/service/application.service";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import type { ServiceResponse } from "@/types/service";
import type { ApplicationCreateValues } from "@/validation/application.validation";

// --- Queries ---

export const useApplicationListQuery = (params: ApplicationListParams = {}) => {
  return useQuery<ServiceResponse<Application[]>, Error>({
    queryKey: ["application-list", params],
    queryFn: async () => {
      const response = await applicationService.listApplications(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
};

export const useApplicationGetQuery = (applicationId: string | null) => {
  return useQuery<ServiceResponse<ApplicationDetailResponse>, Error>({
    queryKey: ["application-get", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await applicationService.getApplication(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
};

// --- Mutations ---

export const useApplicationSubmitMutation = (applicationId: string | null) => {
  const router = useRouter();
  const clearAllData = useApplicationFormDataStore(
    (state) => state.clearAllData
  );
  const queryClient = useQueryClient();

  return useMutation<ApplicationDetailResponse, Error, void>({
    mutationKey: ["application-submit", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await applicationService.submitApplication(
        applicationId
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data)
        throw new Error("Application data is missing from response.");

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] submitApplication success", {
        applicationId,
        response: data,
      });

      // Clear all form data after successful submission
      clearAllData();

      // Invalidate list and detail queries
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });

      router.push(siteRoutes.dashboard.application.root);
    },
    onError: (error) => {
      console.error("[Application] submitApplication failed", error);
    },
  });
};

export const useApplicationGetMutation = (applicationId: string | null) => {
  const populateFromApiResponse = useApplicationFormDataStore(
    (state) => state.populateFromApiResponse
  );

  return useMutation<ServiceResponse<ApplicationDetailResponse>, Error, void>({
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

      // Set application ID in store
      if (applicationId) {
        useApplicationFormDataStore.getState().setApplicationId(applicationId);
      }

      // Populate form data from API response
      if (response?.data) {
        populateFromApiResponse(response.data);
      }
    },
    onError: (error) => {
      console.error("[Application] getApplication failed", error);
    },
  });
};

export const DEFAULT_CREATE_PAYLOAD_temp = {
  agent_profile_id: "ea7cab76-0e47-4de8-b923-834f0d53abf1",
  course_offering_id: "4ba78380-8158-4941-9420-a1495d88e9d6",
};

export const useApplicationCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ApplicationResponse, Error, ApplicationCreateValues>({
    mutationKey: ["application-create"],
    mutationFn: async (
      payload: ApplicationCreateValues = DEFAULT_CREATE_PAYLOAD_temp
    ) => {
      const response = await applicationService.createApplication(payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      if (!response.data) {
        throw new Error("No data returned from create application");
      }
      return response.data;
    },
    onSuccess: (data) => {
      const applicationId = data?.application?.id;

      console.log("[Application] createApplication success", {
        applicationId,
        response: data,
      });

      queryClient.invalidateQueries({ queryKey: ["application-list"] });

      // Store the application ID in the store
      if (applicationId) {
        useApplicationFormDataStore.getState().setApplicationId(applicationId);
      } else {
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
};

export const useApplicationUpdateMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<ApplicationDetailResponse, Error, Record<string, unknown>>(
    {
      mutationKey: ["application-update", applicationId],
      mutationFn: async (payload) => {
        if (!applicationId) throw new Error("Missing application reference.");

        const response = await applicationService.updateApplication(
          applicationId,
          payload
        );

        if (!response.success) throw new Error(response.message);
        if (!response.data)
          throw new Error("Application data is missing from response.");

        return response.data;
      },
      onSuccess: (data) => {
        console.log("[Application] updateApplication success", {
          applicationId,
          response: data,
        });
        queryClient.invalidateQueries({
          queryKey: ["application-get", applicationId],
        });
        queryClient.invalidateQueries({ queryKey: ["application-list"] });
      },
      onError: (error) => {
        console.error("[Application] updateApplication failed", error);
      },
    }
  );
};

export const useApplicationAssignMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<ApplicationDetailResponse, Error, string | null>({
    mutationKey: ["application-assign", applicationId],
    mutationFn: async (staffId: string | null) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await applicationService.assignApplication(
        applicationId,
        staffId
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data)
        throw new Error("Application data is missing from response.");

      return response.data;
    },
    onSuccess: (data, staffId) => {
      console.log("[Application] assignApplication success", {
        applicationId,
        staffId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] assignApplication failed", error);
    },
  });
};

export const useApplicationChangeStageMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationKey: ["application-change-stage", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await applicationService.changeStage(
        applicationId,
        payload
      );

      if (!response.success) throw new Error(response.message);

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] changeStage success", {
        applicationId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] changeStage failed", error);
    },
  });
};

// Staff - Approve application hook
export const useApplicationApproveMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<
    {
      application_id: string;
      current_stage: string;
      message: string;
      updated_at: string;
    },
    Error,
    {
      offer_details: Record<string, unknown>;
      notes?: string;
    }
  >({
    mutationKey: ["application-approve", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await applicationService.startApplicationReview(
        applicationId,
        payload
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] approveApplication success", {
        applicationId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] approveApplication failed", error);
    },
  });
};

// Staff - Reject application hook
export const useApplicationRejectMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<
    {
      application_id: string;
      current_stage: string;
      message: string;
      updated_at: string;
    },
    Error,
    {
      rejection_reason: string;
      is_appealable: boolean;
    }
  >({
    mutationKey: ["application-reject", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await applicationService.rejectApplication(
        applicationId,
        payload
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] rejectApplication success", {
        applicationId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] rejectApplication failed", error);
    },
  });
};

// Staff - Generate offer letter hook
export const useApplicationGenerateOfferLetterMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<
    {
      pdf_url: string;
      application_id: string;
      generated_at: string;
      message: string;
    },
    Error,
    {
      course_start_date: string;
      tuition_fee: number;
      material_fee: number;
      conditions: string[];
      template?: string;
    }
  >({
    mutationKey: ["application-generate-offer", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await applicationService.generateOfferLetter(
        applicationId,
        payload
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] generateOfferLetter success", {
        applicationId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] generateOfferLetter failed", error);
    },
  });
};
