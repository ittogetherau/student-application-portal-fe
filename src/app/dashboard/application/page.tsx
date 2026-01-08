"use client";

import { ApplicationTable } from "@/components/dashboard/applications/application-table";
import { Button } from "@/components/ui/button";
import useApplications from "@/hooks/useApplications.hook";

const Page = () => {
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
  } = useApplications();

  const disableNext = isLoading || isFetching || page >= maxPage;
  const heading =
    isLoading && !applications.length
      ? "Loading applications..."
      : `Applications (${total ?? 0})`;

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {heading}
        </h1>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Error loading applications</p>
          <p className="mt-1 text-xs opacity-90">{error.message}</p>
        </div>
      ) : null}

      <ApplicationTable
        data={applications}
        isLoading={isLoading}
        isFetching={isFetching}
        isKanban={true}
      />

      <div className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="font-medium">
          Page {page} of {maxPage || 1} · {total} total application
          {total === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={isLoading || isFetching || page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={disableNext}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Page;
