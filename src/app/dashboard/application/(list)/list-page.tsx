"use client";

import {
  ApplicationStagePill,
  applicationStageFilterOptions,
} from "@/components/shared/ApplicationStagePill";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useStaffMembersQuery from "@/features/application-detail/hooks/useStaffMembers.hook";
import { ApplicationTable } from "@/features/application-list/components/table/application-table";
import useApplications from "@/features/application-list/hooks/useApplications.hook";
import { USER_ROLE } from "@/shared/constants/types";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

type props = {
  isArchived?: boolean;
};

const ApplicationListPage = ({ isArchived = false }: props) => {
  const { data: session } = useSession();
  const role = session?.user.role;
  const canFilterStaff = role === USER_ROLE.STAFF;
  const { data: staffResponse } = useStaffMembersQuery({
    enabled: canFilterStaff,
  });
  const staffMembers = staffResponse?.data ?? [];
  const {
    applications,
    total,
    page,
    perPage,
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
    filters: isArchived ? { archivedOnly: true } : {},
    storeKey: isArchived ? "applications-archived" : "applications",
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterDraft, setFilterDraft] = useState({
    studentId: extraFilters.studentId ?? "",
    agentId: extraFilters.agentId ?? "",
    assignedStaffId: extraFilters.assignedStaffId ?? "",
    fromDate: extraFilters.fromDate ?? "",
    toDate: extraFilters.toDate ?? "",
  });
  const [stageDraft, setStageDraft] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setFilterDraft({
      studentId: extraFilters.studentId ?? "",
      agentId: extraFilters.agentId ?? "",
      assignedStaffId: extraFilters.assignedStaffId ?? "",
      fromDate: extraFilters.fromDate ?? "",
      toDate: extraFilters.toDate ?? "",
    });
  }, [
    extraFilters.agentId,
    extraFilters.assignedStaffId,
    extraFilters.fromDate,
    extraFilters.studentId,
    extraFilters.toDate,
  ]);

  useEffect(() => {
    const stageFilter = columnFilters.find((f) => f.id === "stage")?.value as
      | string[]
      | undefined;
    setStageDraft(stageFilter?.[0] ?? "");
  }, [columnFilters]);

  const handleResetAll = () => {
    setColumnFilters([]);
    setStageDraft("");
    resetFilters();
  };

  const disableNext = isLoading || isFetching || page >= maxPage;
  const heading =
    isLoading && !applications.length
      ? isArchived
        ? "Loading archived applications..."
        : "Loading applications..."
      : isArchived
        ? `Archived Applications (${total ?? 0})`
        : `Applications (${total ?? 0})`;

  const range = useMemo(() => {
    if (!total) {
      return { start: 0, end: 0 };
    }
    const start = (page - 1) * perPage + 1;
    const end = Math.min(total, page * perPage);
    return { start, end };
  }, [page, perPage, total]);

  const applyExtraFilters = () => {
    const trimmedStage = stageDraft.trim();
    setColumnFilters(
      trimmedStage ? [{ id: "stage", value: [trimmedStage] }] : [],
    );
    setExtraFilters({
      studentId: filterDraft.studentId.trim() || undefined,
      agentId: filterDraft.agentId.trim() || undefined,
      assignedStaffId: canFilterStaff
        ? filterDraft.assignedStaffId || undefined
        : undefined,
      fromDate: filterDraft.fromDate || undefined,
      toDate: filterDraft.toDate || undefined,
      stage: trimmedStage || undefined,
      archivedOnly: isArchived ? true : undefined,
    });
    setFiltersOpen(false);
  };

  const hasFilterDraft =
    !!stageDraft ||
    filterDraft.studentId ||
    filterDraft.agentId ||
    (canFilterStaff && filterDraft.assignedStaffId) ||
    filterDraft.fromDate ||
    filterDraft.toDate;

  const appliedStageCount =
    (
      columnFilters.find((filter) => filter.id === "stage")?.value as
        | string[]
        | undefined
    )?.length ?? 0;
  const appliedFilterCount =
    appliedStageCount +
    (extraFilters.studentId ? 1 : 0) +
    (extraFilters.agentId ? 1 : 0) +
    (extraFilters.assignedStaffId ? 1 : 0) +
    (extraFilters.fromDate ? 1 : 0) +
    (extraFilters.toDate ? 1 : 0);

  const filtersPopover = (
    <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Filter className="h-3.5 w-3.5" />
          Filters
          {appliedFilterCount > 0 ? (
            <span className="rounded-sm bg-primary/10 px-1 text-[10px] font-semibold text-primary">
              {appliedFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px] p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stage
            </p>
            {stageDraft ? (
              <ApplicationStagePill stage={stageDraft} role={role} />
            ) : (
              <p className="text-xs text-muted-foreground">
                No stage selected.
              </p>
            )}
            <Select
              value={stageDraft}
              onValueChange={(value) =>
                setStageDraft(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {applicationStageFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="student-id-filter">Student ID</Label>
              <Input
                id="student-id-filter"
                placeholder="Student ID"
                value={filterDraft.studentId}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    studentId: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="agent-id-filter">Agent ID</Label>
              <Input
                id="agent-id-filter"
                placeholder="Agent ID"
                value={filterDraft.agentId}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    agentId: event.target.value,
                  }))
                }
              />
            </div>
            {canFilterStaff ? (
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="assigned-staff-filter">Assigned staff</Label>
                <Select
                  value={filterDraft.assignedStaffId}
                  onValueChange={(value) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      assignedStaffId: value === "all" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger id="assigned-staff-filter">
                    <SelectValue placeholder="All staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All staff</SelectItem>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name || staff.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="from-date-filter">From date</Label>
              <Input
                id="from-date-filter"
                type="date"
                value={filterDraft.fromDate}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    fromDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="to-date-filter">To date</Label>
              <Input
                id="to-date-filter"
                type="date"
                value={filterDraft.toDate}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    toDate: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              disabled={!hasFilterDraft && !isSearchingOrFiltering}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={applyExtraFilters}
              disabled={isLoading || isFetching}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <ContainerLayout className=" space-y-4 pt-5 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {heading}
          </h1>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Error loading applications</p>
          <p className="mt-1 text-xs opacity-90">{error.message}</p>
        </div>
      ) : null}

      <div className=" ">
        <ApplicationTable
          data={applications}
          isLoading={isLoading}
          isFetching={isFetching}
          isKanban={true}
          isArchived={isArchived}
          filters={columnFilters}
          onFilterChange={setColumnFilters}
          onSearch={setQuery}
          searchValue={searchValue}
          onReset={handleResetAll}
          isSearchingOrFiltering={isSearchingOrFiltering}
          filtersPopover={filtersPopover}
        />
      </div>

      <div className="flex items-center gap-4 justify-between">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="font-medium">{`Page ${page} of ${
            maxPage || 1
          }`}</span>
          {/* <span>
            {`Showing ${range.start}-${range.end} of ${total} application${
              total === 1 ? "" : "s"
            }`}
          </span> */}
        </div>

        <div className="flex items-center gap-2">
          {/* <Select
            value={String(perPage)}
            onValueChange={(value) => {
              const next = Number(value);
              if (!Number.isNaN(next)) {
                setPerPage(next);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 15, 25, 50, 100, 200, 500].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={isLoading || isFetching || page <= 1}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={disableNext}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </ContainerLayout>
  );
};

export default ApplicationListPage;
