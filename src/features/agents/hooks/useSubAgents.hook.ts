"use client";

import subAgentsService, {
  type SubAgentCreateResponse,
  type SubAgentProfilePayload,
  type SubAgentResetPasswordPayload,
  type SubAgentStatusResponse,
} from "@/service/sub-agents.service";
import type { ServiceResponse } from "@/shared/types/service";
import type { SubAgentCreateValues } from "@/features/agents/utils/sub-agent.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSubAgentTeamQuery = (enabled = true) =>
  useQuery({
    queryKey: ["agents/team"],
    queryFn: () => subAgentsService.getTeamMembers(),
    enabled,
  });

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

export const useReactivateSubAgentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<SubAgentStatusResponse>, Error, string>({
    mutationKey: ["sub-agent-reactivate"],
    mutationFn: async (subAgentUserId) => {
      const response = await subAgentsService.reactivateSubAgent(subAgentUserId);
      if (!response.success) {
        throw new Error(response.message || "Failed to reactivate sub-agent.");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents/team"] });
      queryClient.invalidateQueries({ queryKey: ["sub-agents"] });
    },
  });
};

export const useResetSubAgentPasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<unknown>,
    Error,
    { subAgentUserId: string; payload: SubAgentResetPasswordPayload }
  >({
    mutationKey: ["sub-agent-reset-password"],
    mutationFn: async ({ subAgentUserId, payload }) => {
      const response = await subAgentsService.resetSubAgentPassword(
        subAgentUserId,
        payload,
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to reset sub-agent password.");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents/team"] });
      queryClient.invalidateQueries({ queryKey: ["sub-agents"] });
    },
  });
};

export const useUpdateSubAgentProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<unknown>,
    Error,
    { subAgentUserId: string; payload: SubAgentProfilePayload }
  >({
    mutationKey: ["sub-agent-profile-update"],
    mutationFn: async ({ subAgentUserId, payload }) => {
      const response = await subAgentsService.updateSubAgentProfile(
        subAgentUserId,
        payload,
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to update sub-agent profile.");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents/team"] });
      queryClient.invalidateQueries({ queryKey: ["sub-agents"] });
    },
  });
};
