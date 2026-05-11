"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicationListPagination from "@/features/application-list/components/list/application-list-pagination";
import { ApplicationTable } from "@/features/application-list/components/table/application-table";
import { useApplications } from "@/features/application-list/hooks/useApplications.hook";
import type { TeamMember } from "@/service/sub-agents.service";
import { ArrowLeft, Users } from "lucide-react";
import * as React from "react";

type SubAgentApplicationsPanelProps = {
  agent: TeamMember;
  onBack: () => void;
  getAvatarLabel: (member: TeamMember) => string;
};

export default function SubAgentApplicationsPanel({
  agent,
  onBack,
  getAvatarLabel,
}: SubAgentApplicationsPanelProps) {
  const isActive = agent.status === "active";
  const agentDisplayName = agent.agency_name || agent.name || "Sub-agent";

  const {
    applications,
    total,
    page,
    maxPage,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    error,
    setQuery,
    searchValue,
    setExtraFilters,
    extraFilters,
    isSearchingOrFiltering,
    resetFilters,
  } = useApplications({
    filters: { ownerAgentProfileId: agent.agent_profile_id },
    storeKey: `applications-subagent-${agent.agent_profile_id}`,
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sub-Agents
          </Button>
          <div className="hidden sm:block h-5 w-px bg-border" />
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 border shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {getAvatarLabel(agent)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-foreground truncate"
                title={agentDisplayName}
              >
                {agentDisplayName}
              </p>
              <p
                className="text-xs text-muted-foreground truncate"
                title={agent.email}
              >
                {agent.email}
              </p>
            </div>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="capitalize shrink-0"
            >
              {agent.status || "unknown"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <Users className="h-4 w-4" />
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span>
              <span className="font-semibold text-foreground">{total ?? 0}</span>{" "}
              application{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive px-1">{error.message}</p>
      )}

      {/* Application table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <ApplicationTable
          data={applications}
          isLoading={isLoading}
          isFetching={isFetching}
          isKanban={true}
          isArchived={false}
          filters={[]}
          onFilterChange={() => {}}
          onSearch={setQuery}
          searchValue={searchValue}
          onReset={resetFilters}
          isSearchingOrFiltering={isSearchingOrFiltering}
        />
      </div>

      {/* Pagination */}
      <ApplicationListPagination
        page={page}
        maxPage={maxPage}
        isLoading={isLoading}
        isFetching={isFetching}
        onPrev={prevPage}
        onNext={nextPage}
      />
    </div>
  );
}
