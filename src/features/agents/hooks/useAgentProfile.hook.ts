"use client";

import { useMutation } from "@tanstack/react-query";

import agentProfileService, {
  type AgentProfileUpdatePayload,
} from "@/service/agent-profile.service";
import type { ServiceResponse } from "@/shared/types/service";

export const useUpdateCurrentAgentProfileMutation = () =>
  useMutation<ServiceResponse<unknown>, Error, AgentProfileUpdatePayload>({
    mutationKey: ["agents", "profile", "update"],
    mutationFn: async (payload) => {
      const response =
        await agentProfileService.updateCurrentAgentProfile(payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to update agent profile.");
      }
      return response;
    },
  });
