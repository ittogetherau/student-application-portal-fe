"use client";
import {
  DataTable,
  type DataTableFacetedFilter,
} from "@/components/data-table/data-table";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type AgentNetworkRow,
  getAgentNetworkColumns,
} from "@/features/agents/components/agents-table-columns";
import { useDeactivateSubAgentMutation } from "@/features/agents/hooks/useSubAgents.hook";
import subAgentsService, {
  type SubAgentCreateResponse,
} from "@/service/sub-agents.service";
import type { SubAgentCreateValues } from "@/features/agents/utils/sub-agent.validation";
import CreateSubAgentDialog from "@/features/agents/components/create-sub-agent-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { toast } from "react-hot-toast";

export default function AgentsPage() {
  const queryClient = useQueryClient();
  const { mutateAsync: deactivateSubAgent, isPending: isDeactivating } =
    useDeactivateSubAgentMutation();

  const { data: teamData, isLoading } = useQuery({
    queryKey: ["agents/team"],
    queryFn: () => subAgentsService.getTeamMembers(),
  });

  const latestSubAgents = React.useMemo(
    () => teamData?.members ?? [],
    [teamData],
  );

  const handleCreated = ({}: {
    values: SubAgentCreateValues;
    result?: SubAgentCreateResponse;
  }) => {
    queryClient.invalidateQueries({ queryKey: ["agents/team"] });
  };

  const handleToggleStatus = React.useCallback(
    async (agent: AgentNetworkRow) => {
      if (agent.status !== "active") {
        toast("This sub-agent is already inactive.");
        return;
      }

      try {
        const response = await deactivateSubAgent(agent.user_id);
        toast.success(
          response.message || "Sub-agent deactivated successfully.",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to deactivate sub-agent.";
        toast.error(message);
      }
    },
    [deactivateSubAgent],
  );

  const columns = React.useMemo(
    () =>
      getAgentNetworkColumns({
        onToggleStatus: handleToggleStatus,
        isTogglingStatus: isDeactivating,
      }),
    [handleToggleStatus, isDeactivating],
  );

  const statusFilters = React.useMemo<DataTableFacetedFilter[]>(() => {
    const options = Array.from(
      new Set(latestSubAgents.map((member) => member.status).filter(Boolean)),
    ).map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: status,
    }));

    return [{ columnId: "status", title: "Status", options }];
  }, [latestSubAgents]);

  return (
    <ContainerLayout className="space-y-5 p-4">
      <Card className="bg-card text-card-foreground">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Build Your Sub-Agent Team
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Create and grow your internal hierarchy by onboarding sub-agents
              under your current organization profile.
            </p>
          </div>
          <CreateSubAgentDialog onCreated={handleCreated} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Network</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : latestSubAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sub-agents in your hierarchy yet. Create your first sub-agent
              to start building your team.
            </p>
          ) : (
            <DataTable
              columns={columns}
              data={latestSubAgents}
              view="table"
              facetedFilters={statusFilters}
              searchableColumns={[
                "agency_name",
                "email",
                "phone",
                "address",
                "agent_level",
                "status",
              ]}
              searchPlaceholder="Search by agency, email, phone, address, level, or status..."
              emptyState={{
                title: "No team members found",
                description: "Try adjusting your search or active filters.",
              }}
            />
          )}
        </CardContent>
      </Card>
    </ContainerLayout>
  );
}
