"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/service/sub-agents.service";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import type { ColumnDef } from "@tanstack/react-table";
import { PowerOff } from "lucide-react";

export type AgentNetworkRow = TeamMember;

type GetAgentNetworkColumnsOptions = {
  onToggleStatus: (agent: AgentNetworkRow) => void;
};

export const getAgentNetworkColumns = ({
  onToggleStatus,
}: GetAgentNetworkColumnsOptions): ColumnDef<AgentNetworkRow>[] => {
  return [
    {
      accessorKey: "agency_name",
      meta: { columnTitle: "Agency" },
      size: 220,
      minSize: 190,
      maxSize: 280,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agency" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p
            className="truncate text-sm font-medium"
            title={row.original.agency_name}
          >
            {row.original.agency_name}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={row.original.agent_level}
          >
            Level: {row.original.agent_level}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      meta: { columnTitle: "Email" },
      size: 220,
      minSize: 180,
      maxSize: 280,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div
          className="truncate text-sm text-muted-foreground"
          title={row.original.email}
        >
          {row.original.email}
        </div>
      ),
    },
    {
      id: "contact",
      accessorFn: (row) => `${row.phone ?? ""} ${row.address ?? ""}`,
      meta: { columnTitle: "Contact" },
      size: 260,
      minSize: 220,
      maxSize: 340,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm" title={row.original.phone ?? "-"}>
            {row.original.phone ?? "-"}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={row.original.address ?? "No address provided"}
          >
            {row.original.address ?? "No address provided"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      meta: { columnTitle: "Status" },
      size: 110,
      minSize: 90,
      maxSize: 130,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      filterFn: (row, columnId, filterValues) => {
        if (!Array.isArray(filterValues) || filterValues.length === 0) {
          return true;
        }
        const value = String(row.getValue(columnId));
        return filterValues.includes(value);
      },
      cell: ({ row }) => {
        const isActive = row.original.status === "active";
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="capitalize"
          >
            {row.original.status || "unknown"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      meta: { columnTitle: "Created" },
      size: 160,
      minSize: 130,
      maxSize: 180,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const label = formatUtcToFriendlyLocal(row.original.created_at, {
          showTime: false,
        });
        return (
          <span className="text-sm text-muted-foreground">{label || "-"}</span>
        );
      },
    },
    {
      id: "actions",
      meta: { columnTitle: "Actions" },
      enableSorting: false,
      enableHiding: false,
      size: 140,
      minSize: 120,
      maxSize: 150,
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        if (row.original.is_current_user) {
          return (
            <div className="flex justify-end">
              <Badge variant="outline">Current</Badge>
            </div>
          );
        }

        const isActive = row.original.status === "active";

        return (
          <div
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant={isActive ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleStatus(row.original)}
              className={
                isActive
                  ? "h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  : "h-8"
              }
            >
              <PowerOff className="mr-1.5 h-3.5 w-3.5" />
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        );
      },
    },
  ];
};
