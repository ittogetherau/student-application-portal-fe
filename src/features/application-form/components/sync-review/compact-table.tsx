"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReactNode } from "react";

export function CompactTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {headers.map((header) => (
              <TableHead
                key={header}
                className="h-8 text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y">
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-muted/30">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="py-2 text-sm">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
