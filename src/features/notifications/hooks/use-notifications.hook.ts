"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import notificationsService, {
  type ListNotificationsParams,
  type ListNotificationsResponse,
  type MarkNotificationReadResponse,
} from "@/features/notifications/service/notifications.service";
import type { ServiceResponse } from "@/shared/types/service";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params: ListNotificationsParams) =>
    [...notificationKeys.all, "list", params] as const,
};

export type UseNotificationsQueryOptions = ListNotificationsParams & {
  enabled?: boolean;
};

export function useNotificationsQuery(
  options: UseNotificationsQueryOptions = {},
) {
  const { enabled, ...params } = options;

  return useQuery<ServiceResponse<ListNotificationsResponse>, Error>({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const response = await notificationsService.list(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 10,
    gcTime: 1000 * 60 * 1,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<MarkNotificationReadResponse>,
    Error,
    string
  >({
    mutationFn: async (notificationId) => {
      const response = await notificationsService.markRead(notificationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<string>, Error, void>({
    mutationFn: async () => {
      const response = await notificationsService.markAllRead();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
