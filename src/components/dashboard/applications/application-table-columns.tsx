"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

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
import { Archive, Edit, Trash2 } from "lucide-react";
import { StaffAssignmentSelect } from "@/app/dashboard/application/[id]/_components/StaffAssignmentSelect";
import { toast } from "react-hot-toast";

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getApplicationColumns = (
  role?: USER_ROLE,
  isStaffAdmin?: boolean,
  isArchived?: boolean
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
      size: 120,
      minSize: 100,
      maxSize: 120,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Reference"
          className="text-center"
        />
      ),
      cell: ({ row }) => (
        <div
          className="font-semibold text-foreground truncate"
          title={(row.getValue("referenceNumber") as string) || "N/A"}
        >
          {(row.getValue("referenceNumber") as string) || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "studentName",
      meta: { columnTitle: "Student Name" },
      size: 150,
      minSize: 120,
      maxSize: 180,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student Name" />
      ),
      cell: ({ row }) => (
        <div
          className="text-sm font-medium text-center truncate"
          title={(row.getValue("studentName") as string) || "Unknown student"}
        >
          {(row.getValue("studentName") as string) || "Unknown student"}
        </div>
      ),
    },
    {
      accessorKey: "studentEmail",
      meta: { columnTitle: "Student Email" },
      size: 200,
      minSize: 180,
      maxSize: 240,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student Email" />
      ),
      cell: ({ row }) => (
        <div
          className="text-sm text-muted-foreground text-start truncate"
          title={(row.getValue("studentEmail") as string) || "N/A"}
        >
          {(row.getValue("studentEmail") as string) || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "course",
      meta: { columnTitle: "Course" },
      size: 200,
      minSize: 180,
      maxSize: 250,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Course" />
      ),
      cell: ({ row }) => (
        <div
          className="text-sm text-muted-foreground text-start truncate whitespace-normal"
          title={(row.getValue("course") as string) || "N/A"}
        >
          {(row.getValue("course") as string) || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "destination",
      meta: { columnTitle: "Destination" },
      size: 120,
      minSize: 100,
      maxSize: 150,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Destination" />
      ),
      cell: ({ row }) => (
        <div
          className="text-sm text-start truncate whitespace-normal"
          title={(row.getValue("destination") as string) || "N/A"}
        >
          {(row.getValue("destination") as string) || "N/A"}
        </div>
      ),
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
      cell: ({ row }) => <ApplicationStagePill stage={row.original.stage} />,
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
          {formatDate(row.original.submittedAt)}
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
      cell: ({ row }) => (
        <div
          className="flex justify-start"
          onClick={(e) => e.stopPropagation()}
        >
          {isArchived ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
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
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                >
                  <Archive size={16} className="text-muted-foreground" />
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
                    <Button
                      onClick={() => {
                        toast.success("Application archived.");
                      }}
                    >
                      Archive
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Link
            href={`${siteRoutes.dashboard.application.create}/?id=${row.original.id}&edit=true`}
          >
            <Button
              size="icon-sm"
              variant="ghost"
            >
              <Edit size={16} className="text-muted-foreground" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  if (role === USER_ROLE.AGENT || (role === USER_ROLE.STAFF && !isStaffAdmin)) {
    return baseColumns.filter((column) => column.id !== "assignedTo");
  }

  return baseColumns;
};
