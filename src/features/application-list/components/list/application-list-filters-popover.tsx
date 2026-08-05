"use client";

import { useMemo } from "react";
import { Filter } from "lucide-react";

import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
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
import {
  getRoleStatusLabel,
} from "@/shared/config/application-stage.config";
import { APPLICATION_STAGE } from "@/shared/constants/types";
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
  const stageOptions = useMemo(
    () =>
      (Object.values(APPLICATION_STAGE) as string[]).map((stage) => ({
        value: stage,
        label:
          getRoleStatusLabel(stage as APPLICATION_STAGE, role) ??
          String(stage).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    [role],
  );

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
                {stageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="student-name-filter">Student name</Label>
              <Input
                id="student-name-filter"
                placeholder="Student name"
                value={filterDraft.studentName}
                onChange={(event) =>
                  updateFilterDraft("studentName", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="agent-name-filter">Agent name</Label>
              <Input
                id="agent-name-filter"
                placeholder="Agent name"
                value={filterDraft.agentName}
                onChange={(event) =>
                  updateFilterDraft("agentName", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="agent-email-filter">Agent email</Label>
              <Input
                id="agent-email-filter"
                placeholder="Agent email"
                value={filterDraft.agentEmail}
                onChange={(event) =>
                  updateFilterDraft("agentEmail", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="student-origin-filter">Student origin</Label>
              <Select
                value={filterDraft.studentOrigin || "all"}
                onValueChange={(value) =>
                  updateFilterDraft("studentOrigin", value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="student-origin-filter">
                  <SelectValue placeholder="All origins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All origins</SelectItem>
                  <SelectItem value="offshore">Offshore</SelectItem>
                  <SelectItem value="onshore">Onshore</SelectItem>
                  <SelectItem value="domestic">Domestic</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="col-span-1 grid grid-cols-2 gap-3 md:col-span-2">
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
