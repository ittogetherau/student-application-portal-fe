"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { USER_ROLE } from "@/shared/constants/types";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { Filter } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export type TasksPopoverFilterState = {
  student: string;
  staff: string;
  agent: string;
  agentId: string;
  section: string;
  createdDate: string;
  deadlineDate: string;
  activeAgent: "all" | "active" | "inactive";
  status: string;
  priority: string;
  sortBy: "created_at" | "deadline";
  sortOrder: "asc" | "desc";
};

export const DEFAULT_TASKS_POPOVER_FILTERS: TasksPopoverFilterState = {
  student: "",
  staff: "",
  agent: "",
  agentId: "",
  section: "",
  createdDate: "",
  deadlineDate: "",
  activeAgent: "all",
  status: "all",
  priority: "all",
  sortBy: "created_at",
  sortOrder: "desc",
};

export const TASKS_POPOVER_FILTER_KEYS: ReadonlyArray<
  keyof TasksPopoverFilterState
> = [
  "student",
  "staff",
  "agent",
  "agentId",
  "section",
  "createdDate",
  "deadlineDate",
  "activeAgent",
  "status",
  "priority",
  "sortBy",
  "sortOrder",
];

type TasksFiltersPopoverProps = {
  draftFilters: TasksPopoverFilterState;
  setDraftFilters: Dispatch<SetStateAction<TasksPopoverFilterState>>;
  onApply: () => void;
  applyDisabled: boolean;
};

export default function TasksFiltersPopover({
  draftFilters,
  setDraftFilters,
  onApply,
  applyDisabled,
}: TasksFiltersPopoverProps) {
  const { role, isAgent, isStaffAdmin } = useRoleFlags();

  const canShowStaffFilter = role === USER_ROLE.STAFF && isStaffAdmin;
  const canShowAgentFilter = !isAgent;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Filter />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Student</p>
            <Input
              value={draftFilters.student}
              onChange={(e) => {
                const value = e.target.value;
                setDraftFilters((prev) => ({
                  ...prev,
                  student: value,
                }));
              }}
              className="h-9 text-xs w-full"
              placeholder="Search student by name or email"
            />
          </div>

          {canShowStaffFilter ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Staff</p>
              <Input
                value={draftFilters.staff}
                onChange={(e) => {
                  const value = e.target.value;
                  setDraftFilters((prev) => ({
                    ...prev,
                    staff: value,
                  }));
                }}
                className="h-9 text-xs w-full"
                placeholder="Search staff by name or email"
              />
            </div>
          ) : null}

          {canShowAgentFilter ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Agent</p>
              <Input
                value={draftFilters.agent}
                onChange={(e) => {
                  const value = e.target.value;
                  setDraftFilters((prev) => ({
                    ...prev,
                    agent: value,
                  }));
                }}
                className="h-9 text-xs w-full"
                placeholder="Search agent by name or email"
              />
            </div>
          ) : null}

          {/* Section filter (disabled for now)
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Section</p>
            <Input
              value={draftFilters.section}
              onChange={(e) => {
                const value = e.target.value;
                setDraftFilters((prev) => ({
                  ...prev,
                  section: value,
                }));
              }}
              className="h-9 text-xs w-full"
              placeholder="Target section"
            />
          </div>
          */}

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Created Date</p>
            <Input
              type="date"
              value={draftFilters.createdDate}
              onChange={(e) => {
                const value = e.target.value;
                setDraftFilters((prev) => ({
                  ...prev,
                  createdDate: value,
                }));
              }}
              className="h-9 text-xs w-full"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Deadline Date</p>
            <Input
              type="date"
              value={draftFilters.deadlineDate}
              onChange={(e) => {
                const value = e.target.value;
                setDraftFilters((prev) => ({
                  ...prev,
                  deadlineDate: value,
                }));
              }}
              className="h-9 text-xs w-full"
            />
          </div>

          {/* Agent Account filter (disabled for now)
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Agent Account</p>
            <Select
              value={draftFilters.activeAgent}
              onValueChange={(value) => {
                setDraftFilters((prev) => ({
                  ...prev,
                  activeAgent: value as TasksPopoverFilterState["activeAgent"],
                }));
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Agent Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="inactive">Inactive only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          */}

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Status</p>
            <Select
              value={draftFilters.status}
              onValueChange={(value) => {
                setDraftFilters((prev) => ({
                  ...prev,
                  status: value,
                }));
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Priority</p>
            <Select
              value={draftFilters.priority}
              onValueChange={(value) => {
                setDraftFilters((prev) => ({
                  ...prev,
                  priority: value,
                }));
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sort By</p>
            <Select
              value={draftFilters.sortBy}
              onValueChange={(value) => {
                setDraftFilters((prev) => ({
                  ...prev,
                  sortBy: value as TasksPopoverFilterState["sortBy"],
                }));
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created (default)</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order filter (disabled for now)
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sort Order</p>
            <Select
              value={draftFilters.sortOrder}
              onValueChange={(value) => {
                setDraftFilters((prev) => ({
                  ...prev,
                  sortOrder: value as TasksPopoverFilterState["sortOrder"],
                }));
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc (default)</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          */}

          <div className="flex justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onApply}
              disabled={applyDisabled}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
