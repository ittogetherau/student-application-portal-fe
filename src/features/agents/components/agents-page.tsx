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
import {
  useDeactivateSubAgentMutation,
  useReactivateSubAgentMutation,
  useSubAgentTeamQuery,
} from "@/features/agents/hooks/useSubAgents.hook";
import {
  type SubAgentCreateResponse,
  type TeamMember,
} from "@/service/sub-agents.service";
import { siteRoutes } from "@/shared/constants/site-routes";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { SubAgentCreateValues } from "@/features/agents/utils/sub-agent.validation";
import CreateSubAgentDialog from "@/features/agents/components/create-sub-agent-dialog";
import UpdateSubAgentCredentialsDialog from "@/features/agents/components/update-sub-agent-credentials-dialog";
import UpdateSubAgentPasswordDialog from "@/features/agents/components/update-sub-agent-password-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  ExternalLink,
  Network,
  KeyRound,
  MoreHorizontal,
  PowerOff,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "react-hot-toast";

type AgentsPageProps = {
  compact?: boolean;
};

export default function AgentsPage({ compact = false }: AgentsPageProps) {
  const queryClient = useQueryClient();
  const [profileTarget, setProfileTarget] = React.useState<TeamMember | null>(
    null,
  );
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [passwordTarget, setPasswordTarget] = React.useState<TeamMember | null>(
    null,
  );
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);

  const { mutateAsync: deactivateSubAgent, isPending: isDeactivating } =
    useDeactivateSubAgentMutation();
  const { mutateAsync: reactivateSubAgent, isPending: isReactivating } =
    useReactivateSubAgentMutation();

  const { data: teamData, isLoading } = useSubAgentTeamQuery();

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
    const source = member.name || member.agency_name || member.email || "SA";
    const parts = source.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "S";
    const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "A";
    return `${first}${second}`.toUpperCase();
  }, []);

  const handleToggleStatus = React.useCallback(
    async (agent: TeamMember) => {
      const isActive = agent.status === "active";

      try {
        const response = isActive
          ? await deactivateSubAgent(agent.user_id)
          : await reactivateSubAgent(agent.user_id);
        toast.success(
          response.message ||
            (isActive
              ? "Sub-agent deactivated successfully."
              : "Sub-agent reactivated successfully."),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update sub-agent status.";
        toast.error(message);
      }
    },
    [deactivateSubAgent, reactivateSubAgent],
  );

  const isUpdatingStatus = isDeactivating || isReactivating;

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

  const openProfileDialog = React.useCallback((agent: TeamMember) => {
    setProfileTarget(agent);
    setIsProfileDialogOpen(true);
  }, []);

  const openPasswordDialog = React.useCallback((agent: TeamMember) => {
    setPasswordTarget(agent);
    setIsPasswordDialogOpen(true);
  }, []);

  const content = (
    <>
      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit rounded-md px-2.5 py-1">
                Team workspace
              </Badge>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Sub-Agent Management
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Manage your sub-agents, keep account access current, and jump
                  straight into each teammate&apos;s application pipeline.
                </p>
              </div>
            </div>
            <CreateSubAgentDialog onCreated={handleCreated} />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border bg-background/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" />
                Team members
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {latestSubAgents.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Active and inactive accounts across your hierarchy.
              </p>
            </div>

            <div className="rounded-xl border bg-background/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Active accounts
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {latestSubAgents.filter((member) => member.status === "active").length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ready to sign in and manage applications.
              </p>
            </div>

            <div className="rounded-xl border bg-background/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Network className="h-4 w-4 text-muted-foreground" />
                Hierarchy coverage
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {latestSubAgents.filter((member) => !member.is_current_user).length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Delegated sub-agent accounts linked to your workspace.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="space-y-1 border-b bg-muted/20">
          <CardTitle>Sub-Agents</CardTitle>
          <CardDescription>
            Review access, keep account details updated, and open each
            sub-agent&apos;s filtered application list.
          </CardDescription>
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
                    className="border-border/70 bg-background shadow-sm transition-colors hover:bg-muted/20"
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
                              title={
                                agent.agency_name || agent.name || agent.email
                              }
                            >
                              {agent.agency_name || agent.name || "Sub-agent"}
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
                            variant={isActive ? "secondary" : "outline"}
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
                                  <span className="sr-only">
                                    Open sub-agent actions
                                  </span>
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
                                  onSelect={() => openProfileDialog(agent)}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Update Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() => openPasswordDialog(agent)}
                                >
                                  <KeyRound className="mr-2 h-4 w-4" />
                                  Update Password
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onSelect={() => handleToggleStatus(agent)}
                                  disabled={isUpdatingStatus}
                                  className={
                                    isActive
                                      ? "text-destructive focus:text-destructive"
                                      : ""
                                  }
                                >
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  {isUpdatingStatus
                                    ? "Updating..."
                                    : isActive
                                      ? "Deactivate"
                                      : "Reactivate"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid gap-2 rounded-xl border bg-muted/20 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Level</span>
                          <span className="font-medium text-foreground">
                            {agent.agent_level || "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-right font-medium text-foreground">
                            {agent.phone || "-"}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-muted-foreground">Address</span>
                          <span
                            className="max-w-[65%] text-right font-medium text-foreground"
                            title={agent.address || "-"}
                          >
                            {agent.address || "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Created</span>
                          <span className="font-medium text-foreground">
                            {created || "-"}
                          </span>
                        </div>
                      </div>

                      {agent.is_current_user ? (
                        <div className="pt-1">
                          <Badge variant="outline">Current account</Badge>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Link
                              href={`${siteRoutes.dashboard.application.filteredBySubAgent(agent.agent_profile_id)}&subAgentName=${encodeURIComponent(agent.agency_name || agent.email)}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                              View applications
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <UpdateSubAgentCredentialsDialog
        agent={profileTarget}
        open={isProfileDialogOpen}
        onOpenChange={(open) => {
          setIsProfileDialogOpen(open);
          if (!open) {
            setProfileTarget(null);
          }
        }}
      />

      <UpdateSubAgentPasswordDialog
        agent={passwordTarget}
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            setPasswordTarget(null);
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
