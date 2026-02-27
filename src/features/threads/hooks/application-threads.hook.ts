"use client";

import applicationThreadsService, {
  AddThreadMessagePayload,
  ApplicationThreadFilters,
  CommunicationThread,
  CreateThreadPayload,
  StaffThreadFilters,
  StaffThreadSummary,
  ThreadMessage,
  UnresolvedThreadsResponse,
} from "@/service/application-threads.service";
import type { ServiceResponse } from "@/shared/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const appendThreadMessage = (
  thread: CommunicationThread,
  message: ThreadMessage,
): CommunicationThread => {
  const messages = thread.messages ?? [];
  return {
    ...thread,
    messages: [...messages, message],
    status_updated_at: message.created_at || thread.status_updated_at,
  };
};

export const useStaffThreadsQuery = (filters: StaffThreadFilters = {}) => {
  return useQuery<ServiceResponse<StaffThreadSummary[]>, Error>({
    queryKey: ["staff-threads", filters],
    queryFn: async () => {
      const response = await applicationThreadsService.listStaffThreads(filters);
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

// Queries
export const useApplicationThreadsQuery = (
  applicationId: string | null,
  filters?: ApplicationThreadFilters,
) => {
  const filtersKey = filters ? JSON.stringify(filters) : "";

  return useQuery<ServiceResponse<CommunicationThread[]>, Error>({
    queryKey: ["application-threads", applicationId, filtersKey],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response =
        await applicationThreadsService.listThreads(applicationId, filters ?? {});
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
};

export const useApplicationThreadQuery = (
  applicationId: string | null,
  threadId: string | null,
) => {
  return useQuery<ServiceResponse<CommunicationThread>, Error>({
    queryKey: ["application-thread", applicationId, threadId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      if (!threadId) throw new Error("Missing thread reference.");
      const response = await applicationThreadsService.getThread(
        applicationId,
        threadId,
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId && !!threadId,
  });
};

export const useApplicationUnresolvedThreadsQuery = (
  applicationId: string | null,
) => {
  return useQuery<ServiceResponse<UnresolvedThreadsResponse>, Error>({
    queryKey: ["application-threads-unresolved", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response =
        await applicationThreadsService.getUnresolvedThreads(applicationId);
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
        payload,
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
        queryKey: ["application-threads-unresolved", applicationId],
      });
    },
    onError: (error) => {
      console.error("[ApplicationThreads] createThread failed", error);
    },
  });
};

export const useAddThreadMessageMutation = (
  applicationId: string | null,
  threadId: string | null,
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
        payload,
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Message data is missing.");

      return response.data;
    },
    onSuccess: (message) => {
      queryClient.setQueryData<ServiceResponse<CommunicationThread>>(
        ["application-thread", applicationId, threadId],
        (cached) => {
          if (!cached?.data) return cached;
          return {
            ...cached,
            data: appendThreadMessage(cached.data, message),
          };
        },
      );

      queryClient.setQueriesData<ServiceResponse<CommunicationThread[]>>(
        { queryKey: ["application-threads", applicationId] },
        (cached) => {
          if (!cached?.data) return cached;
          return {
            ...cached,
            data: cached.data.map((thread) =>
              thread.id === threadId
                ? appendThreadMessage(thread, message)
                : thread,
            ),
          };
        },
      );

      queryClient.setQueriesData<ServiceResponse<StaffThreadSummary[]>>(
        { queryKey: ["staff-threads"] },
        (cached) => {
          if (!cached?.data) return cached;
          return {
            ...cached,
            data: cached.data.map((thread) =>
              thread.id === threadId
                ? {
                    ...thread,
                    status_updated_at:
                      message.created_at || thread.status_updated_at,
                  }
                : thread,
            ),
          };
        },
      );
    },
    onError: (error) => {
      console.error("[ApplicationThreads] addThreadMessage failed", error);
    },
  });
};

export const useUpdateThreadStatusMutation = (
  applicationId: string | null,
  threadId: string | null,
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
        status,
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
        queryKey: ["application-thread", applicationId, threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["application-threads-unresolved", applicationId],
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
  threadId: string | null,
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
        priority,
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
        queryKey: ["application-thread", applicationId, threadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["application-threads-unresolved", applicationId],
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
