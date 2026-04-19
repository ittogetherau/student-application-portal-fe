"use client";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeactivateSubAgentMutation } from "@/features/agents/hooks/useSubAgents.hook";
import subAgentsService, {
  type SubAgentCreateResponse,
  type TeamMember,
} from "@/service/sub-agents.service";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { SubAgentCreateValues } from "@/features/agents/utils/sub-agent.validation";
import CreateSubAgentDialog from "@/features/agents/components/create-sub-agent-dialog";
import UpdateSubAgentCredentialsDialog from "@/features/agents/components/update-sub-agent-credentials-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, KeyRound, MoreHorizontal, PowerOff } from "lucide-react";
import * as React from "react";
import { toast } from "react-hot-toast";

type AgentsPageProps = {
  compact?: boolean;
};

export default function AgentsPage({ compact = false }: AgentsPageProps) {
  const queryClient = useQueryClient();
  const [credentialsTarget, setCredentialsTarget] =
    React.useState<TeamMember | null>(null);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] =
    React.useState(false);

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

  const getAvatarLabel = React.useCallback((member: TeamMember) => {
    const source = member.agency_name || member.email || "SA";
    const parts = source.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "S";
    const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "A";
    return `${first}${second}`.toUpperCase();
  }, []);

  const handleToggleStatus = React.useCallback(
    async (agent: TeamMember) => {
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

  const copyValue = React.useCallback(async (label: string, value: string) => {
    if (!value) {
      toast.error(`No ${label.toLowerCase()} to copy.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}.`);
    }
  }, []);

  const openCredentialsDialog = React.useCallback((agent: TeamMember) => {
    setCredentialsTarget(agent);
    setIsCredentialsDialogOpen(true);
  }, []);

  const content = (
    <>
      <Card className="bg-card text-card-foreground">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Sub-Agent Management
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Manage your sub-agents and organization hierarchy from your
              account settings.
            </p>
          </div>
          <CreateSubAgentDialog onCreated={handleCreated} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sub-Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-36 w-full rounded-md" />
              ))}
            </div>
          ) : latestSubAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sub-agents in your hierarchy yet. Create your first sub-agent
              to start building your team.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {latestSubAgents.map((agent) => {
                const isActive = agent.status === "active";
                const created = formatUtcToFriendlyLocal(agent.created_at, {
                  showTime: false,
                });

                return (
                  <Card
                    key={agent.user_id}
                    className="bg-background/95 border-border shadow-sm"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getAvatarLabel(agent)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <CardTitle
                              className="truncate text-base"
                              title={agent.agency_name}
                            >
                              {agent.agency_name}
                            </CardTitle>
                            <CardDescription
                              className="truncate"
                              title={agent.email}
                            >
                              {agent.email}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {agent.status || "unknown"}
                          </Badge>

                          {!agent.is_current_user ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <span className="sr-only">Open sub-agent actions</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                <DropdownMenuItem
                                  onSelect={() =>
                                    copyValue("User ID", agent.user_id)
                                  }
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy ID
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() =>
                                    copyValue("Email", agent.email)
                                  }
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Email
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() => openCredentialsDialog(agent)}
                                >
                                  <KeyRound className="mr-2 h-4 w-4" />
                                  Change Credentials
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onSelect={() => handleToggleStatus(agent)}
                                  disabled={!isActive || isDeactivating}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  {isActive ? "Deactivate" : "Inactive"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Level:
                          </span>{" "}
                          {agent.agent_level || "-"}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Phone:
                          </span>{" "}
                          {agent.phone || "-"}
                        </p>
                        <p
                          className="truncate text-muted-foreground"
                          title={agent.address || "-"}
                        >
                          <span className="font-medium text-foreground">
                            Address:
                          </span>{" "}
                          {agent.address || "-"}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Created:
                          </span>{" "}
                          {created || "-"}
                        </p>
                      </div>

                      {agent.is_current_user ? (
                        <div className="pt-1">
                          <Badge variant="outline">Current account</Badge>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <UpdateSubAgentCredentialsDialog
        agent={credentialsTarget}
        open={isCredentialsDialogOpen}
        onOpenChange={(open) => {
          setIsCredentialsDialogOpen(open);
          if (!open) {
            setCredentialsTarget(null);
          }
        }}
      />
    </>
  );

  if (compact) {
    return <div className="space-y-5">{content}</div>;
  }

  return <ContainerLayout className="space-y-5 p-4">{content}</ContainerLayout>;
}
