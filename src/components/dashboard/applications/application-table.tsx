"use client";
import {
  DataTable,
  type DataTableFacetedFilter,
} from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { mockApplications } from "@/constants/mockData";
import type { Application } from "@/constants/types";
import Link from "next/link";
import * as React from "react";
import {
  applicationColumns,
  applicationStatusFilterOptions,
} from "./application-table-columns";

interface ApplicationTableProps {
  data?: Application[];
}

export const ApplicationTable = ({
  data = mockApplications,
}: ApplicationTableProps) => {
  const filters = React.useMemo<DataTableFacetedFilter[]>(
    () => [
      {
        columnId: "status",
        title: "Status",
        options: applicationStatusFilterOptions,
      },
    ],
    []
  );

  return (
    <DataTable
      columns={applicationColumns}
      data={data}
      facetedFilters={filters}
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
        <>
          <Button asChild size="sm">
            <Link href="/dashboard/application/new">New Application</Link>
          </Button>
        </>
      }
    />
  );
};
