"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/features/threads/components/empty-state";
import ThreadListItem from "@/features/threads/components/thread-list-item";
import { useStaffThreadsQuery } from "@/features/threads/hooks/application-threads.hook";
import type {
  StaffThreadFilters,
  StaffThreadSummary,
} from "@/service/application-threads.service";
import { USER_ROLE } from "@/shared/constants/types";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { MessageSquare, X } from "lucide-react";
import type { UseQueryStateReturn } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import TasksFiltersPopover, {
  DEFAULT_TASKS_POPOVER_FILTERS,
  TASKS_POPOVER_FILTER_KEYS,
  type TasksPopoverFilterState,
} from "./tasks-filters-popover";

const THREADS_PER_PAGE = 10;

type TasksListSidebarProps = {
  selectedThreadId: string | null;
  selectedApplicationId: string | null;
  setSelectedThreadId: UseQueryStateReturn<string, undefined>[1];
  setSelectedApplicationId: UseQueryStateReturn<string, undefined>[1];
};

export default function TasksListSidebar({
  selectedThreadId,
  selectedApplicationId,
  setSelectedThreadId,
  setSelectedApplicationId,
}: TasksListSidebarProps) {
  const { role } = useRoleFlags();
  const showAssignedStaff = role === USER_ROLE.STAFF;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [draftFilters, setDraftFilters] = useState<TasksPopoverFilterState>(
    DEFAULT_TASKS_POPOVER_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<TasksPopoverFilterState>(
    DEFAULT_TASKS_POPOVER_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasPendingFilterChanges = useMemo(() => {
    return TASKS_POPOVER_FILTER_KEYS.some(
      (key) => draftFilters[key] !== appliedFilters[key],
    );
  }, [appliedFilters, draftFilters]);

  const hasActiveFilters = useMemo(
    () =>
      !!searchTerm.trim() ||
      !!appliedFilters.student.trim() ||
      !!appliedFilters.staff.trim() ||
      !!appliedFilters.agent.trim() ||
      !!appliedFilters.agentId.trim() ||
      !!appliedFilters.section.trim() ||
      !!appliedFilters.createdDate.trim() ||
      !!appliedFilters.deadlineDate.trim() ||
      appliedFilters.activeAgent !== "all" ||
      appliedFilters.status !== "all" ||
      appliedFilters.priority !== "all",
    [appliedFilters, searchTerm],
  );

  const hasActiveOptions = useMemo(
    () =>
      hasActiveFilters ||
      appliedFilters.sortBy !== DEFAULT_TASKS_POPOVER_FILTERS.sortBy ||
      appliedFilters.sortOrder !== DEFAULT_TASKS_POPOVER_FILTERS.sortOrder,
    [appliedFilters.sortBy, appliedFilters.sortOrder, hasActiveFilters],
  );

  const staffThreadFilters = useMemo<StaffThreadFilters>(
    () => ({
      title: debouncedSearchTerm.trim() || undefined,
      s_student: appliedFilters.student.trim() || undefined,
      s_staff: appliedFilters.staff.trim() || undefined,
      agent: appliedFilters.agent.trim() || undefined,
      agent_id: appliedFilters.agentId.trim() || undefined,
      status:
        appliedFilters.status !== "all" ? appliedFilters.status : undefined,
      priority:
        appliedFilters.priority !== "all" ? appliedFilters.priority : undefined,
      date: appliedFilters.createdDate.trim() || undefined,
      deadline: appliedFilters.deadlineDate.trim() || undefined,
      section: appliedFilters.section.trim() || undefined,
      active_agent:
        appliedFilters.activeAgent === "all"
          ? undefined
          : appliedFilters.activeAgent === "active",
      sort_by: appliedFilters.sortBy,
      sort_order: appliedFilters.sortOrder,
    }),
    [appliedFilters, debouncedSearchTerm],
  );

  const { data, isLoading, isFetching, error } =
    useStaffThreadsQuery(staffThreadFilters);

  const staffThreads = useMemo(() => data?.data ?? [], [data]);

  const totalPages = Math.max(
    1,
    Math.ceil(staffThreads.length / THREADS_PER_PAGE),
  );
  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  const paginatedThreads = useMemo(() => {
    const startIndex = (resolvedCurrentPage - 1) * THREADS_PER_PAGE;
    return staffThreads.slice(startIndex, startIndex + THREADS_PER_PAGE);
  }, [resolvedCurrentPage, staffThreads]);

  useEffect(() => {
    if (staffThreads.length === 0) {
      if (selectedThreadId || selectedApplicationId) {
        void setSelectedThreadId(null);
        void setSelectedApplicationId(null);
      }
      return;
    }

    if (!selectedThreadId) {
      void setSelectedThreadId(staffThreads[0].id);
      void setSelectedApplicationId(staffThreads[0].application_id);
      return;
    }

    const selectedStillVisible = staffThreads.some(
      (thread) => thread.id === selectedThreadId,
    );
    if (!selectedStillVisible) {
      void setSelectedThreadId(staffThreads[0].id);
      void setSelectedApplicationId(staffThreads[0].application_id);
      return;
    }

    if (selectedThreadId && !selectedApplicationId) {
      const matchingThread = staffThreads.find(
        (thread) => thread.id === selectedThreadId,
      );
      if (matchingThread) {
        void setSelectedApplicationId(matchingThread.application_id);
      }
    }
  }, [
    staffThreads,
    selectedThreadId,
    selectedApplicationId,
    setSelectedApplicationId,
    setSelectedThreadId,
  ]);

  const handleSelectThread = (thread: StaffThreadSummary) => {
    void setSelectedThreadId(thread.id);
    void setSelectedApplicationId(thread.application_id);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDraftFilters(DEFAULT_TASKS_POPOVER_FILTERS);
    setAppliedFilters(DEFAULT_TASKS_POPOVER_FILTERS);
    setCurrentPage(1);
  };

  return (
    <aside className="col-span-2 border-r flex flex-col bg-muted/20 overflow-hidden">
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <h2 className="text-base font-semibold">Communication Threads</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {staffThreads.length}{" "}
          {staffThreads.length === 1 ? "thread" : "threads"}
          {hasActiveFilters ? " (filtered)" : ""}
        </p>

        <div className="mt-3 flex flex-col gap-px sm:flex-row sm:items-center">
          <Input
            placeholder="Search threads..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="sm:flex-1"
          />
          <div className="flex items-center gap-2">
            <TasksFiltersPopover
              draftFilters={draftFilters}
              setDraftFilters={setDraftFilters}
              onApply={applyFilters}
              applyDisabled={!hasPendingFilterChanges}
            />
            {hasActiveOptions ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={clearFilters}
                aria-label="Clear filters"
              >
                <X size={14} />
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading || isFetching ? (
          <div className="text-sm text-muted-foreground p-3">Loading...</div>
        ) : error ? (
          <div className="text-sm text-destructive p-3">Load failed</div>
        ) : staffThreads.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            text={hasActiveFilters ? "No matching threads" : "No threads"}
          />
        ) : (
          <div className="space-y-1">
            {paginatedThreads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === selectedThreadId}
                showAssignedStaff={showAssignedStaff}
                onSelect={() => handleSelectThread(thread)}
              />
            ))}
          </div>
        )}
      </div>

      {!isLoading && !error && staffThreads.length > 0 ? (
        <div className="border-t p-2">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{`Page ${resolvedCurrentPage} of ${totalPages}`}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.max(1, resolvedCurrentPage - 1))
                }
                disabled={resolvedCurrentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, resolvedCurrentPage + 1))
                }
                disabled={resolvedCurrentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
