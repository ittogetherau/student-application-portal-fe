import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

export interface StaffPermissions {
  staff_admin?: boolean;
  [key: string]: unknown;
}

export interface StaffProfile {
  id: string;
  department: string | null;
  job_title: string | null;
  permissions: StaffPermissions | null;
}

export interface StaffMember {
  id: string;
  email: string;
  role: string;
  status: string;
  rto_profile_id: string | null;
  staff_profile: StaffProfile | null;
  name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

class StaffMembersService extends ApiService {
  private readonly basePath = "staff/members";

  list(): Promise<ServiceResponse<StaffMember[]>> {
    return resolveServiceCall<StaffMember[]>(
      () => this.get(this.basePath, true),
      "Staff members fetched successfully.",
      "Failed to fetch staff members",
      []
    );
  }
}

const staffMembersService = new StaffMembersService();
export default staffMembersService;
