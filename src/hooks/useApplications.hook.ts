"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { APPLICATION_STAGE, type ApplicationTableRow } from "@/constants/types";
import applicationService, {
  type ApplicationListParams,
} from "@/service/application.service";
import { usePaginationStoreByKey } from "@/store/usePagination.store";

type ApplicationsResult = {
  applications: ApplicationTableRow[];
  total?: number;
};

type UseApplicationsOptions = {
  filters?: ApplicationListParams;
  storeKey?: string;
};

const normalizeStage = (value?: string): APPLICATION_STAGE => {
  if (!value) return APPLICATION_STAGE.DRAFT;
  const stage = value as APPLICATION_STAGE;
  return Object.values(APPLICATION_STAGE).includes(stage)
    ? stage
    : APPLICATION_STAGE.DRAFT;
};

const normalizeApplicationList = (raw: unknown): ApplicationsResult => {
  const applications: ApplicationTableRow[] = [];
  let total: number | undefined;

  const pushMapped = (item: Record<string, unknown>, index: number) => {
    const rawStage =
      (item.stage as string) ||
      (item.current_stage as string) ||
      (item.status as string);
    const normalizedStage = normalizeStage(rawStage);

    const mapped: ApplicationTableRow = {
      id: String(item.id ?? index),
      referenceNumber:
        (item.tracking_code as string) ??
        (item.reference_number as string) ??
        String(item.id ?? `ERR-${index + 1}`),
      agentName: (item.agent_name as string) ?? "",
      studentName: (item.student_name as string) ?? "Unknown student",
      studentEmail: (item.student_email as string) ?? "",
      stage: normalizedStage,
      assignedStaffId:
        (item.assigned_staff_id as string) ??
        ((item.assigned_staff as { id?: string } | null | undefined)?.id ??
          null),
      assignedStaffName:
        (item.assigned_staff_name as string) ??
        ((
          item.assigned_staff as { email?: string } | null | undefined
        )?.email ?? undefined),
      course: (item.course_name as string) || (item.course as string) || "N/A",
      intake: (item.intake as string) || "N/A",
      submittedAt: (item.submitted_at as string) ?? "",
    };

    applications.push(mapped);
  };

  if (Array.isArray(raw)) {
    raw.forEach((item, idx) => {
      if (item && typeof item === "object")
        pushMapped(item as Record<string, unknown>, idx);
    });
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    if (typeof obj.total === "number") {
      total = obj.total;
    } else if (typeof obj.count === "number") {
      total = obj.count;
    }

    const dataArray = obj.items ?? obj.data ?? obj.applications ?? obj.results;
    if (Array.isArray(dataArray)) {
      dataArray.forEach((item, idx) => {
        if (item && typeof item === "object")
          pushMapped(item as Record<string, unknown>, idx);
      });
    } else if ("id" in obj) {
      pushMapped(obj, 0);
    } else {
      Object.values(obj).forEach((val, idx) => {
        if (val && typeof val === "object") {
          pushMapped(val as Record<string, unknown>, idx);
        }
      });
    }
  }

  return {
    applications,
    total,
  };
};

export const useApplications = ({
  filters: initialFilters = {},
  storeKey = "applications",
}: UseApplicationsOptions = {}) => {
  const paginationStore = usePaginationStoreByKey(storeKey);
  const page = paginationStore((state) => state.page);
  const perPage = paginationStore((state) => state.perPage);
  const maxPage = paginationStore((state) => state.maxPage);
  const query = paginationStore((state) => state.query);
  const setPage = paginationStore((state) => state.setPage);
  const setMaxPage = paginationStore((state) => state.setMaxPage);
  const setQuery = paginationStore((state) => state.setQuery);
  const nextPage = paginationStore((state) => state.nextPage);
  const prevPage = paginationStore((state) => state.prevPage);

  // Additional filters state
  const [extraFilters, setExtraFilters] =
    useState<ApplicationListParams>(initialFilters);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);

    return () => clearTimeout(timer);
  }, [query]);

  const isSearchingOrFiltering =
    !!debouncedQuery ||
    Object.values(extraFilters).some((v) => v !== undefined);

  const applicationsQuery = useQuery({
    queryKey: [
      "applications",
      {
        ...extraFilters,
        search: debouncedQuery,
        page: page,
        perPage,
      },
    ],
    queryFn: async () => {
      const response = await applicationService.listApplications({
        ...extraFilters,
        search: debouncedQuery || undefined,
        limit: perPage,
        offset: (page - 1) * perPage,
      });

      console.log(response, "api response");

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch applications");
      }

      return normalizeApplicationList(response.data);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });

  const resolvedTotal = applicationsQuery.data?.total ?? 0;

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(resolvedTotal / perPage || 1));
    setMaxPage(totalPages);
    if (page > totalPages) setPage(totalPages);
  }, [page, perPage, resolvedTotal, setMaxPage, setPage]);

  const handleSearch = (value: string) => {
    setPage(1);
    setQuery(value);
  };

  const handleFilterChange = (newFilters: ApplicationListParams) => {
    setPage(1);
    setExtraFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setPage(1);
    setQuery("");
    setExtraFilters(initialFilters);
  };

  return {
    applications: applicationsQuery.data?.applications ?? [],
    total: resolvedTotal,
    isLoading: applicationsQuery.isLoading,
    isFetching: applicationsQuery.isFetching,
    error: applicationsQuery.error,
    page,
    perPage,
    maxPage,
    nextPage,
    prevPage,
    setPage,
    setQuery: handleSearch,
    searchValue: query,
    extraFilters,
    setExtraFilters: handleFilterChange,
    isSearchingOrFiltering,
    resetFilters,
    refetch: applicationsQuery.refetch,
  };
};

export default useApplications;
