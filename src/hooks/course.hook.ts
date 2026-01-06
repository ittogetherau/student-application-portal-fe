"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import applicationStepsService from "@/service/application-steps.service";
import courseService, { Course } from "@/service/course.service";
import type { ServiceResponse } from "@/types/service";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { EnrollmentValues } from "@/validation/application.validation";

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

export const useSaveEnrollmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, { applicationId: string; values: EnrollmentValues }>({
        mutationKey: ["save-enrollment"],
        mutationFn: async ({ applicationId, values }) => {
            if (!applicationId) throw new Error("Missing application reference.");
            const response = await applicationStepsService.updateEnrollment(applicationId, values);
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
