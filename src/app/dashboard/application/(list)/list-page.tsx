"use client";

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

type props = {
  isArchived?: boolean;
};

const ApplicationListPage = ({ isArchived = false }: props) => {
  const { data: session } = useSession();
  const role = session?.user.role;
  const canFilterStaff = role === USER_ROLE.STAFF;
  const { data: staffResponse } = useStaffMembersQuery({
    enabled: canFilterStaff,
  });
  const staffMembers = staffResponse?.data ?? [];
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
    filters: isArchived ? { archivedOnly: true } : {},
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
      onClear={handleResetAll}
      onApply={applyExtraFilters}
      canClear={canClear}
    />
  );

  return (
    <ContainerLayout className=" space-y-4 pt-5 pb-6">
      <ApplicationListHeader heading={heading} errorMessage={error?.message} />

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
          onReset={handleResetAll}
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
