import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/shared/types/service";

export type SubAgentCreatePayload = {
  email: string;
  password: string;
  organization_name: string;
  phone: string;
  address: string;
};

export type SubAgentCreateResponse = {
  id?: string;
  email?: string;
  organization_name?: string;
  phone?: string;
  address?: string;
  status?: string;
};

export type SubAgentStatusResponse = string;

export type TeamMember = {
  user_id: string;
  agent_profile_id: string;
  email: string;
  status: string;
  agent_level: string;
  agency_name: string;
  phone: string | null;
  address: string | null;
  parent_agent_profile_id: string | null;
  root_agent_profile_id: string;
  is_current_user: boolean;
  created_at: string;
};

export type TeamMembersResponse = {
  current_agent_profile_id: string;
  current_agent_level: string;
  count: number;
  members: TeamMember[];
};

class SubAgentsService extends ApiService {
  private readonly basePath = "agents/sub-agents";

  getTeamMembers(): Promise<TeamMembersResponse> {
    return this.get<TeamMembersResponse>("agents/team", true);
  }

  createSubAgent(
    payload: SubAgentCreatePayload,
  ): Promise<ServiceResponse<SubAgentCreateResponse>> {
    return resolveServiceCall<SubAgentCreateResponse>(
      () => this.post(this.basePath, payload, true),
      "Sub-agent created successfully.",
      "Failed to create sub-agent",
    );
  }

  deactivateSubAgent(
    subAgentUserId: string,
  ): Promise<ServiceResponse<SubAgentStatusResponse>> {
    return resolveServiceCall<SubAgentStatusResponse>(
      () =>
        this.patch<SubAgentStatusResponse>(
          `${this.basePath}/${subAgentUserId}/deactivate`,
          {},
          true,
        ),
      "Sub-agent deactivated successfully.",
      "Failed to deactivate sub-agent",
    );
  }
}

const subAgentsService = new SubAgentsService();
export default subAgentsService;
