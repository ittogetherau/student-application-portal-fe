"use client";

import { useEffect, useState } from "react";
import { ApplicationTable } from "@/components/dashboard/applications/application-table";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { Button } from "@/components/ui/button";
import useApplications from "@/hooks/useApplications.hook";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
import { ChevronLeft, ChevronRight } from "lucide-react";

type props = {
  isArchived?: boolean;
};

const ApplicationListPage = ({ isArchived = false }: props) => {
  const {
    applications,
    total,
    page,
    maxPage,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    error,
    setQuery,
    searchValue,
    setExtraFilters,
    extraFilters,
    isSearchingOrFiltering,
    resetFilters,
  } = useApplications();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Sync table filters to API extraFilters
  useEffect(() => {
    const stageFilter = columnFilters.find((f) => f.id === "stage")?.value as
      | string[]
      | undefined;

    const newStageValue = stageFilter?.join(",") || undefined;

    // Only update if there's a real change to avoid unnecessary re-fetches
    if (extraFilters.stage !== newStageValue) {
      setExtraFilters({ stage: newStageValue });
    }
  }, [columnFilters, extraFilters.stage, setExtraFilters]);

  const handleResetAll = () => {
    setColumnFilters([]);
    resetFilters();
  };

  const disableNext = isLoading || isFetching || page >= maxPage;
  const heading =
    isLoading && !applications.length
      ? isArchived
        ? "Loading archived applications..."
        : "Loading applications..."
      : isArchived
      ? `Archived Applications (${total ?? 0})`
      : `Applications (${total ?? 0})`;

  const selectedStages = columnFilters.find((f) => f.id === "stage")?.value as
    | string[]
    | undefined;

  return (
    <ContainerLayout className=" space-y-4 pt-5 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {heading}
          </h1>
          {selectedStages && selectedStages.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Filtered by:
              </span>
              {selectedStages.map((stage) => (
                <ApplicationStagePill key={stage} stage={stage} />
              ))}
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Error loading applications</p>
          <p className="mt-1 text-xs opacity-90">{error.message}</p>
        </div>
      ) : null}

      <div className=" ">
        <ApplicationTable
          data={applications}
          isLoading={isLoading}
          isFetching={isFetching}
          isKanban={true}
          isArchived={isArchived}
          filters={columnFilters}
          onFilterChange={setColumnFilters}
          onSearch={setQuery}
          searchValue={searchValue}
          onReset={handleResetAll}
          isSearchingOrFiltering={isSearchingOrFiltering}
        />
      </div>

      <div className="flex items-center gap-4 justify-between">
        <p className="font-medium text-xs text-muted-foreground">
          {`Page ${page} of ${maxPage || 1} Aú ${total} total application${
            total === 1 ? "" : "s"
          }`}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={isLoading || isFetching || page <= 1}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={disableNext}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </ContainerLayout>
  );
};

export default ApplicationListPage;
