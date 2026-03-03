"use client";

import type { ApplicationDetailResponse } from "@/service/application.service";
import staffAgentsService, {
  type StaffAgentListItem,
} from "@/service/staff-agents.service";
import type { ServiceResponse } from "@/shared/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseStaffAgentsOptions = {
  enabled?: boolean;
};

export const useStaffAgentsQuery = (options: UseStaffAgentsOptions = {}) => {
  return useQuery<ServiceResponse<StaffAgentListItem[]>, Error>({
    queryKey: ["staff-agents"],
    queryFn: async () => {
      const response = await staffAgentsService.listActiveAgents();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: options.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

export const useApplicationAssignAgentMutation = (
  applicationId: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation<ApplicationDetailResponse, Error, string | null>({
    mutationKey: ["application-assign-agent", applicationId],
    mutationFn: async (agentId: string | null) => {
      if (!applicationId) throw new Error("Missing application reference.");

      const response = await staffAgentsService.assignAgentToApplication(
        applicationId,
        agentId,
      );

      if (!response.success) throw new Error(response.message);
      if (!response.data)
        throw new Error("Application data is missing from response.");

      return response.data;
    },
    onSuccess: (data, agentId) => {
      console.log("[Application] assignAgentToApplication success", {
        applicationId,
        agentId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      console.error("[Application] assignAgentToApplication failed", error);
    },
  });
};

