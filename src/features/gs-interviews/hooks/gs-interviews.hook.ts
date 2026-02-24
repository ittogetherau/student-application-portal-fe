"use client";

import gsMeetingsService, {
  type GsInterviewResponse,
} from "@/service/gs-meetings.service";
import { useQuery } from "@tanstack/react-query";

export const gsInterviewKeys = {
  all: ["gs-interviews"] as const,
  list: (dateFrom: string, dateTo: string) =>
    [...gsInterviewKeys.all, "list", dateFrom, dateTo] as const,
};

export type UseGsInterviewsQueryOptions = {
  dateFrom: string;
  dateTo: string;
  enabled?: boolean;
};

export function useGsInterviewsQuery(options: UseGsInterviewsQueryOptions) {
  const { dateFrom, dateTo, enabled } = options;

  return useQuery<GsInterviewResponse[], Error>({
    queryKey: gsInterviewKeys.list(dateFrom, dateTo),
    queryFn: async () => {
      const response = await gsMeetingsService.listInterviews({
        date_from: dateFrom,
        date_to: dateTo,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to load interviews");
      }

      return response.data ?? [];
    },
    enabled: enabled ?? true,
    staleTime: 1000 * 30,
  });
}

