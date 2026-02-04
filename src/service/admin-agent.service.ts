import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/shared/types/service";

export interface AdminAgentProfile {
  id: string;
  agency_name: string | null;
  phone: string | null;
  address: string | null;
}

export interface AdminAgent {
  id: string;
  email: string;
  role: string;
  status: string;
  rto_profile_id: string | null;
  agent_profile_id: string | null;
  agent_profile: AdminAgentProfile | null;
  created_at?: string;
  updated_at?: string;
}

class AdminAgentService extends ApiService {
  private readonly basePath = "admin/agents";

  getAgent(agentId: string): Promise<ServiceResponse<AdminAgent>> {
    if (!agentId) throw new Error("Agent id is required");
    return resolveServiceCall<AdminAgent>(
      () => this.get(`${this.basePath}/${agentId}`, true),
      "Agent fetched.",
      "Failed to fetch agent",
    );
  }
}

const adminAgentService = new AdminAgentService();
export default adminAgentService;
