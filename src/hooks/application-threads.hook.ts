"use client";

import applicationThreadsService, {
  AddThreadMessagePayload,
  CommunicationThread,
  CreateThreadPayload,
  StaffThreadSummary,
  ThreadMessage,
} from "@/service/application-threads.service";
import type { ServiceResponse } from "@/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStaffThreadsQuery = () => {
  return useQuery<ServiceResponse<StaffThreadSummary[]>, Error>({
    queryKey: ["staff-threads"],
    queryFn: async () => {
      const response = await applicationThreadsService.listStaffThreads();
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

// Queries
export const useApplicationThreadsQuery = (applicationId: string | null) => {
  return useQuery<ServiceResponse<CommunicationThread[]>, Error>({
    queryKey: ["application-threads", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await applicationThreadsService.listThreads(
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
      const response = await applicationThreadsService.createThread(
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

  return useMutation<ThreadMessage, Error, AddThreadMessagePayload>({
    mutationKey: ["application-thread-add-message", applicationId, threadId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Missing application reference.");
      if (!threadId) throw new Error("Missing thread reference.");

      const response = await applicationThreadsService.addMessage(
        applicationId,
        threadId,
        payload
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

      const response = await applicationThreadsService.updateStatus(
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
      queryClient.invalidateQueries({
        queryKey: ["staff-threads"],
      });
    },
    onError: (error) => {
      console.error("[ApplicationThreads] updateThreadStatus failed", error);
    },
  });
};

export const useUpdateThreadPriorityMutation = (
  applicationId: string | null,
  threadId: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation<CommunicationThread, Error, string>({
    mutationKey: [
      "application-thread-update-priority",
      applicationId,
      threadId,
    ],
    mutationFn: async (priority) => {
      if (!applicationId) throw new Error("Missing application reference.");
      if (!threadId) throw new Error("Missing thread reference.");

      const response = await applicationThreadsService.updatePriority(
        applicationId,
        threadId,
        priority
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Thread data is missing.");

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["application-threads", applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff-threads"],
      });
    },
    onError: (error) => {
      console.error("[ApplicationThreads] updateThreadPriority failed", error);
    },
  });
};
