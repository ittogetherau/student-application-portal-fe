"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import type { DataTableFacetedFilterOption } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { siteRoutes } from "@/constants/site-routes";
import { Application, APPLICATION_STAGE } from "@/constants/types";
import { cn } from "@/lib/utils";

const STAGE_CONFIG: Record<
  APPLICATION_STAGE,
  { label: string; className: string }
> = {
  [APPLICATION_STAGE.DRAFT]: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-100",
  },
  [APPLICATION_STAGE.SUBMITTED]: {
    label: "Submitted",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  },
  [APPLICATION_STAGE.STAFF_REVIEW]: {
    label: "Staff Review",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  },
  [APPLICATION_STAGE.AWAITING_DOCUMENTS]: {
    label: "Awaiting Documents",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200",
  },
  [APPLICATION_STAGE.GS_ASSESSMENT]: {
    label: "GS Assessment",
    className:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200",
  },
  [APPLICATION_STAGE.OFFER_GENERATED]: {
    label: "Offer Generated",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200",
  },
  [APPLICATION_STAGE.OFFER_ACCEPTED]: {
    label: "Offer Accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  [APPLICATION_STAGE.ENROLLED]: {
    label: "Enrolled",
    className:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
  },
  [APPLICATION_STAGE.REJECTED]: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
  },
  [APPLICATION_STAGE.WITHDRAWN]: {
    label: "Withdrawn",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200",
  },
};

export const applicationStageFilterOptions: DataTableFacetedFilterOption[] =
  Object.entries(STAGE_CONFIG).map(([stage, config]) => ({
    value: stage,
    label: config.label,
  }));

const StatusPill = ({ stage }: { stage: APPLICATION_STAGE }) => {
  const config = STAGE_CONFIG[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config?.className
      )}
    >
      {config?.label ?? stage}
    </span>
  );
};

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

export const applicationColumns: ColumnDef<Application>[] = [
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
    cell: ({ row }) => <StatusPill stage={row.original.stage} />,
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
    accessorKey: "assignedStaffName",
    meta: { columnTitle: "Assigned To" },
    size: 150,
    minSize: 130,
    maxSize: 190,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned To" />
    ),
    cell: ({ row }) => (
      <div
        className="text-sm text-start truncate whitespace-normal"
        title={(row.getValue("assignedStaffName") as string) || "Unassigned"}
      >
        {(row.getValue("assignedStaffName") as string) || "Unassigned"}
      </div>
    ),
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
      <div className="flex justify-start">
        <Button asChild size="sm" variant="ghost" className="px-2">
          <Link
            href={`${siteRoutes.dashboard.application.root}/${row.original.id}`}
          >
            View
          </Link>
        </Button>
      </div>
    ),
  },
];
