"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import * as React from "react";

import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";

export interface Application {
  id: string;
  studentName: string;
  program: string;
  intake: string;
  agent: string;
  status: string;
  priority: "High" | "Medium" | "Low";
  daysInReview: number;
  assignedTo: string;
}

const getColumns = (role?: string): ColumnDef<Application>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium text-xs uppercase tracking-wider p-0 hover:bg-transparent"
        >
          Application ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-primary hover:underline cursor-pointer">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "studentName",
    header: "Student",
    cell: ({ row }) => (
      <div className="font-medium text-neutral-900 dark:text-neutral-100">
        {row.getValue("studentName")}
      </div>
    ),
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) => (
      <div className="text-neutral-600 dark:text-neutral-400">
        {row.getValue("program")}
      </div>
    ),
  },
  {
    accessorKey: "intake",
    header: "Intake",
    cell: ({ row }) => (
      <div className="text-neutral-600 dark:text-neutral-400">
        {row.getValue("intake")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <ApplicationStagePill
        stage={row.getValue("status") as string}
        className="text-[10px] font-medium uppercase tracking-wider"
        role={role}
      />
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      let className = "";

      switch (priority) {
        case "High":
          className =
            "bg-red-500/10 text-red-700 dark:text-red-400 border-none";
          break;
        case "Medium":
          className =
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-none";
          break;
        case "Low":
          className =
            "bg-green-500/10 text-green-700 dark:text-green-400 border-none";
          break;
      }

      return (
        <Badge
          variant="secondary"
          className={`text-[10px] font-medium uppercase tracking-wider rounded-full ${className}`}
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "daysInReview",
    header: "Wait Time",
    cell: ({ row }) => {
      const days = row.getValue("daysInReview") as number;
      return (
        <div
          className={`font-medium text-sm ${
            days > 7 ? "text-red-500" : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          {days} days
        </div>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned",
    cell: ({ row }) => (
      <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {row.getValue("assignedTo")}
      </div>
    ),
  },
];

interface StaffApplicationsTableProps {
  data: Application[];
}

export function StaffApplicationsTable({ data }: StaffApplicationsTableProps) {
  const { data: session } = useSession();
  const role = session?.user.role;
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(() => getColumns(role), [role]);
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="bg-card border-none shadow-none w-full">
      <div className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
                Priority Applications
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                Manage and review urgent application requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border-none overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader className="bg-neutral-50 dark:bg-neutral-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-neutral-100 dark:border-neutral-800 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-4 h-10 text-[10px] font-medium text-neutral-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-2 whitespace-nowrap text-xs"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
