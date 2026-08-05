"use client";

import type { ApplicationListParams } from "@/service/application.service";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export type ApplicationListFilterDraft = {
  studentName: string;
  agentName: string;
  agentEmail: string;
  studentOrigin: string;
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
  studentName: "",
  agentName: "",
  agentEmail: "",
  studentOrigin: "",
  assignedStaffId: "",
  fromDate: "",
  toDate: "",
};

function readInitialDraft(extraFilters: ApplicationListParams) {
  return {
    studentName: extraFilters.studentName ?? "",
    agentName: extraFilters.agentName ?? "",
    agentEmail: extraFilters.agentEmail ?? "",
    studentOrigin: extraFilters.studentOrigin ?? "",
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
      studentName: filterDraft.studentName.trim() || undefined,
      agentName: filterDraft.agentName.trim() || undefined,
      agentEmail: filterDraft.agentEmail.trim() || undefined,
      studentOrigin: filterDraft.studentOrigin || undefined,
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
    !!filterDraft.studentName ||
    !!filterDraft.agentName ||
    !!filterDraft.agentEmail ||
    !!filterDraft.studentOrigin ||
    (canFilterStaff && !!filterDraft.assignedStaffId) ||
    !!filterDraft.fromDate ||
    !!filterDraft.toDate;

  const appliedFilterCount = useMemo(
    () =>
      (extraFilters.stage ? 1 : 0) +
      (extraFilters.studentName ? 1 : 0) +
      (extraFilters.agentName ? 1 : 0) +
      (extraFilters.agentEmail ? 1 : 0) +
      (extraFilters.studentOrigin ? 1 : 0) +
      (extraFilters.assignedStaffId ? 1 : 0) +
      (extraFilters.fromDate ? 1 : 0) +
      (extraFilters.toDate ? 1 : 0),
    [
      extraFilters.agentName,
      extraFilters.agentEmail,
      extraFilters.studentOrigin,
      extraFilters.assignedStaffId,
      extraFilters.fromDate,
      extraFilters.stage,
      extraFilters.studentName,
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
