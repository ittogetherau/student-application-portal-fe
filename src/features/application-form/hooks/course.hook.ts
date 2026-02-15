"use client";

import applicationStepsService from "@/service/application-steps.service";
import courseService, {
  type CourseIntakeListParams,
  Course,
  type CourseListParams,
} from "@/service/course.service";
import type { ServiceResponse } from "@/shared/types/service";
import { EnrollmentValues } from "@/shared/validation/application.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCoursesQuery = (
  params?: CourseListParams,
  options?: { enabled?: boolean },
) => {
  return useQuery<ServiceResponse<Course[]>, Error>({
    queryKey: ["courses-list", params],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const response = await courseService.listCourses(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
};

export const useCourseIntakesQuery = (
  courseCode?: string,
  options?: CourseIntakeListParams,
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
      options?.fromdate ?? null,
      options?.intake ?? null,
      options?.page ?? null,
      options?.show ?? null,
      options?.student_id ?? null,
      options?.todate ?? null,
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

export const useEnrollmentStepQuery = (applicationId: string | null) => {
  return useQuery<ServiceResponse<{ data?: unknown }>, Error>({
    queryKey: ["application-enrollments-step", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Missing application reference.");
      const response =
        await applicationStepsService.getEnrollmentDetails(applicationId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch enrollment step");
      }
      return response;
    },
    enabled: !!applicationId,
  });
};
