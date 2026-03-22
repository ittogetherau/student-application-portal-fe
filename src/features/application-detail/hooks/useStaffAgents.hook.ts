"use client";

import { usePublicStudentApplicationStore } from "@/features/student-application/store/use-public-student-application.store";
import type { ApplicationDetailResponse } from "@/service/application.service";
import publicStudentApplicationService, {
  type PublicStudentAgentAssignmentResponse,
} from "@/service/public-student-application.service";
import staffAgentsService, {
  type StaffAgentListItem,
} from "@/service/staff-agents.service";
import type { ServiceResponse } from "@/shared/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseStaffAgentsOptions = {
  enabled?: boolean;
};

export const useStaffAgentsQuery = (options: UseStaffAgentsOptions = {}) => {
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const token = usePublicStudentApplicationStore((state) => state.token);

  return useQuery<ServiceResponse<StaffAgentListItem[]>, Error>({
    queryKey: ["staff-agents", isPublicMode ? `public:${token}` : "private"],
    queryFn: async () => {
      const response =
        isPublicMode && token
          ? await publicStudentApplicationService.listAvailableAgents(token)
          : await staffAgentsService.listActiveAgents();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: (options.enabled ?? true) && (!isPublicMode || !!token),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

export const useApplicationAssignAgentMutation = (
  applicationId: string | null,
) => {
  const queryClient = useQueryClient();
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const token = usePublicStudentApplicationStore((state) => state.token);

  return useMutation<
    ApplicationDetailResponse | PublicStudentAgentAssignmentResponse,
    Error,
    string | null
  >({
    mutationKey: [
      "application-assign-agent",
      isPublicMode ? `public:${token}` : applicationId,
    ],
    mutationFn: async (agentId: string | null) => {
      if (!applicationId && !(isPublicMode && token)) {
        throw new Error("Missing application reference.");
      }

      if (isPublicMode && !agentId) {
        throw new Error("Public application links can only assign an agent.");
      }

      const response =
        isPublicMode && token
          ? await publicStudentApplicationService.assignAgent(
              token,
              agentId as string,
            )
          : await staffAgentsService.assignAgentToApplication(
              applicationId as string,
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
      if (isPublicMode && token) {
        queryClient.invalidateQueries({
          queryKey: ["application-get", `public:${token}`],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      console.error("[Application] assignAgentToApplication failed", error);
    },
  });
};

