"use client";

import { useMutation } from "@tanstack/react-query";

import adminAgentService, {
  type AdminAgent,
} from "@/service/admin-agent.service";
import type { ServiceResponse } from "@/types/service";

export const useAdminAgentMutation = () => {
  return useMutation<ServiceResponse<AdminAgent>, Error, string>({
    mutationKey: ["admin-agent"],
    mutationFn: async (agentId: string) => {
      const response = await adminAgentService.getAgent(agentId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
};

export default useAdminAgentMutation;
