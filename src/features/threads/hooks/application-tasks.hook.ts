"use client";

import { useQuery } from "@tanstack/react-query";
import applicationTasksService, {
  type GalaxyTaskStatusResponse,
} from "@/service/application-tasks.service";
import type { ServiceResponse } from "@/shared/types/service";

export const useGalaxyTaskStatusQuery = (taskId: string | null) => {
  return useQuery<ServiceResponse<GalaxyTaskStatusResponse>, Error>({
    queryKey: ["galaxy-task-status", taskId],
    queryFn: async () => {
      if (!taskId) throw new Error("Missing task reference.");
      const response =
        await applicationTasksService.getGalaxyTaskStatus(taskId);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    enabled: !!taskId,
  });
};
