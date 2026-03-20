"use client";

import applicationStepsService from "@/service/application-steps.service";
import publicStudentApplicationService from "@/service/public-student-application.service";
import { usePublicStudentApplicationStore } from "@/features/student-application/store/use-public-student-application.store";
import courseService, {
  type CalculateCourseEndDateParams,
  type CalculateCourseEndDateResult,
  type CourseIntakeListParams,
  Course,
  type CourseDetails,
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

export const useCourseDetailsQuery = (
  courseCode?: string,
  options?: { enabled?: boolean },
) => {
  return useQuery<ServiceResponse<CourseDetails | null>, Error>({
    queryKey: ["course-details", courseCode],
    enabled: (options?.enabled ?? true) && !!courseCode,
    queryFn: async () => {
      if (!courseCode) throw new Error("Course code is required");
      const response = await courseService.getCourseByCode(courseCode);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
};

export const useCalculateCourseEndDateMutation = () => {
  return useMutation<
    CalculateCourseEndDateResult | null,
    Error,
    { courseCode: string; params?: CalculateCourseEndDateParams }
  >({
    mutationKey: ["course-calculate-end-date"],
    mutationFn: async ({ courseCode, params }) => {
      if (!courseCode) throw new Error("Course code is required");
      const response = await courseService.calculateCourseEndDate(
        courseCode,
        params,
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data ?? null;
    },
  });
};

export const useSaveEnrollmentMutation = () => {
  const queryClient = useQueryClient();
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const token = usePublicStudentApplicationStore((state) => state.token);

  return useMutation<
    unknown,
    Error,
    { applicationId: string; values: EnrollmentValues }
  >({
    mutationKey: ["save-enrollment"],
    mutationFn: async ({ applicationId, values }) => {
      const response =
        isPublicMode && token
          ? await publicStudentApplicationService.updateEnrollment(token, values)
          : applicationId
            ? await applicationStepsService.updateEnrollment(applicationId, values)
            : null;

      if (!response) throw new Error("Missing application reference.");
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("[Enrollment] Save success", data);
      queryClient.invalidateQueries({
        queryKey: ["application-get"],
      });
    },
    onError: (error) => {
      console.error("[Enrollment] Save failed", error);
    },
  });
};

export const useEnrollmentStepQuery = (applicationId: string | null) => {
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const token = usePublicStudentApplicationStore((state) => state.token);

  return useQuery<ServiceResponse<{ data?: unknown }>, Error>({
    queryKey: [
      "application-enrollments-step",
      isPublicMode ? `public:${token}` : applicationId,
    ],
    queryFn: async () => {
      const response =
        isPublicMode && token
          ? await publicStudentApplicationService.getEnrollmentDetails(token)
          : applicationId
            ? await applicationStepsService.getEnrollmentDetails(applicationId)
            : null;

      if (!response) throw new Error("Missing application reference.");
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch enrollment step");
      }
      return response;
    },
    enabled: !!applicationId || !!(isPublicMode && token),
  });
};
