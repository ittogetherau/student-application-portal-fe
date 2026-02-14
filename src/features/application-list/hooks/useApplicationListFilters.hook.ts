"use client";

import type { ApplicationListParams } from "@/service/application.service";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export type ApplicationListFilterDraft = {
  studentId: string;
  agentId: string;
  assignedStaffId: string;
  fromDate: string;
  toDate: string;
};

type UseApplicationListFiltersOptions = {
  extraFilters: ApplicationListParams;
  setExtraFilters: (filters: ApplicationListParams) => void;
  resetFilters: () => void;
  canFilterStaff: boolean;
  isArchived: boolean;
  isSearchingOrFiltering: boolean;
};

const emptyDraft: ApplicationListFilterDraft = {
  studentId: "",
  agentId: "",
  assignedStaffId: "",
  fromDate: "",
  toDate: "",
};

function readInitialDraft(extraFilters: ApplicationListParams) {
  return {
    studentId: extraFilters.studentId ?? "",
    agentId: extraFilters.agentId ?? "",
    assignedStaffId: extraFilters.assignedStaffId ?? "",
    fromDate: extraFilters.fromDate ?? "",
    toDate: extraFilters.toDate ?? "",
  };
}

function readInitialStage(extraFilters: ApplicationListParams) {
  return typeof extraFilters.stage === "string" ? extraFilters.stage : "";
}

export default function useApplicationListFilters({
  extraFilters,
  setExtraFilters,
  resetFilters,
  canFilterStaff,
  isArchived,
  isSearchingOrFiltering,
}: UseApplicationListFiltersOptions) {
  const initialDraft = readInitialDraft(extraFilters);
  const initialStage = readInitialStage(extraFilters);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    initialStage ? [{ id: "stage", value: [initialStage] }] : [],
  );
  const [filterDraft, setFilterDraft] =
    useState<ApplicationListFilterDraft>(initialDraft);
  const [stageDraft, setStageDraft] = useState(initialStage);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateFilterDraft = (
    key: keyof ApplicationListFilterDraft,
    value: string,
  ) => {
    setFilterDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetAll = () => {
    setColumnFilters([]);
    setFilterDraft(emptyDraft);
    setStageDraft("");
    resetFilters();
  };

  const applyExtraFilters = () => {
    const trimmedStage = stageDraft.trim();
    setColumnFilters(
      trimmedStage ? [{ id: "stage", value: [trimmedStage] }] : [],
    );
    setExtraFilters({
      studentId: filterDraft.studentId.trim() || undefined,
      agentId: filterDraft.agentId.trim() || undefined,
      assignedStaffId: canFilterStaff
        ? filterDraft.assignedStaffId || undefined
        : undefined,
      fromDate: filterDraft.fromDate || undefined,
      toDate: filterDraft.toDate || undefined,
      stage: trimmedStage || undefined,
      archivedOnly: isArchived ? true : undefined,
    });
    setFiltersOpen(false);
  };

  const hasFilterDraft =
    !!stageDraft ||
    !!filterDraft.studentId ||
    !!filterDraft.agentId ||
    (canFilterStaff && !!filterDraft.assignedStaffId) ||
    !!filterDraft.fromDate ||
    !!filterDraft.toDate;

  const appliedFilterCount = useMemo(
    () =>
      (extraFilters.stage ? 1 : 0) +
      (extraFilters.studentId ? 1 : 0) +
      (extraFilters.agentId ? 1 : 0) +
      (extraFilters.assignedStaffId ? 1 : 0) +
      (extraFilters.fromDate ? 1 : 0) +
      (extraFilters.toDate ? 1 : 0),
    [
      extraFilters.agentId,
      extraFilters.assignedStaffId,
      extraFilters.fromDate,
      extraFilters.stage,
      extraFilters.studentId,
      extraFilters.toDate,
    ],
  );

  return {
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
    hasFilterDraft,
    appliedFilterCount,
    canClear: hasFilterDraft || isSearchingOrFiltering,
  };
}
