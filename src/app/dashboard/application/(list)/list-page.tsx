"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { useStaffMembersQuery } from "@/features/application-detail/hooks/useStaffMembers.hook";
import ApplicationListFiltersPopover from "@/features/application-list/components/list/application-list-filters-popover";
import ApplicationListHeader from "@/features/application-list/components/list/application-list-header";
import ApplicationListPagination from "@/features/application-list/components/list/application-list-pagination";
import { ApplicationTable } from "@/features/application-list/components/table/application-table";
import useApplicationListFilters from "@/features/application-list/hooks/useApplicationListFilters.hook";
import { useApplications } from "@/features/application-list/hooks/useApplications.hook";
import { USER_ROLE } from "@/shared/constants/types";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type props = {
  isArchived?: boolean;
};

const ApplicationListPage = ({ isArchived = false }: props) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = session?.user.role;
  const canFilterStaff = role === USER_ROLE.STAFF;
  const subAgentId = searchParams.get("subAgentId")?.trim() ?? "";
  const subAgentName = searchParams.get("subAgentName")?.trim() ?? "";
  const { data: staffResponse } = useStaffMembersQuery({
    enabled: canFilterStaff,
  });
  const staffMembers = staffResponse?.data ?? [];
  const initialFilters = {
    ...(isArchived ? { archivedOnly: true } : {}),
    ...(subAgentId ? { ownerAgentProfileId: subAgentId } : {}),
  };
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
  } = useApplications({
    filters: initialFilters,
    storeKey: isArchived ? "applications-archived" : "applications",
  });

  const {
    columnFilters,
    setColumnFilters,
    filterDraft,
    stageDraft,
    setStageDraft,
    filtersOpen,
    setFiltersOpen,
    updateFilterDraft,
    applyExtraFilters,
    handleResetAll,
    appliedFilterCount,
    canClear,
  } = useApplicationListFilters({
    extraFilters,
    setExtraFilters,
    resetFilters,
    canFilterStaff,
    isArchived,
    isSearchingOrFiltering,
  });

  const clearSubAgentFilter = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("subAgentId");
    nextParams.delete("subAgentName");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const handleResetWithSubAgent = () => {
    handleResetAll();
    if (subAgentId) {
      clearSubAgentFilter();
    }
  };

  const heading =
    isLoading && !applications.length
      ? isArchived
        ? "Loading archived applications..."
        : "Loading applications..."
      : isArchived
        ? `Archived Applications (${total ?? 0})`
        : `Applications (${total ?? 0})`;

  const filtersPopover = (
    <ApplicationListFiltersPopover
      role={role}
      canFilterStaff={canFilterStaff}
      staffMembers={staffMembers}
      isLoading={isLoading}
      isFetching={isFetching}
      filtersOpen={filtersOpen}
      setFiltersOpen={setFiltersOpen}
      appliedFilterCount={appliedFilterCount}
      filterDraft={filterDraft}
      stageDraft={stageDraft}
      setStageDraft={setStageDraft}
      updateFilterDraft={updateFilterDraft}
      onClear={handleResetWithSubAgent}
      onApply={applyExtraFilters}
      canClear={canClear}
    />
  );

  return (
    <ContainerLayout className=" space-y-4 pt-5 pb-6">
      <ApplicationListHeader heading={heading} errorMessage={error?.message} />

      {subAgentId ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm text-foreground shadow-sm">
          <Badge variant="secondary" className="rounded-md px-2.5 py-1 font-medium">
            Sub-agent filter
          </Badge>
          <span className="text-muted-foreground">
            Showing applications processed by{" "}
            <span className="font-semibold text-foreground">
              {subAgentName || "selected sub-agent"}
            </span>
            .
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8"
            onClick={clearSubAgentFilter}
          >
            Clear filter
          </Button>
        </div>
      ) : null}

      <div>
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
          onReset={handleResetWithSubAgent}
          isSearchingOrFiltering={isSearchingOrFiltering}
          filtersPopover={filtersPopover}
        />
      </div>

      <ApplicationListPagination
        page={page}
        maxPage={maxPage}
        isLoading={isLoading}
        isFetching={isFetching}
        onPrev={prevPage}
        onNext={nextPage}
      />
    </ContainerLayout>
  );
};

export default ApplicationListPage;
