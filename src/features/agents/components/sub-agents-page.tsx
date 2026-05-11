"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateSubAgentDialog from "@/features/agents/components/create-sub-agent-dialog";
import SubAgentApplicationsPanel from "@/features/agents/components/sub-agent-applications-panel";
import UpdateSubAgentCredentialsDialog from "@/features/agents/components/update-sub-agent-credentials-dialog";
import UpdateSubAgentPasswordDialog from "@/features/agents/components/update-sub-agent-password-dialog";
import {
  useDeactivateSubAgentMutation,
  useReactivateSubAgentMutation,
  useSubAgentTeamQuery,
} from "@/features/agents/hooks/useSubAgents.hook";
import {
  type SubAgentCreateResponse,
  type TeamMember,
} from "@/service/sub-agents.service";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { SubAgentCreateValues } from "@/features/agents/utils/sub-agent.validation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  ExternalLink,
  KeyRound,
  MoreHorizontal,
  Network,
  PowerOff,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import * as React from "react";
import { toast } from "react-hot-toast";

type ViewMode = "table" | "applications";

export default function SubAgentsPage() {
  const queryClient = useQueryClient();

  // Dialog state
  const [profileTarget, setProfileTarget] = React.useState<TeamMember | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [passwordTarget, setPasswordTarget] = React.useState<TeamMember | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);

  // View state
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [selectedAgent, setSelectedAgent] = React.useState<TeamMember | null>(null);

  // Search / filter
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");

  const { mutateAsync: deactivateSubAgent, isPending: isDeactivating } =
    useDeactivateSubAgentMutation();
  const { mutateAsync: reactivateSubAgent, isPending: isReactivating } =
    useReactivateSubAgentMutation();

  const { data: teamData, isLoading } = useSubAgentTeamQuery();

  const allSubAgents = React.useMemo(
    () => teamData?.members ?? [],
    [teamData],
  );

  const filteredAgents = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allSubAgents.filter((agent) => {
      const matchesSearch =
        !q ||
        (agent.agency_name ?? "").toLowerCase().includes(q) ||
        (agent.name ?? "").toLowerCase().includes(q) ||
        agent.email.toLowerCase().includes(q) ||
        (agent.phone ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && agent.status === "active") ||
        (statusFilter === "inactive" && agent.status !== "active");
      return matchesSearch && matchesStatus;
    });
  }, [allSubAgents, searchQuery, statusFilter]);

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

  const handleViewApplications = React.useCallback((agent: TeamMember) => {
    setSelectedAgent(agent);
    setViewMode("applications");
  }, []);

  const handleBackToTable = React.useCallback(() => {
    setViewMode("table");
    setSelectedAgent(null);
  }, []);

  // ─── Stat tiles ──────────────────────────────────────────────────────────
  const statTiles = [
    {
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      label: "Team members",
      value: allSubAgents.length,
      description: "Active and inactive accounts across your hierarchy.",
    },
    {
      icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" />,
      label: "Active accounts",
      value: allSubAgents.filter((m) => m.status === "active").length,
      description: "Ready to sign in and manage applications.",
    },
    {
      icon: <Network className="h-4 w-4 text-muted-foreground" />,
      label: "Hierarchy coverage",
      value: allSubAgents.filter((m) => !m.is_current_user).length,
      description: "Delegated sub-agent accounts linked to your workspace.",
    },
  ];

  return (
    <ContainerLayout className="space-y-6 p-4 md:p-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sub-Agent Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your sub-agents, keep account access current, and view each teammate&apos;s application pipeline.
          </p>
        </div>
        <div className="shrink-0">
          <CreateSubAgentDialog onCreated={handleCreated} />
        </div>
      </div>

      {/* ── Stat tiles ──────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))
          : statTiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  {tile.icon}
                  {tile.label}
                </div>
                <p className="text-2xl font-semibold tracking-tight">
                  {tile.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tile.description}
                </p>
              </div>
            ))}
      </div>

      {/* ── Main content: table OR inline applications ───────────────────── */}
      {viewMode === "applications" && selectedAgent ? (
        <SubAgentApplicationsPanel
          agent={selectedAgent}
          onBack={handleBackToTable}
          getAvatarLabel={getAvatarLabel}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Table toolbar */}
          <div className="flex flex-col gap-3 border-b bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Sub-Agents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review access, update account details, and view each sub-agent&apos;s applications.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 w-44 text-sm"
                />
              </div>
              {/* Status filter */}
              <div className="flex items-center rounded-lg border bg-background p-0.5 gap-0.5">
                {(["all", "active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`h-7 rounded-md px-2.5 text-xs font-medium transition-colors capitalize ${
                      statusFilter === s
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-0 divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-3.5 w-24 hidden sm:block" />
                  <Skeleton className="h-3.5 w-20 hidden md:block" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-28" />
                </div>
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">
                {allSubAgents.length === 0
                  ? "No sub-agents yet"
                  : "No matching sub-agents"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {allSubAgents.length === 0
                  ? "Create your first sub-agent to start building your team."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[220px]">Agent</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">Address</TableHead>
                    <TableHead className="hidden md:table-cell">Level</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => {
                    const isActive = agent.status === "active";
                    const created = formatUtcToFriendlyLocal(agent.created_at, {
                      showTime: false,
                    });
                    const displayName =
                      agent.agency_name || agent.name || "Sub-agent";

                    return (
                      <TableRow
                        key={agent.user_id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        {/* Agent column */}
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8 border shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {getAvatarLabel(agent)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-medium text-foreground truncate max-w-[140px]"
                                title={displayName}
                              >
                                {displayName}
                              </p>
                              {agent.is_current_user && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4 px-1 mt-0.5"
                                >
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className="text-sm text-muted-foreground truncate max-w-[180px] block"
                            title={agent.email}
                          >
                            {agent.email}
                          </span>
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {agent.phone || "—"}
                          </span>
                        </TableCell>

                        {/* Address */}
                        <TableCell className="hidden lg:table-cell">
                          <span
                            className="text-sm text-muted-foreground truncate max-w-[160px] block"
                            title={agent.address || "—"}
                          >
                            {agent.address || "—"}
                          </span>
                        </TableCell>

                        {/* Level */}
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground capitalize">
                            {agent.agent_level || "—"}
                          </span>
                        </TableCell>

                        {/* Created */}
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {created || "—"}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {agent.status || "unknown"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {!agent.is_current_user && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => handleViewApplications(agent)}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Apps
                              </Button>
                            )}

                            {!agent.is_current_user && (
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

                                <DropdownMenuContent align="end" className="w-48">
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

                                  <DropdownMenuSeparator />

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
                                    {isActive ? (
                                      <PowerOff className="mr-2 h-4 w-4" />
                                    ) : (
                                      <RotateCcw className="mr-2 h-4 w-4" />
                                    )}
                                    {isUpdatingStatus
                                      ? "Updating..."
                                      : isActive
                                        ? "Deactivate"
                                        : "Reactivate"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Table footer */}
          {!isLoading && filteredAgents.length > 0 && (
            <div className="border-t bg-muted/10 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filteredAgents.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {allSubAgents.length}
                </span>{" "}
                sub-agent{allSubAgents.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <UpdateSubAgentCredentialsDialog
        agent={profileTarget}
        open={isProfileDialogOpen}
        onOpenChange={(open) => {
          setIsProfileDialogOpen(open);
          if (!open) setProfileTarget(null);
        }}
      />

      <UpdateSubAgentPasswordDialog
        agent={passwordTarget}
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) setPasswordTarget(null);
        }}
      />
    </ContainerLayout>
  );
}
