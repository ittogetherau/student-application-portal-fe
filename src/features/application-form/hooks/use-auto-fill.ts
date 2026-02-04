import {
  DEFAULT_CREATE_PAYLOAD_temp,
  useApplicationCreateMutation,
} from "@/shared/hooks/use-applications";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { DEFAULT_AUTO_FILL_DATA } from "../constants/autofill-data";
import { useApplicationFormDataStore } from "../store/use-application-form-data.store";
import { useApplicationStepStore } from "../store/use-application-step.store";
import { useCoursesQuery } from "./course.hook";

const useAutoFill = ({
  applicationId,
  setAutoFillKey,
}: {
  applicationId?: string;
  setAutoFillKey: Dispatch<SetStateAction<number>>;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setStepData, setApplicationId } =
    useApplicationFormDataStore.getState();
  const { markStepCompleted } = useApplicationStepStore.getState();

  const { data: coursesResponse } = useCoursesQuery();
  const courses = coursesResponse?.data || [];

  const createApplication = useApplicationCreateMutation();
  const {
    enrollmentData: baseEnrollmentData,
    personalDetailsData,
    emergencyContactData,
    healthCoverData,
    languageCultureData,
    disabilityData,
    schoolingData,
    qualificationsData,
    employmentData,
    usiData,
    additionalServicesData,
    surveyData,
    documentsData,
    reviewData,
  } = DEFAULT_AUTO_FILL_DATA;

  // Resolve dynamic enrollment data based on available courses
  const enrollmentData = useMemo(() => {
    if (courses.length > 0) {
      const firstCourse = courses[0];
      const firstIntake = firstCourse.intakes?.[0];
      const firstCampus =
        firstIntake?.campuses?.[0] || firstCourse.campuses?.[0];

      if (firstCourse && firstIntake && firstCampus) {
        return {
          ...baseEnrollmentData,
          course: firstCourse.id,
          course_name: firstCourse.course_name,
          intake: firstIntake.id,
          intake_name: firstIntake.intake_name,
          campus: firstCampus.id,
          campus_name: firstCampus.name,
        };
      }
    }
    return baseEnrollmentData;
  }, [courses, baseEnrollmentData]);

  const performAutoFill = useCallback(async () => {
    // Generate unique emails for this auto-fill session
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const uniquePersonalDetailsData = {
      ...personalDetailsData,
      email: `student.${uniqueId}@example.com`,
      alternate_email: `j.smith.alt.${uniqueId}@example.com`,
    };

    // If we don't have an applicationId yet, create one first
    let currentApplicationId = applicationId;

    if (!currentApplicationId) {
      try {
        console.log("Creating application for auto-fill...");
        const res = await createApplication.mutateAsync(
          DEFAULT_CREATE_PAYLOAD_temp,
        );
        currentApplicationId = res.application.id;

        // Update URL with the new applicationId
        const params = new URLSearchParams(searchParams.toString());
        params.set("id", currentApplicationId);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });

        console.log("Application created with ID:", currentApplicationId);
      } catch (error) {
        console.error("Failed to create application for auto-fill:", error);
        return;
      }
    }

    // Set the applicationId in the store
    setApplicationId(currentApplicationId);

    try {
      console.log("Starting auto-fill with backend submission...");

      // Import the application steps service
      const applicationStepsService = (
        await import("@/service/application-steps.service")
      ).default;

      // Submit all form data to backend sequentially
      const submissions = [
        {
          stepId: 0,
          data: enrollmentData,
          submit: () =>
            applicationStepsService.updateEnrollment(
              currentApplicationId,
              enrollmentData,
            ),
        },
        {
          stepId: 1,
          data: uniquePersonalDetailsData,
          submit: () =>
            applicationStepsService.updatePersonalDetails(
              currentApplicationId,
              uniquePersonalDetailsData,
            ),
        },
        {
          stepId: 2,
          data: emergencyContactData,
          submit: () =>
            applicationStepsService.updateEmergencyContact(
              currentApplicationId,
              emergencyContactData,
            ),
        },
        {
          stepId: 3,
          data: healthCoverData,
          submit: () =>
            applicationStepsService.updateHealthCover(
              currentApplicationId,
              healthCoverData,
            ),
        },
        {
          stepId: 4,
          data: languageCultureData,
          submit: () =>
            applicationStepsService.updateLanguageCultural(
              currentApplicationId,
              languageCultureData,
            ),
        },
        {
          stepId: 5,
          data: disabilityData,
          submit: () =>
            applicationStepsService.updateDisabilitySupport(
              currentApplicationId,
              disabilityData,
            ),
        },
        {
          stepId: 6,
          data: schoolingData,
          submit: () =>
            applicationStepsService.updateSchoolingHistory(
              currentApplicationId,
              schoolingData,
            ),
        },
        {
          stepId: 7,
          data: qualificationsData,
          submit: () =>
            applicationStepsService.updatePreviousQualifications(
              currentApplicationId,
              qualificationsData,
            ),
        },
        {
          stepId: 8,
          data: employmentData,
          submit: () =>
            applicationStepsService.updateEmploymentHistory(
              currentApplicationId,
              employmentData,
            ),
        },
        {
          stepId: 9,
          data: usiData,
          submit: () =>
            applicationStepsService.updateUsi(currentApplicationId, usiData),
        },
        {
          stepId: 10,
          data: additionalServicesData,
          submit: () =>
            applicationStepsService.updateAdditionalServices(
              currentApplicationId,
              additionalServicesData,
            ),
        },
        {
          stepId: 11,
          data: surveyData,
          submit: () =>
            applicationStepsService.updateSurvey(
              currentApplicationId,
              surveyData,
            ),
        },
      ];

      // Submit each step to backend
      const successfulSteps: number[] = [];

      for (const { stepId, data, submit } of submissions) {
        try {
          console.log(`Submitting step ${stepId} to backend...`);
          const response = await submit();

          if (response.success) {
            // Save to local store after successful backend save
            setStepData(stepId, data);
            // Mark step as completed
            markStepCompleted(stepId);
            successfulSteps.push(stepId);
            console.log(`Step ${stepId} submitted successfully`);
          } else {
            console.error(`Failed to submit step ${stepId}:`, response.message);
            // Continue with other steps even if one fails
          }
        } catch (error) {
          console.error(`Error submitting step ${stepId}:`, error);
          // Log more details for debugging
          if (error instanceof Error) {
            console.error(`Error details for step ${stepId}:`, {
              message: error.message,
              stack: error.stack,
            });
          }
        }
      }

      // Also save documents and review data to local store (not submitted to backend)
      //   setStepData(12, documentsData);
      //   setStepData(13, reviewData);

      console.log("Auto-fill completed - all data submitted to backend!");
      console.log(
        `Successfully completed steps: ${successfulSteps.join(", ")}`,
      );

      // Re-initialize step navigation to reflect completed steps
      // Use a longer timeout to ensure all state updates have propagated
      setTimeout(() => {
        const { initializeStep } = useApplicationStepStore.getState();
        const { stepData } = useApplicationFormDataStore.getState();
        console.log(
          "Re-initializing step navigation with data:",
          Object.keys(stepData),
        );
        initializeStep(currentApplicationId, stepData);
        setAutoFillKey((prev: number) => prev + 1);
      }, 500);
    } catch (error) {
      console.error("Error during auto-fill backend submission:", error);
    }
  }, [
    applicationId,
    createApplication,
    router,
    pathname,
    searchParams,
    setStepData,
    setApplicationId,
    markStepCompleted,
    enrollmentData,
    personalDetailsData,
    emergencyContactData,
    healthCoverData,
    languageCultureData,
    disabilityData,
    schoolingData,
    qualificationsData,
    employmentData,
    usiData,
    additionalServicesData,
    surveyData,
    documentsData,
    reviewData,
  ]);

  return {
    performAutoFill,
  };
};

export default useAutoFill;
