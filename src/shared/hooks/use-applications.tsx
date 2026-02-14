"use client";

import { useApplicationFormDataStore } from "@/features/application-form/store/use-application-form-data.store";
import type {
  ApplicationDeleteResponse,
  ApplicationDetailResponse,
  ApplicationListParams,
  ApplicationResponse,
  BulkArchiveResponse,
  BulkDeleteResponse,
  BulkUnarchiveResponse,
  GalaxySyncResponse,
  TimelineResponse,
} from "@/service/application.service";
import applicationService from "@/service/application.service";
import signatureService, {
  type SendOfferLetterPayload,
  type SendOfferLetterResponse,
  type SignatureRequestResponse,
} from "@/service/signature.service";
import { siteRoutes } from "@/shared/constants/site-routes";
import type { Application, APPLICATION_STAGE } from "@/shared/constants/types";
import type { ServiceResponse } from "@/shared/types/service";
import type { ApplicationCreateValues } from "@/shared/validation/application.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const GC_TIME_MS = 5 * 60 * 1000;

export type ServiceMutationError = Error & {
  response?: ServiceResponse<unknown>;
};

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
    staleTime: GC_TIME_MS,
    gcTime: GC_TIME_MS,
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
    staleTime: GC_TIME_MS,
    gcTime: GC_TIME_MS,
  });
};

export const useApplicationRequestSignaturesQuery = (
  applicationId: string | null,
) => {
  return useQuery<SignatureRequestResponse, Error>({
    queryKey: ["application-signature-requests", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await signatureService.requestSignatures(applicationId);

      if (!response.success) {
        const error = new Error(response.message) as ServiceMutationError;
        error.response = response;
        throw error;
      }
      if (!response.data) throw new Error("Response data is missing.");

      return response.data;
    },
    enabled: !!applicationId,
    staleTime: GC_TIME_MS,
    gcTime: GC_TIME_MS,
  });
};

export const useApplicationTimelineQuery = (applicationId: string | null) => {
  return useQuery<ServiceResponse<TimelineResponse[]>, Error>({
    queryKey: ["application-timeline", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response =
        await applicationService.getApplicationTimeline(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
    staleTime: GC_TIME_MS,
    gcTime: GC_TIME_MS,
  });
};

// --- Mutations ---

export const useApplicationSubmitMutation = (applicationId: string | null) => {
  const router = useRouter();
  const clearAllData = useApplicationFormDataStore(
    (state) => state.clearAllData,
  );
  const queryClient = useQueryClient();

  return useMutation<ApplicationDetailResponse, Error, void>({
    mutationKey: ["application-submit", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response =
        await applicationService.submitApplication(applicationId);

      if (!response.success) {
        const error = new Error(response.message) as ServiceMutationError;
        error.response = response;
        throw error;
      }
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
    (state) => state.populateFromApiResponse,
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
      payload: ApplicationCreateValues = DEFAULT_CREATE_PAYLOAD_temp,
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
          data,
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
          payload,
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
    },
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
        staffId,
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
      // Application table uses a separate query key in `useApplications`.
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      console.error("[Application] assignApplication failed", error);
    },
  });
};

export const useApplicationChangeStageMutation = (
  applicationId: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationKey: ["application-change-stage", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await applicationService.changeStage(
        applicationId,
        payload,
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

// Staff - Enroll course in Galaxy
export const useApplicationEnrollGalaxyCourseMutation = (
  applicationId: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { application_id?: string; current_stage?: string; message?: string },
    Error,
    void
  >({
    mutationKey: ["application-enroll-galaxy-course", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response =
        await applicationService.enrollGalaxyCourse(applicationId);

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] enrollGalaxyCourse success", {
        applicationId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] enrollGalaxyCourse failed", error);
    },
  });
};

// Staff - Sync application in Galaxy
export const useApplicationGalaxySyncMutation = (
  applicationId: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncResponse, Error, void>({
    mutationKey: ["application-galaxy-sync", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response =
        await applicationService.syncGalaxyApplication(applicationId);

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] galaxySync success", {
        applicationId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] galaxySync failed", error);
    },
  });
};

// Staff - Approve application hook
export const useApplicationApproveMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<
    {
      application_id: string;
      current_stage: APPLICATION_STAGE;
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

      const response = await applicationService.approveApplication(
        applicationId,
        payload,
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
      current_stage: APPLICATION_STAGE;
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
        payload,
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
  applicationId: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    {
      offer_letter_url: string;
      application_id: string;
      generated_at: string;
      expires_at: string | null;
      message?: string;
    },
    Error
  >({
    mutationKey: ["application-generate-offer", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response =
        await applicationService.generateOfferLetter(applicationId);

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");

      return { ...response.data, message: response.message };
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

// Staff - Send offer letter hook
export const useApplicationSendOfferLetterMutation = (
  applicationId: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation<SendOfferLetterResponse, Error, SendOfferLetterPayload>({
    mutationKey: ["application-send-offer-letter", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await signatureService.sendOfferLetter(
        applicationId,
        payload,
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");

      return { ...response.data, message: response.message };
    },
    onSuccess: (data) => {
      console.log("[Application] sendOfferLetter success", {
        applicationId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    },
    onError: (error) => {
      console.error("[Application] sendOfferLetter failed", error);
    },
  });
};

export const useApplicationRequestSignaturesMutation = (
  applicationId: string | null,
) => {
  return useMutation<SignatureRequestResponse, Error, void>({
    mutationKey: ["application-request-signatures", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await signatureService.requestSignatures(applicationId);

      if (!response.success) throw new Error(response.message);

      if (!response.data) throw new Error("Response data is missing.");

      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Application] requestSignatures success", {
        applicationId,
        response: data,
      });
    },
    onError: (error) => {
      console.error("[Application] requestSignatures failed", error);
    },
  });
};

// Archive application
export const useArchiveApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<ApplicationResponse>, Error, string>({
    mutationFn: async (applicationId: string) => {
      return await applicationService.archiveApplication(applicationId);
    },
    onSuccess: (_, applicationId) => {
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

// Unarchive (restore) application
export const useUnarchiveApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<ApplicationResponse>, Error, string>({
    mutationFn: async (applicationId: string) => {
      return await applicationService.unarchiveApplication(applicationId);
    },
    onSuccess: (_, applicationId) => {
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

// Bulk archive applications
export const useBulkArchiveApplicationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<BulkArchiveResponse>, Error, string[]>({
    mutationFn: async (applicationIds: string[]) => {
      return await applicationService.bulkArchiveApplications(applicationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

// Bulk delete applications
export const useBulkDeleteApplicationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<BulkDeleteResponse>, Error, string[]>({
    mutationFn: async (applicationIds: string[]) => {
      return await applicationService.bulkDeleteApplications(applicationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

// Bulk unarchive applications
export const useBulkUnarchiveApplicationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<BulkUnarchiveResponse>, Error, string[]>({
    mutationFn: async (applicationIds: string[]) => {
      return await applicationService.bulkUnarchiveApplications(applicationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

// Delete application permanently
export const useDeleteApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<ApplicationDeleteResponse>, Error, string>(
    {
      mutationFn: async (applicationId: string) => {
        return await applicationService.deleteApplication(applicationId);
      },
      onSuccess: (_, applicationId) => {
        queryClient.invalidateQueries({
          queryKey: ["application-get", applicationId],
        });
        queryClient.invalidateQueries({ queryKey: ["application-list"] });
        queryClient.invalidateQueries({ queryKey: ["applications"] });
      },
    },
  );
};
