"use client";

import * as React from "react";
import { FileText, Edit3, Trash2, Clock, Plus } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { siteRoutes } from "@/shared/constants/site-routes";
import { useRouter } from "next/navigation";

export interface DraftApplication {
  id: string;
  applicationUuid: string;
  studentName: string;
  university: string;
  program: string;
  lastEdited: string;
  completionPercent: number;
}

interface DraftApplicationsProps {
  draftApplications: DraftApplication[];
}

export function DraftApplications({
  draftApplications,
}: DraftApplicationsProps) {
  const router = useRouter();

  const columns = React.useMemo<ColumnDef<DraftApplication>[]>(
    () => [
      {
        accessorKey: "studentName",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue("studentName")}</span>
            <Badge variant="secondary">{row.original.id}</Badge>
          </div>
        ),
      },
      {
        accessorKey: "university",
        header: "University",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("university")}</span>
        ),
      },
      {
        accessorKey: "program",
        header: "Program",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.getValue("program")}
          </span>
        ),
      },
      {
        accessorKey: "lastEdited",
        header: "Last Edited",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Last edited {row.getValue("lastEdited")}
          </div>
        ),
      },
      {
        accessorKey: "completionPercent",
        header: "Completion",
        cell: ({ row }) => {
          const percent = row.getValue("completionPercent") as number;
          return (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-medium">{percent}%</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: () => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: draftApplications,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Draft Applications</CardTitle>
              <CardDescription>
                {draftApplications.length} applications in progress
              </CardDescription>
            </div>
          </div>

          <Link href={siteRoutes.dashboard.application.create}>
            <Button>
              <Plus />
              New Draft
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 h-10 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(
                        siteRoutes.dashboard.application.id.root(
                          row.original.applicationUuid,
                        ),
                      )
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 whitespace-nowrap"
                        onClick={(event) => {
                          if (cell.column.id === "actions") {
                            event.stopPropagation();
                          }
                        }}
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="py-8">
                      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No draft applications
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start a new application to see it here
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
