"use client";

import * as React from 'react';
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
import { Calendar, Building, ArrowUpDown, Search } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface Application {
    id: string;
    student: string;
    university: string;
    program: string;
    status: string;
    statusColor: string;
    deadline: string;
    submittedDate: string;
}

const data: Application[] = [
    {
        id: 'APP-2024-001',
        student: 'Sarah Chen',
        university: 'University of Toronto',
        program: 'Computer Science',
        status: 'Offer Issued',
        statusColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400',
        deadline: '2025-01-15',
        submittedDate: '2024-11-20',
    },
    {
        id: 'APP-2024-002',
        student: 'Michael Johnson',
        university: 'McGill University',
        program: 'Business Administration',
        status: 'Under Review',
        statusColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400',
        deadline: '2025-01-30',
        submittedDate: '2024-12-01',
    },
    {
        id: 'APP-2024-003',
        student: 'Priya Sharma',
        university: 'UBC',
        program: 'Engineering',
        status: 'Submitted',
        statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400',
        deadline: '2025-02-01',
        submittedDate: '2024-12-10',
    },
    {
        id: 'APP-2024-004',
        student: 'David Kim',
        university: 'York University',
        program: 'Data Science',
        status: 'Draft',
        statusColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        deadline: '2025-02-15',
        submittedDate: '-',
    },
    {
        id: 'APP-2024-005',
        student: 'Emma Wilson',
        university: 'University of Melbourne',
        program: 'Medicine',
        status: 'Accepted',
        statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400',
        deadline: '2025-01-20',
        submittedDate: '2024-11-15',
    },
];

export const columns: ColumnDef<Application>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
                ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
    },
    {
        accessorKey: "student",
        header: "Student",
        cell: ({ row }) => {
            const student = row.getValue("student") as string;
            const initials = student.split(' ').map(n => n[0]).join('');
            return (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {initials}
                    </div>
                    <span className="ml-3 font-medium">{student}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "university",
        header: "University",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{row.getValue("university")}</span>
            </div>
        ),
    },
    {
        accessorKey: "program",
        header: "Program",
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("program")}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const statusColor = row.original.statusColor;
            return (
                <Badge className={statusColor} variant="secondary">
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {row.getValue("deadline")}
            </div>
        ),
    },
];

export function ApplicationsTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <Card className="border-none shadow-sm dark:bg-neutral-900 overflow-hidden">
            <CardHeader className="border-b dark:border-neutral-800 flex flex-row items-center justify-between space-y-0 py-3 px-4">
                <CardTitle className="text-lg font-medium tracking-tight">Recent Applications</CardTitle>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Filter Name..."
                            value={(table.getColumn("student")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("student")?.setFilterValue(event.target.value)
                            }
                            className="pl-9 h-9 w-[200px] lg:w-[300px]"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 dark:bg-neutral-800/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b dark:border-neutral-800 hover:bg-transparent">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="px-4 h-10 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="divide-y dark:divide-neutral-800">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-muted/50 dark:hover:bg-neutral-800/30 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-4 py-2 whitespace-nowrap text-xs">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="px-4 py-3 bg-muted/50 dark:bg-neutral-800/50 border-t dark:border-neutral-800 flex items-center justify-between">
                    <Button variant="link" className="text-primary p-0 h-auto font-medium">
                        View All Applications →
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 rounded-lg px-4"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 rounded-lg px-4"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
