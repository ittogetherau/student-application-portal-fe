"use client";

import applicationStepsService from "@/service/application-steps.service";
import courseService, { Course } from "@/service/course.service";
import type { ServiceResponse } from "@/shared/types/service";
import { EnrollmentValues } from "@/shared/validation/application.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCoursesQuery = () => {
  return useQuery<ServiceResponse<Course[]>, Error>({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const response = await courseService.listCourses();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
};

export const useCourseIntakesQuery = (
  courseCode?: string,
  options?: {
    campus?: string | number | null;
    includeExpiredIntakes?: 0 | 1;
  },
) => {
  const hasCampusFilter = !!options && "campus" in options;
  const hasCampusValue =
    options?.campus !== undefined &&
    options?.campus !== null &&
    String(options.campus).trim().length > 0;

  return useQuery({
    queryKey: [
      "course-intakes",
      courseCode,
      options?.campus ?? null,
      options?.includeExpiredIntakes ?? 0,
    ],
    enabled: !!courseCode && (!hasCampusFilter || hasCampusValue),
    queryFn: async () => {
      const response = await courseService.listCourseIntakes(
        courseCode as string,
        options,
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
};

export const useSaveEnrollmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { applicationId: string; values: EnrollmentValues }
  >({
    mutationKey: ["save-enrollment"],
    mutationFn: async ({ applicationId, values }) => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response = await applicationStepsService.updateEnrollment(
        applicationId,
        values,
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("[Enrollment] Save success", data);
      queryClient.invalidateQueries({
        queryKey: ["application-get", variables.applicationId],
      });
    },
    onError: (error) => {
      console.error("[Enrollment] Save failed", error);
    },
  });
};
