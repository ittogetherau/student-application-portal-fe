"use client";
import {
  DataTable,
  type DataTableFacetedFilter,
} from "@/components/data-table/data-table";
import { applicationStageFilterOptions } from "@/components/shared/ApplicationStagePill";
import { Button } from "@/components/ui/button";
import { siteRoutes } from "@/shared/constants/site-routes";
import { USER_ROLE, type ApplicationTableRow } from "@/shared/constants/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import { getApplicationColumns } from "./application-table-columns";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStaffMembersQuery } from "@/features/application-detail/hooks/useStaffMembers.hook";
import {
  useBulkArchiveApplicationsMutation,
  useBulkDeleteApplicationsMutation,
  useBulkUnarchiveApplicationsMutation,
} from "@/shared/hooks/use-applications";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronsUpDown,
  Kanban,
  Plus,
  Table,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ApplicationTableProps {
  data?: ApplicationTableRow[];
  isLoading?: boolean;
  isFetching?: boolean;
  isKanban?: boolean;
  isallowMovingInKanban?: boolean;
  isArchived?: boolean;
  filters?: ColumnFiltersState;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onReset?: () => void;
  isSearchingOrFiltering?: boolean;
  filtersPopover?: React.ReactNode;
}

const APPLICATION_LIST_VIEW_KEY = "application-list:view";

const BulkAssignPopover = ({ selectedCount }: { selectedCount: number }) => {
  const [open, setOpen] = React.useState(false);
  const { data: staffResponse, isLoading } = useStaffMembersQuery();
  const staffMembers = staffResponse?.data || [];

  const handleAssign = (label: string) => {
    toast.success(
      `Assigned ${selectedCount} application${
        selectedCount === 1 ? "" : "s"
      } to ${label}.`,
    );
    setOpen(false);
  };

  const handleUnassign = () => {
    toast.success(
      `Unassigned ${selectedCount} application${
        selectedCount === 1 ? "" : "s"
      }.`,
    );
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          Assign
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search staff..." className="h-9" />
          <CommandList>
            <CommandEmpty>No staff member found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="unassigned" onSelect={handleUnassign}>
                <Check className="mr-2 h-4 w-4 opacity-0" />
                <span className="text-foreground">Assign To</span>
              </CommandItem>
              {staffMembers.map((staff) => {
                if (!staff.staff_profile) return null;

                return (
                  <CommandItem
                    key={staff.id}
                    value={staff.email}
                    onSelect={() => handleAssign(staff.email)}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    <div className="flex flex-col text-foreground">
                      <span>{staff.email}</span>
                      {staff.staff_profile?.department && (
                        <span className="text-xs text-muted-foreground">
                          {staff.staff_profile.department}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const ApplicationTable = ({
  data = [],
  isLoading = false,
  isFetching = false,
  isKanban = false,
  isallowMovingInKanban = false,
  isArchived = false,
  filters: externalFilters,
  onFilterChange,
  searchValue,
  onSearch,
  onReset,
  isSearchingOrFiltering,
  filtersPopover,
}: ApplicationTableProps) => {
  const [view, setView] = React.useState<"table" | "kanban">("table");
  const bulkArchiveMutation = useBulkArchiveApplicationsMutation();
  const bulkDeleteMutation = useBulkDeleteApplicationsMutation();
  const bulkUnarchiveMutation = useBulkUnarchiveApplicationsMutation();

  const { data: session } = useSession();
  const ROLE = React.useMemo(() => {
    const role = session?.user.role;
    return Object.values(USER_ROLE).includes(role as USER_ROLE)
      ? (role as USER_ROLE)
      : undefined;
  }, [session?.user.role]);
  const isStaffAdmin = session?.user.staff_admin;

  const filters = React.useMemo<DataTableFacetedFilter[]>(
    () => [
      {
        columnId: "stage",
        title: "Stage",
        options: applicationStageFilterOptions,
      },
    ],
    [],
  );
  const columns = React.useMemo(
    () => getApplicationColumns(ROLE, isStaffAdmin, isArchived),
    [ROLE, isStaffAdmin, isArchived],
  );

  React.useEffect(() => {
    const savedView = localStorage.getItem(APPLICATION_LIST_VIEW_KEY);
    if (savedView === "table" || savedView === "kanban") {
      setView(savedView);
    }
  }, []);

  const setPersistedView = React.useCallback((nextView: "table" | "kanban") => {
    setView(nextView);
    localStorage.setItem(APPLICATION_LIST_VIEW_KEY, nextView);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      view={view}
      isallowMovingInKanban={isallowMovingInKanban}
      data={data}
      facetedFilters={filtersPopover ? undefined : filters}
      filtersPopover={filtersPopover}
      manualFiltering={true}
      columnFilters={externalFilters}
      onFilterChange={onFilterChange}
      searchValue={searchValue}
      onSearch={onSearch}
      onReset={onReset}
      isSearchingOrFiltering={isSearchingOrFiltering}
      searchableColumns={[
        "referenceNumber",
        "studentName",
        "studentEmail",
        "course",
      ]}
      searchPlaceholder="Search by student, course, email, or reference..."
      emptyState={{
        title: "No applications found",
        description: "Try a different search term or filter combination.",
      }}
      toolbarActions={(table) => {
        const selectedCount = table.getSelectedRowModel().rows.length;
        const selectedApplicationIds = table
          .getSelectedRowModel()
          .rows.map((row) => row.original.id);

        return (
          <div className="flex items-center gap-3">
            {selectedCount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
                {isArchived ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bulkUnarchiveMutation.isPending}
                      onClick={() => {
                        if (!selectedApplicationIds.length) {
                          toast.error("No applications selected.");
                          return;
                        }
                        bulkUnarchiveMutation
                          .mutateAsync(selectedApplicationIds)
                          .then((response) => {
                            if (response.success) {
                              toast.success("Restored selected applications.");
                              table.resetRowSelection();
                            } else {
                              toast.error(
                                response.message ||
                                  "Failed to restore applications.",
                              );
                            }
                          })
                          .catch(() => {
                            toast.error("Failed to restore applications.");
                          });
                      }}
                    >
                      <ArchiveRestore />
                      Restore all
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 />
                          Delete all
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Delete selected applications?
                          </DialogTitle>
                          <DialogDescription>
                            This will permanently delete {selectedCount}{" "}
                            archived application
                            {selectedCount === 1 ? "" : "s"}.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="destructive"
                              disabled={bulkDeleteMutation.isPending}
                              onClick={() => {
                                if (!selectedApplicationIds.length) {
                                  toast.error("No applications selected.");
                                  return;
                                }
                                bulkDeleteMutation
                                  .mutateAsync(selectedApplicationIds)
                                  .then((response) => {
                                    if (response.success) {
                                      toast.success(
                                        "Deleted selected applications.",
                                      );
                                      table.resetRowSelection();
                                    } else {
                                      toast.error(
                                        response.message ||
                                          "Failed to delete applications.",
                                      );
                                    }
                                  })
                                  .catch(() => {
                                    toast.error(
                                      "Failed to delete applications.",
                                    );
                                  });
                              }}
                            >
                              Delete all
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <>
                    {ROLE === USER_ROLE.STAFF && isStaffAdmin ? (
                      <BulkAssignPopover selectedCount={selectedCount} />
                    ) : null}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Archive />
                          Archive all
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Archive selected applications?
                          </DialogTitle>
                          <DialogDescription>
                            This will archive {selectedCount} application
                            {selectedCount === 1 ? "" : "s"}.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              disabled={bulkArchiveMutation.isPending}
                              onClick={() => {
                                if (!selectedApplicationIds.length) {
                                  toast.error("No applications selected.");
                                  return;
                                }
                                bulkArchiveMutation
                                  .mutateAsync(selectedApplicationIds)
                                  .then((response) => {
                                    if (response.success) {
                                      toast.success(
                                        "Archived selected applications.",
                                      );
                                      table.resetRowSelection();
                                    } else {
                                      toast.error(
                                        response.message ||
                                          "Failed to archive applications.",
                                      );
                                    }
                                  })
                                  .catch(() => {
                                    toast.error(
                                      "Failed to archive applications.",
                                    );
                                  });
                              }}
                            >
                              Archive all
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            ) : null}

            {isFetching ? (
              <span className="text-xs text-muted-foreground">
                Refreshing...
              </span>
            ) : null}

            {/* {ROLE === USER_ROLE.AGENT && ( )} */}

            <Link href={siteRoutes.dashboard.application.create}>
              <Button size="sm">
                <Plus /> New Application
              </Button>
            </Link>

            {isKanban ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (view === "kanban") {
                    setPersistedView("table");
                  } else {
                    setPersistedView("kanban");
                  }
                }}
              >
                {view === "kanban" ? (
                  <>
                    <Table /> Table
                  </>
                ) : (
                  <>
                    <Kanban /> Kanban
                  </>
                )}
              </Button>
            ) : null}
          </div>
        );
      }}
      enableLocalPagination={false}
    />
  );
};
