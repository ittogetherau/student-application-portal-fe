"use client";

import { useQuery } from "@tanstack/react-query";
import dashboardService, {
  type AgentDashboardResponse,
  type StaffDashboardResponse,
} from "@/service/dashboard.service";
import type { ServiceResponse } from "@/shared/types/service";

export const useStaffDashboardQuery = () => {
  return useQuery<ServiceResponse<StaffDashboardResponse>, Error>({
    queryKey: ["dashboard", "staff"],
    queryFn: async () => {
      const response = await dashboardService.getStaffDashboard();
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

export const useAgentDashboardQuery = () => {
  return useQuery<ServiceResponse<AgentDashboardResponse>, Error>({
    queryKey: ["dashboard", "agent"],
    queryFn: async () => {
      const response = await dashboardService.getAgentDashboard();
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};
