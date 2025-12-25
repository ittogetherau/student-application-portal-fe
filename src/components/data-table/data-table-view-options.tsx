"use client";

import * as React from "react";
import { Table, Column, VisibilityState } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  columnVisibility: VisibilityState;
}

type ColumnMeta = {
  columnTitle?: string;
};

const formatColumnLabel = (id: string) =>
  id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * A sub-component for each column toggle to ensure independent and reactive rendering.
 */
function ColumnToggleItem<TData>({
  column,
  columnVisibility, // Watch this prop specifically
}: {
  column: Column<TData>;
  columnVisibility: VisibilityState;
}) {
  const [isChecked, setIsChecked] = React.useState(column.getIsVisible());

  // Explicit synchronization as requested by the user
  React.useEffect(() => {
    setIsChecked(column.getIsVisible());
  }, [columnVisibility, column]);

  const metaTitle = (column.columnDef.meta as ColumnMeta | undefined)?.columnTitle;
  const label = metaTitle ?? formatColumnLabel(column.id);

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        column.toggleVisibility();
      }}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={() => {
          column.toggleVisibility();
        }}
        className="pointer-events-none"
      />
      <span className="capitalize">{label}</span>
    </DropdownMenuItem>
  );
}

export function DataTableViewOptions<TData>({
  table,
  columnVisibility, // Received from parent DataTable via Toolbar
}: DataTableViewOptionsProps<TData>) {
  // Use a local state to force a re-render of this component if navigation/clicks happen
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex gap-2"
        >
          <Settings2 className="h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]" onPointerDownOutside={(e) => {
        // Sometimes clicking outside doesn't sync properly if state is mid-update
        forceUpdate();
      }}>
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <ColumnToggleItem
                key={column.id}
                column={column}
                columnVisibility={columnVisibility}
              />
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


