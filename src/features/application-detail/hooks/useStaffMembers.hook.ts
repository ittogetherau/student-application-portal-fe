"use client";

import staffMembersService, {
  StaffMember,
} from "@/service/staff-members.service";
import type { ServiceResponse } from "@/shared/types/service";
import { useQuery } from "@tanstack/react-query";

type UseStaffMembersOptions = {
  enabled?: boolean;
};

export const useStaffMembersQuery = (options: UseStaffMembersOptions = {}) => {
  return useQuery<ServiceResponse<StaffMember[]>, Error>({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const response = await staffMembersService.list();
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

