"use client";
import {
  DataTable,
  type DataTableFacetedFilter,
} from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { USER_ROLE, type Application } from "@/constants/types";
import Link from "next/link";
import * as React from "react";
import { applicationColumns } from "./application-table-columns";
import { applicationStageFilterOptions } from "@/components/shared/ApplicationStagePill";
import { siteRoutes } from "@/constants/site-routes";
import { useSession } from "next-auth/react";

import type { ColumnFiltersState } from "@tanstack/react-table";

interface ApplicationTableProps {
  data?: Application[];
  isLoading?: boolean;
  isFetching?: boolean;
  isKanban?: boolean;
  isallowMovingInKanban?: boolean;
  filters?: ColumnFiltersState;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onReset?: () => void;
  isSearchingOrFiltering?: boolean;
}

export const ApplicationTable = ({
  data = [],
  isLoading = false,
  isFetching = false,
  isKanban = false,
  isallowMovingInKanban = false,
  filters: externalFilters,
  onFilterChange,
  searchValue,
  onSearch,
  onReset,
  isSearchingOrFiltering,
}: ApplicationTableProps) => {
  const [view, setView] = React.useState<"table" | "kanban">("table");

  const { data: session } = useSession();
  const ROLE = session?.user.role;

  const filters = React.useMemo<DataTableFacetedFilter[]>(
    () => [
      {
        columnId: "stage",
        title: "Stage",
        options: applicationStageFilterOptions,
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  return (
    <DataTable
      columns={applicationColumns}
      view={view}
      isallowMovingInKanban={isallowMovingInKanban}
      data={data}
      facetedFilters={filters}
      manualFiltering={true}
      columnFilters={externalFilters}
      onFilterChange={onFilterChange}
      searchValue={searchValue}
      onSearch={onSearch}
      onReset={onReset}
      isSearchingOrFiltering={isSearchingOrFiltering}
      searchableColumns={[
        "referenceNumber",
        "studentName",
        "course",
        "destination",
      ]}
      searchPlaceholder="Search by student, course, destination, or reference..."
      emptyState={{
        title: "No applications found",
        description: "Try a different search term or filter combination.",
      }}
      toolbarActions={
        <div className="flex items-center gap-3">
          {isFetching ? (
            <span className="text-xs text-muted-foreground">Refreshing...</span>
          ) : null}

          {ROLE === USER_ROLE.AGENT && (
            <Button asChild size="sm">
              <Link href={siteRoutes.dashboard.application.create}>
                New Application
              </Link>
            </Button>
          )}

          {isKanban ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (view === "kanban") {
                  setView("table");
                } else {
                  setView("kanban");
                }
              }}
            >
              {view === "kanban" ? "Table View" : "Kanban View"}
            </Button>
          ) : null}
        </div>
      }
      enableLocalPagination={false}
    />
  );
};
