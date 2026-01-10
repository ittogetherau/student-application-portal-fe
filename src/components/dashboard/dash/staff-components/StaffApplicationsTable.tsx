"use client";

import * as React from "react";
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
import { Search, Download, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const columns: ColumnDef<Application>[] = [
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
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "secondary";
      let className = "";

      switch (status) {
        case "Under Review":
          className = "bg-primary/10 text-primary border-none";
          break;
        case "Pending Decision":
          className =
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-none";
          break;
        case "Approved":
          className =
            "bg-green-500/10 text-green-700 dark:text-green-400 border-none";
          break;
        case "Rejected":
          className =
            "bg-red-500/10 text-red-700 dark:text-red-400 border-none";
          break;
      }

      return (
        <Badge
          variant={variant}
          className={`text-[10px] font-medium uppercase tracking-wider rounded-full ${className}`}
        >
          {status}
        </Badge>
      );
    },
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
              <Input
                placeholder="Filter students..."
                value={
                  (table
                    .getColumn("studentName")
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table
                    .getColumn("studentName")
                    ?.setFilterValue(event.target.value)
                }
                className="pl-9 h-9 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl text-xs focus-visible:ring-2 focus-visible:ring-primary/20 ring-1 ring-neutral-200 dark:ring-neutral-700"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={
                  (table.getColumn("status")?.getFilterValue() as string) ??
                  "all"
                }
                onValueChange={(value) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-[130px] h-9 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary/20 ring-1 ring-neutral-200 dark:ring-neutral-700">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-800">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Pending Decision">
                    Pending Decision
                  </SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  (table.getColumn("intake")?.getFilterValue() as string) ??
                  "all"
                }
                onValueChange={(value) =>
                  table
                    .getColumn("intake")
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-[130px] h-9 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary/20 ring-1 ring-neutral-200 dark:ring-neutral-700">
                  <SelectValue placeholder="All Intakes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-800">
                  <SelectItem value="all">All Intakes</SelectItem>
                  <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                  <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                  <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                </SelectContent>
              </Select>

              <Button>
                <Download className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Export
                </span>
              </Button>
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
                            header.getContext()
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
                        cell.getContext()
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

      <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-card">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Showing{" "}
            <span className="text-neutral-900 dark:text-neutral-100 font-bold">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="text-neutral-900 dark:text-neutral-100 font-bold">
              {data.length}
            </span>{" "}
            results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors h-9"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors h-9"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
