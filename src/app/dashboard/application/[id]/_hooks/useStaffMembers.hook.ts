"use client";

import staffMembersService, {
  StaffMember,
} from "@/service/staff-members.service";
import type { ServiceResponse } from "@/types/service";
import { useQuery } from "@tanstack/react-query";

export const useStaffMembersQuery = () => {
  return useQuery<ServiceResponse<StaffMember[]>, Error>({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const response = await staffMembersService.list();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default useStaffMembersQuery;
