"use client";

import subAgentsService, {
  type SubAgentCreateResponse,
  type SubAgentStatusResponse,
} from "@/service/sub-agents.service";
import type { ServiceResponse } from "@/shared/types/service";
import type { SubAgentCreateValues } from "@/features/agents/utils/sub-agent.validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateSubAgentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<SubAgentCreateResponse>,
    Error,
    SubAgentCreateValues
  >({
    mutationKey: ["sub-agent-create"],
    mutationFn: async (payload) => {
      const response = await subAgentsService.createSubAgent(payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to create sub-agent.");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-agents"] });
    },
  });
};

export const useDeactivateSubAgentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<SubAgentStatusResponse>, Error, string>({
    mutationKey: ["sub-agent-deactivate"],
    mutationFn: async (subAgentUserId) => {
      const response =
        await subAgentsService.deactivateSubAgent(subAgentUserId);
      if (!response.success) {
        throw new Error(response.message || "Failed to deactivate sub-agent.");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents/team"] });
      queryClient.invalidateQueries({ queryKey: ["sub-agents"] });
    },
  });
};
