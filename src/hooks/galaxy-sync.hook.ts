"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import galaxySyncService, {
  type GalaxySyncResponse,
} from "@/service/galaxy-sync.service";

type GalaxySyncStatusResponse = string;

const invalidateApplicationQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  applicationId: string | null
) => {
  if (!applicationId) return;
  queryClient.invalidateQueries({
    queryKey: ["application-get", applicationId],
  });
  queryClient.invalidateQueries({ queryKey: ["application-list"] });
};

export const useGalaxySyncApplicationMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncResponse, Error, boolean | undefined>({
    mutationKey: ["galaxy-sync-application", applicationId],
    mutationFn: async (background = true) => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncApplication(
        applicationId,
        background
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing.");
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncApplication success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncApplication failed", error);
    },
  });
};

export const useGalaxySyncPersonalDetailsMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-personal-details", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncPersonalDetails(
        applicationId
      );
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncPersonalDetails success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncPersonalDetails failed", error);
    },
  });
};

export const useGalaxySyncDocumentsMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-documents", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncDocuments(applicationId);
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncDocuments success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncDocuments failed", error);
    },
  });
};

export const useGalaxySyncEmergencyContactMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-emergency-contact", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncEmergencyContact(
        applicationId
      );
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncEmergencyContact success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncEmergencyContact failed", error);
    },
  });
};

export const useGalaxySyncLanguageMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-language", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncLanguage(applicationId);
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncLanguage success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncLanguage failed", error);
    },
  });
};

export const useGalaxySyncDisabilityMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-disability", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncDisability(applicationId);
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncDisability success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncDisability failed", error);
    },
  });
};

export const useGalaxySyncSchoolingMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-schooling", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncSchooling(applicationId);
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncSchooling success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncSchooling failed", error);
    },
  });
};

export const useGalaxySyncQualificationsMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-qualifications", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncQualifications(
        applicationId
      );
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncQualifications success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncQualifications failed", error);
    },
  });
};

export const useGalaxySyncEmploymentMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-employment", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncEmployment(applicationId);
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncEmployment success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncEmployment failed", error);
    },
  });
};

export const useGalaxySyncUsiMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-usi", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncUsi(applicationId);
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncUsi success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncUsi failed", error);
    },
  });
};

export const useGalaxySyncDeclarationMutation = (
  applicationId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<GalaxySyncStatusResponse, Error, void>({
    mutationKey: ["galaxy-sync-declaration", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await galaxySyncService.syncDeclaration(applicationId);
      if (!response.success) throw new Error(response.message);
      if (response.data === null || response.data === undefined) {
        throw new Error("Response data is missing.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[GalaxySync] syncDeclaration success", {
        applicationId,
        response: data,
      });
      invalidateApplicationQueries(queryClient, applicationId);
    },
    onError: (error) => {
      console.error("[GalaxySync] syncDeclaration failed", error);
    },
  });
};
