import type { ApplicationTableRow } from "@/shared/constants/types";
import type { TeamMember } from "@/service/sub-agents.service";

export type SubAgentApplicationPreview = {
  userId: string;
  agentProfileId: string;
  name: string;
  email: string;
  status: string;
};

export const getAssignableSubAgents = (members: TeamMember[]) =>
  members.filter((member) => !member.is_current_user);

export function resolveSubAgentApplicationPreview(
  application: Pick<ApplicationTableRow, "id" | "agentId">,
  members: TeamMember[],
): SubAgentApplicationPreview | null {
  const subAgents = getAssignableSubAgents(members);

  if (!subAgents.length) {
    return null;
  }

  const directMatch = subAgents.find(
    (member) => member.agent_profile_id === application.agentId,
  );

  if (directMatch) {
    return {
      userId: directMatch.user_id,
      agentProfileId: directMatch.agent_profile_id,
      name: directMatch.agency_name || directMatch.email || "Sub-agent",
      email: directMatch.email,
      status: directMatch.status,
    };
  }

  return null;
}

export function applicationMatchesSubAgentFilter(
  application: Pick<ApplicationTableRow, "id" | "agentId">,
  members: TeamMember[],
  subAgentProfileId: string,
) {
  const resolved = resolveSubAgentApplicationPreview(application, members);
  return resolved?.agentProfileId === subAgentProfileId;
}
