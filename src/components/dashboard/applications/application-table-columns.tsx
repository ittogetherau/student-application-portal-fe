/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StaffAssignmentSelect } from "@/app/dashboard/application/[id]/_components/StaffAssignmentSelect";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { siteRoutes } from "@/constants/site-routes";
import { ApplicationTableRow, USER_ROLE } from "@/constants/types";
import {
  useArchiveApplicationMutation,
  useUnarchiveApplicationMutation,
} from "@/hooks/useApplication.hook";
import { formatUtcToFriendlyLocal } from "@/lib/format-utc-to-local";
import { Archive, ArchiveRestore, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ActionCell = ({
  row,
  isArchived,
}: {
  row: any;
  isArchived?: boolean;
}) => {
  const archiveMutation = useArchiveApplicationMutation();
  const unarchiveMutation = useUnarchiveApplicationMutation();

  const handleArchive = async () => {
    try {
      const response = await archiveMutation.mutateAsync(row.original.id);
      if (response.success) {
        toast.success("Application archived.");
      } else {
        toast.error(response.message || "Failed to archive application.");
      }
    } catch (error) {
      toast.error("Failed to archive application.");
    }
  };

  const handleUnarchive = async () => {
    try {
      const response = await unarchiveMutation.mutateAsync(row.original.id);
      if (response.success) {
        toast.success("Application restored.");
      } else {
        toast.error(response.message || "Failed to restore application.");
      }
    } catch (error) {
      toast.error("Failed to restore application.");
    }
  };

  return (
    <div
      className="flex justify-start gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {isArchived ? (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                title="Restore application"
              >
                <ArchiveRestore size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restore application?</DialogTitle>
                <DialogDescription>
                  This will restore the application to the active list.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleUnarchive}>Restore</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                title="Delete permanently"
              >
                <Trash2 size={14} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Permanently delete application?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      toast.success("Application deleted permanently.");
                    }}
                  >
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground"
                title="Archive application"
              >
                <Archive size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archive application?</DialogTitle>
                <DialogDescription>
                  You can restore this application from the archive later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleArchive}>Archive</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link
            href={`${siteRoutes.dashboard.application.create}/?id=${row.original.id}&edit=true`}
          >
            <Button size="icon-sm" variant="ghost" title="Edit application">
              <Edit size={16} className="text-muted-foreground" />
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export const getApplicationColumns = (
  role?: USER_ROLE,
  isStaffAdmin?: boolean,
  isArchived?: boolean,
): ColumnDef<ApplicationTableRow>[] => {
  const baseColumns: ColumnDef<ApplicationTableRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "referenceNumber",
      meta: { columnTitle: "Reference" },
      size: 150,
      minSize: 120,
      maxSize: 180,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reference" />
      ),
      cell: ({ row }) => (
        <div
          className="text-xs"
          title={(row.getValue("referenceNumber") as string) || "N/A"}
        >
          {(row.getValue("referenceNumber") as string) || "N/A"}
        </div>
      ),
    },
    {
      id: "studentIdentifiers",
      accessorFn: (row) =>
        `${row.referenceNumber ?? ""} ${row.studentId ?? ""} ${row.studentEmail ?? ""}`,
      meta: { columnTitle: "Student" },
      size: 220,
      minSize: 200,
      maxSize: 260,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => {
        const name = row.original.studentName ?? "N/A";
        const studentId = row.original.studentId ?? "N/A";
        const email = row.original.studentEmail ?? "N/A";

        return (
          <div className="text-sm text-muted-foreground text-start truncate">
            <div className="truncate" title={name}>
              {name}
            </div>
            <div
              className="text-xs text-muted-foreground/80 truncate"
              title={studentId}
            >
              {studentId}
            </div>
            <div
              className="text-xs text-muted-foreground/80 truncate"
              title={email}
            >
              {email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "agentName",
      meta: { columnTitle: "Agent" },
      size: 200,
      minSize: 180,
      maxSize: 240,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent" />
      ),
      cell: ({ row }) => {
        const agency = row.original.agentAgencyName ?? "";
        const email = row.original.agentEmail ?? "";
        const name = row.original.agentName ?? "";
        const label = agency || name || "N/A";
        const sublabel = email || (agency && name ? name : "");

        return (
          <div className="text-sm text-muted-foreground text-start truncate">
            <div className="truncate" title={label}>
              {label}
            </div>
            {sublabel ? (
              <div
                className="text-xs text-muted-foreground/80 truncate"
                title={sublabel}
              >
                {sublabel}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "course",
      meta: { columnTitle: "Course" },
      size: 220,
      minSize: 200,
      maxSize: 260,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Course" />
      ),
      cell: ({ row }) => {
        // const code = row.original.courseCode || "N/A";
        const name = row.original.course || "N/A";

        return (
          <div className="text-sm text-muted-foreground text-start truncate">
            {/* <div className="truncate" title={code}>
              {code}
            </div> */}
            <div
              className="text-sm text-muted-foreground/80 text-wrap"
              title={name}
            >
              {name}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "stage",
      meta: { columnTitle: "Status" },
      size: 140,
      minSize: 130,
      maxSize: 180,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <ApplicationStagePill
          stage={row.original.stageRaw ?? row.original.stage}
          role={role}
        />
      ),
      filterFn: (row, columnId, filterValues) => {
        if (
          !filterValues ||
          (Array.isArray(filterValues) && filterValues.length === 0)
        ) {
          return true;
        }
        const value = row.getValue(columnId);
        return (filterValues as string[]).includes(String(value));
      },
    },
    {
      id: "assignedTo",
      accessorFn: (row) => row.assignedStaffName ?? "",
      meta: { columnTitle: "Assigned To" },
      size: 150,
      minSize: 130,
      maxSize: 190,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => {
        const assignedStaffName = row.original.assignedStaffName ?? "";

        return (
          <div
            className="text-sm text-start truncate whitespace-normal"
            title={assignedStaffName}
          >
            {role === USER_ROLE.STAFF && isStaffAdmin ? (
              <div onClick={(e) => e.stopPropagation()}>
                <StaffAssignmentSelect
                  applicationId={row.original.id}
                  assignedStaffId={row.original.assignedStaffId}
                  assignedStaffEmail={assignedStaffName || undefined}
                />
              </div>
            ) : (
              assignedStaffName
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "submittedAt",
      meta: { columnTitle: "Submitted" },
      size: 130,
      minSize: 110,
      maxSize: 160,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submitted" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.submittedAt
            ? formatUtcToFriendlyLocal(row.original.submittedAt)
            : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "intake",
      meta: { columnTitle: "Intake" },
      size: 100,
      minSize: 80,
      maxSize: 120,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Intake" />
      ),
      cell: ({ row }) => (
        <div
          className="text-sm text-muted-foreground text-start truncate whitespace-normal"
          title={(row.getValue("intake") as string) || "N/A"}
        >
          {(row.getValue("intake") as string) || "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      meta: { columnTitle: "Actions" },
      size: 140,
      minSize: 120,
      maxSize: 160,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => <ActionCell row={row} isArchived={isArchived} />,
    },
  ];

  if (role === USER_ROLE.AGENT) {
    return baseColumns.filter(
      (column) => column.id !== "assignedTo" && column.id !== "agentName",
    );
  }

  if (role === USER_ROLE.STAFF && !isStaffAdmin) {
    return baseColumns.filter((column) => column.id !== "assignedTo");
  }

  return baseColumns;
};
