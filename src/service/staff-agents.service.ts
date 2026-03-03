import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ApplicationDetailResponse } from "@/service/application.service";
import type { ServiceResponse } from "@/shared/types/service";

export interface StaffAgentListItem {
  id: string;
  email: string;
  agency_name?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  galaxy_agent_id?: string | null;
  agent_profile_id?: string | null;
}

class StaffAgentsService extends ApiService {
  private readonly basePath = "staff/agents";

  listActiveAgents(): Promise<ServiceResponse<StaffAgentListItem[]>> {
    return resolveServiceCall<StaffAgentListItem[]>(
      () => this.get(this.basePath, true),
      "Agents fetched successfully.",
      "Failed to fetch agents",
      [],
    );
  }

  assignAgentToApplication(
    applicationId: string,
    agentId: string | null,
  ): Promise<ServiceResponse<ApplicationDetailResponse>> {
    if (!applicationId) throw new Error("Application id is required");

    const payload = { agent_id: agentId };

    return resolveServiceCall<ApplicationDetailResponse>(
      () =>
        this.patch(
          `staff/applications/${applicationId}/assign-agent`,
          payload,
          true,
        ),
      agentId ? "Agent assigned successfully." : "Agent unassigned successfully.",
      "Failed to assign agent",
    );
  }
}

const staffAgentsService = new StaffAgentsService();
export default staffAgentsService;

