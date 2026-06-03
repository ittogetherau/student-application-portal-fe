import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/shared/types/service";

export type AgentProfileUpdatePayload = {
  name?: string;
  organization_name?: string;
  phone?: string;
  address?: string;
};

class AgentProfileService extends ApiService {
  private readonly basePath = "agents/profile";

  getCurrentAgentProfile(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(this.basePath, true),
      "Fetched agent profile.",
      "Failed to fetch agent profile",
    );
  }

  updateCurrentAgentProfile(
    payload: AgentProfileUpdatePayload,
  ): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.patch(this.basePath, payload, true),
      "Agent profile updated successfully.",
      "Failed to update agent profile",
    );
  }
}

const agentProfileService = new AgentProfileService();
export default agentProfileService;
