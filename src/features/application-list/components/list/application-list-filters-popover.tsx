"use client";

import { Filter } from "lucide-react";

import {
  ApplicationStagePill,
  applicationStageFilterOptions,
} from "@/components/shared/ApplicationStagePill";
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
import type { StaffMember } from "@/service/staff-members.service";
import type { ApplicationListFilterDraft } from "@/features/application-list/hooks/useApplicationListFilters.hook";

type ApplicationListFiltersPopoverProps = {
  role?: string;
  canFilterStaff: boolean;
  staffMembers: StaffMember[];
  isLoading: boolean;
  isFetching: boolean;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  appliedFilterCount: number;
  filterDraft: ApplicationListFilterDraft;
  stageDraft: string;
  setStageDraft: (stage: string) => void;
  updateFilterDraft: (key: keyof ApplicationListFilterDraft, value: string) => void;
  onClear: () => void;
  onApply: () => void;
  canClear: boolean;
};

export default function ApplicationListFiltersPopover({
  role,
  canFilterStaff,
  staffMembers,
  isLoading,
  isFetching,
  filtersOpen,
  setFiltersOpen,
  appliedFilterCount,
  filterDraft,
  stageDraft,
  setStageDraft,
  updateFilterDraft,
  onClear,
  onApply,
  canClear,
}: ApplicationListFiltersPopoverProps) {
  return (
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
              <p className="text-xs text-muted-foreground">No stage selected.</p>
            )}
            <Select
              value={stageDraft}
              onValueChange={(value) => setStageDraft(value === "all" ? "" : value)}
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
                  updateFilterDraft("studentId", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="agent-id-filter">Agent ID</Label>
              <Input
                id="agent-id-filter"
                placeholder="Agent ID"
                value={filterDraft.agentId}
                onChange={(event) => updateFilterDraft("agentId", event.target.value)}
              />
            </div>
            {canFilterStaff ? (
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="assigned-staff-filter">Assigned staff</Label>
                <Select
                  value={filterDraft.assignedStaffId}
                  onValueChange={(value) =>
                    updateFilterDraft("assignedStaffId", value === "all" ? "" : value)
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
                onChange={(event) => updateFilterDraft("fromDate", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="to-date-filter">To date</Label>
              <Input
                id="to-date-filter"
                type="date"
                value={filterDraft.toDate}
                onChange={(event) => updateFilterDraft("toDate", event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClear} disabled={!canClear}>
              Clear
            </Button>
            <Button size="sm" onClick={onApply} disabled={isLoading || isFetching}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
