"use client";

import applicationTimelineService, {
  CommunicationThread,
  CreateThreadPayload,
  ThreadMessage,
} from "@/service/application-timeline.service";
import type { ServiceResponse } from "@/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Queries
export const useApplicationThreadsQuery = (applicationId: string | null) => {
  return useQuery<ServiceResponse<CommunicationThread[]>, Error>({
    queryKey: ["application-threads", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await applicationTimelineService.listThreads(
        applicationId
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
};

// Mutations
export const useCreateThreadMutation = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<CommunicationThread, Error, CreateThreadPayload>({
    mutationKey: ["application-thread-create", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await applicationTimelineService.createThread(
        applicationId,
        payload
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Thread data is missing.");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["application-threads", applicationId],
      });
    },
    onError: (error) => {
      console.error("[ApplicationThreads] createThread failed", error);
    },
  });
};

export const useAddThreadMessageMutation = (
  applicationId: string | null,
  threadId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<ThreadMessage, Error, string>({
    mutationKey: ["application-thread-add-message", applicationId, threadId],
    mutationFn: async (message) => {
      if (!applicationId) throw new Error("Missing application reference.");
      if (!threadId) throw new Error("Missing thread reference.");

      const response = await applicationTimelineService.addMessage(
        applicationId,
        threadId,
        message
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Message data is missing.");

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["application-threads", applicationId],
      });
    },
    onError: (error) => {
      console.error("[ApplicationThreads] addThreadMessage failed", error);
    },
  });
};

export const useUpdateThreadStatusMutation = (
  applicationId: string | null,
  threadId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<CommunicationThread, Error, string>({
    mutationKey: ["application-thread-update-status", applicationId, threadId],
    mutationFn: async (status) => {
      if (!applicationId) throw new Error("Missing application reference.");
      if (!threadId) throw new Error("Missing thread reference.");

      const response = await applicationTimelineService.updateStatus(
        applicationId,
        threadId,
        status
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Thread data is missing.");

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["application-threads", applicationId],
      });
    },
    onError: (error) => {
      console.error("[ApplicationThreads] updateThreadStatus failed", error);
    },
  });
};
