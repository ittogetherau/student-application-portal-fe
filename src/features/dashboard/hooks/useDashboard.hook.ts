"use client";

import { useQuery } from "@tanstack/react-query";
import dashboardService, {
  type AgentDashboardResponse,
  type StaffDashboardQueryParams,
  type StaffDashboardResponse,
} from "@/service/dashboard.service";
import type { ServiceResponse } from "@/shared/types/service";

interface StaffDashboardQueryOptions {
  enabled?: boolean;
}

export const useStaffDashboardQuery = (
  params: StaffDashboardQueryParams = {},
  options: StaffDashboardQueryOptions = {},
) => {
  const startDate = params.startDate ?? null;
  const endDate = params.endDate ?? null;

  return useQuery<ServiceResponse<StaffDashboardResponse>, Error>({
    queryKey: ["dashboard", "staff", startDate, endDate],
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await dashboardService.getStaffDashboard(params);
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
