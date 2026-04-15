"use client";

import subAgentsService, {
  type SubAgentCreateResponse,
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
