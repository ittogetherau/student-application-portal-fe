"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_CREATE_PAYLOAD_temp,
  useApplicationCreateMutation,
  useApplicationGetMutation,
} from "@/hooks/useApplication.hook";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FORM_COMPONENTS } from "../_utils/form-step-components";
import { FORM_STEPS } from "../_utils/form-steps-data";
import { Check, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NewForm = ({
  applicationId: propApplicationId,
}: {
  applicationId?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get applicationId from either prop or query params
  const applicationId =
    propApplicationId || searchParams.get("id") || undefined;

  const {
    currentStep,
    goToStep,
    initializeStep,
    isStepCompleted,
    resetNavigation,
  } = useApplicationStepStore();

  const clearAllData = useApplicationFormDataStore(
    (state) => state.clearAllData
  );

  const createApplication = useApplicationCreateMutation();
  const { mutate: getApplication, isPending: isFetching } =
    useApplicationGetMutation(applicationId || null);

  const StepComponent = FORM_COMPONENTS[currentStep]?.component;

  // 🚨 INIT GUARD
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine mode
  const isEditMode =
    !!applicationId && (searchParams.get("edit") === "true" || !!applicationId);
  const isCreateMode = !applicationId;



  // -----------------------------
  // NAVIGATION LOGIC
  // -----------------------------
  const canNavigateToStep = (stepId: number): boolean => {
    if (isEditMode) {
      // In edit mode, allow navigation to any step
      return true;
    }

    // In create mode, only allow navigation to:
    // 1. Current step
    // 2. Completed steps
    // 3. The next step after the last completed step
    if (stepId === currentStep) return true;
    if (isStepCompleted(stepId)) return true;

    // Check if this is the immediate next step after completed steps
    if (stepId === 0) return true; // Always allow step 0

    // Allow next step if previous step is completed
    const previousStepCompleted = stepId === 0 || isStepCompleted(stepId - 1);
    return previousStepCompleted;
  };

  // -----------------------------
  // INITIALIZATION LOGIC
  // -----------------------------
  useEffect(() => {
    setIsInitialized(false);

    if (isCreateMode) {
      // --- NEW APPLICATION MODE ---
      // Always start at step 0 for new applications and clear all data
      clearAllData();
      resetNavigation();
      goToStep(0);
      setIsInitialized(true);
    } else if (isEditMode) {
      // --- EDIT / CONTINUE MODE ---
      const storedId = useApplicationFormDataStore.getState().applicationId;

      if (storedId !== applicationId) {
        // Load fresh data from API
        getApplication(undefined, {
          onSuccess: (res) => {
            if (res?.data) {
              // Initialize step navigation with loaded data
              const stepData = useApplicationFormDataStore.getState().stepData;
              initializeStep(applicationId, stepData);
            }
            setIsInitialized(true);
          },
          onError: () => {
            setIsInitialized(true);
          },
        });
      } else {
        // Data already loaded, just initialize navigation
        const stepData = useApplicationFormDataStore.getState().stepData;
        initializeStep(applicationId, stepData);
        setIsInitialized(true);
      }
    } else {
      // applicationId exists but edit=true is not in params
      // This means we're in view mode, not form mode
      setIsInitialized(true);
    }
  }, [
    applicationId,
    isEditMode,
    clearAllData,
    resetNavigation,
    goToStep,
    getApplication,
    initializeStep,
  ]);

  // -----------------------------
  // AUTO-FILL FOR DEV MODE
  // -----------------------------
  const [autoFillKey, setAutoFillKey] = useState(0);

  const handleAutoFill = async () => {
    const { setStepData, setApplicationId } =
      useApplicationFormDataStore.getState();

    // If we don't have an applicationId yet, create one first
    let currentApplicationId = applicationId;
    if (!currentApplicationId) {
      try {
        console.log("Creating application for auto-fill...");
        const res = await createApplication.mutateAsync(
          DEFAULT_CREATE_PAYLOAD_temp
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

    // Step 0: Enrollment
    const enrollmentData = {
      course: 1,
      intake: 1,
      campus: 1,
    };

    // Step 1: Personal Details
    const personalDetailsData = {
      student_origin: "Overseas Student (Offshore)",
      title: "Mr",
      given_name: "juyas",
      middle_name: "Michael",
      family_name: "Smith",
      gender: "Male",
      date_of_birth: "1995-06-15",
      email: "sayujkuickel@gmail.com",
      alternate_email: "j.smasith.alt@example.com",
      phone: "1234567890",
      home_phone: "0987654321",
      country_of_birth: "United States",
      nationality: "American",
      passport_number: "A12345678",
      passport_expiry: "2030-12-31",
      visa_type: "Student Visa",
      visa_number: "123456789",
      visa_expiry: "2026-12-31",
      search_address: "123 Main Street, Sydney NSW 2000",
      country: "Australia",
      building_name: "Main Building",
      flat_unit: "Unit 5",
      street_number: "123",
      street_name: "Main Street",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
      postal_same_as_residential: "Yes",
      postal_country: "",
      postal_building_name: "",
      postal_flat_unit: "",
      postal_street_number: "",
      postal_street_name: "",
      postal_suburb: "",
      postal_state: "",
      postal_postcode: "",
      overseas_country: "United States",
      overseas_address: "456 Oak Avenue, New York, NY 10001",
    };

    // Step 2: Emergency Contact
    const emergencyContactData = {
      contacts: [
        {
          name: "Jane Smith",
          relationship: "friend",
          phone: "0987654321",
          email: "jane.smith@example.com",
          address: "456 Oak Street, Melbourne VIC 3000",
          is_primary: true,
        },
      ],
    };

    // Step 3: Health Cover
    const healthCoverData = {
      provider: "Medibank",
      policy_number: "HC123456789",
      start_date: "2025-01-01",
      end_date: "2026-12-31",
      coverage_type: "single",
      cost: 650,
    };

    // Step 4: Language & Culture
    const languageCultureData = {
      aboriginal_torres_strait:
        "No, Neither Aboriginal and Torres Strait Islander",
      is_english_main_language: "Yes",
      main_language: "English",
      english_speaking_proficiency: "Very Well",
      english_instruction_previous_studies: "Yes",
      completed_english_test: "Yes",
      english_test_type: "ielts",
      english_test_date: "2024-06-15",
      english_test_listening: "7.5",
      english_test_writing: "7.0",
      english_test_reading: "8.0",
      english_test_speaking: "7.5",
      english_test_overall: "7.5",
      first_language: "English",
      english_proficiency: "Native",
      other_languages: ["Spanish", "French"],
      indigenous_status: "No",
      country_of_birth: "United States",
      citizenship_status: "Non-citizen",
      visa_type: "Student Visa",
      visa_expiry: "2026-12-31",
      english_test_score: "7.5",
    };

    // Step 5: Disability
    const disabilityData = {
      has_disability: "No",
      disability_hearing: false,
      disability_physical: false,
      disability_intellectual: false,
      disability_learning: false,
      disability_mental_illness: false,
      disability_acquired_brain: false,
      disability_vision: false,
      disability_medical_condition: false,
      disability_other: false,
      disability_type: "",
      disability_details: "",
      support_required: "",
      has_documentation: false,
      documentation_status: "",
      adjustments_needed: "",
    };

    // Step 6: Schooling
    const schoolingData = {
      highest_school_level: "12 - Completed year 12",
      still_attending: "No",
      secondary_school_type: "Government",
    };

    // Step 7: Qualifications
    const qualificationsData = {
      has_qualifications: "Yes",
      qualifications: [
        {
          qualification_name: "Bachelor of Arts",
          institution: "University of Sydney",
          completion_date: "2017-12-15",
          certificate_number: "BA2017-12345",
          field_of_study: "English Literature",
          grade: "Distinction",
        },
      ],
    };

    // Step 8: Employment
    const employmentData = {
      employment_status: "01 - Fulltime employee",
      entries: [
        {
          employer: "Tech Solutions Pty Ltd",
          role: "Software Developer",
          start_date: "2018-01-15",
          end_date: "2024-12-31",
          is_current: true,
          responsibilities:
            "Developing web applications using React and Node.js",
          industry: "Information Technology",
        },
      ],
    };

    // Step 9: USI
    const usiData = {
      usi: "ABC1234567",
      consent_to_verify: true,
    };

    // Step 10: Additional Services
    const additionalServicesData = {
      request_additional_services: "Yes",
      services: [
        {
          service_id: "airport-pickup",
          name: "Airport Pickup",
          description: "Transportation from airport to accommodation",
          fee: 50,
          selected: true,
        },
        {
          service_id: "accommodation",
          name: "Accommodation Assistance",
          description: "Help finding suitable accommodation",
          fee: 100,
          selected: true,
        },
      ],
    };

    // Step 11: Survey
    const surveyData = {
      availability_status: "A",
    };

    // Step 12: Documents - This is typically handled separately
    const documentsData = {
      uploaded_documents: [],
      required_documents: [],
    };

    // Step 13: Review - This is typically a summary step
    const reviewData = {
      terms_accepted: false,
      declaration_signed: false,
    };

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
          service: applicationStepsService.updateEnrollment,
        },
        {
          stepId: 1,
          data: personalDetailsData,
          service: applicationStepsService.updatePersonalDetails,
        },
        {
          stepId: 2,
          data: emergencyContactData,
          service: applicationStepsService.updateEmergencyContact,
        },
        {
          stepId: 3,
          data: healthCoverData,
          service: applicationStepsService.updateHealthCover,
        },
        {
          stepId: 4,
          data: languageCultureData,
          service: applicationStepsService.updateLanguageCultural,
        },
        {
          stepId: 5,
          data: disabilityData,
          service: applicationStepsService.updateDisabilitySupport,
        },
        {
          stepId: 6,
          data: schoolingData,
          service: applicationStepsService.updateSchoolingHistory,
        },
        {
          stepId: 7,
          data: qualificationsData,
          service: applicationStepsService.updatePreviousQualifications,
        },
        {
          stepId: 8,
          data: employmentData,
          service: applicationStepsService.updateEmploymentHistory,
        },
        {
          stepId: 9,
          data: usiData,
          service: applicationStepsService.updateUsi,
        },
        {
          stepId: 10,
          data: additionalServicesData,
          service: applicationStepsService.updateAdditionalServices,
        },
        {
          stepId: 11,
          data: surveyData,
          service: applicationStepsService.updateSurvey,
        },
      ];

      // Submit each step to backend
      for (const { stepId, data, service } of submissions) {
        try {
          console.log(`Submitting step ${stepId} to backend...`);
          const response = await service(currentApplicationId as string, data as any);

          if (response.success) {
            // Save to local store after successful backend save
            setStepData(stepId, data);
            // Mark step as completed
            useApplicationStepStore.getState().markStepCompleted(stepId);
            console.log(`Step ${stepId} submitted successfully`);
          } else {
            console.error(`Failed to submit step ${stepId}:`, response.message);
          }
        } catch (error) {
          console.error(`Error submitting step ${stepId}:`, error);
        }
      }

      // Also save documents and review data to local store (not submitted to backend)
      setStepData(12, documentsData);
      setStepData(13, reviewData);

      console.log("Auto-fill completed - all data submitted to backend!");
    } catch (error) {
      console.error("Error during auto-fill backend submission:", error);
    }

    // Force re-render of the current form component to pick up the new data
    // Use a small delay to ensure the store is updated and URL is changed
    setTimeout(() => {
      setAutoFillKey((prev) => prev + 1);
    }, 200);
  };

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";
  // -----------------------------

  // We no longer trigger creation here because EnrollmentForm handles it explicitly
  // if you click "Save & Continue" without an ID.

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (isFetching || !isInitialized) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          {isEditMode ? "Loading Application Data..." : "Initializing Form..."}
        </span>
      </div>
    );
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <main className="relative">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Application" : "Create New Application"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update your application details"
                : "Complete all steps to submit your application"}
            </p>
          </div>

          {/* Auto-fill button - Only show in development mode */}
          {isDevelopment && (
            <Button
              onClick={handleAutoFill}
              variant="outline"
              size="sm"
              className="gap-2 bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
            >
              <Zap className="h-4 w-4" />
              Auto Fill (Dev)
            </Button>
          )}
        </div>
      </div>

      <section className="grid grid-cols-5 gap-4 max-w-7xl relative">
        {/* Sidebar Navigation */}
        <aside className="sticky top-4 self-start w-full">
          <Card>
            <CardContent className="flex flex-col gap-1 p-2">
              {FORM_STEPS.map((step) => {
                const canNavigate = canNavigateToStep(step.id);
                const isCompleted = isStepCompleted(step.id);
                const isCurrent = currentStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!canNavigate}
                    onClick={() => canNavigate && goToStep(step.id)}
                    className={cn(
                      "flex items-center justify-center lg:justify-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors shrink-0",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : canNavigate
                          ? "hover:bg-muted"
                          : "opacity-40 cursor-not-allowed",
                      !canNavigate && "pointer-events-none"
                    )}
                    title={
                      !canNavigate && isCreateMode
                        ? "Complete previous steps to unlock"
                        : step.title
                    }
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                        isCurrent
                          ? "bg-primary-foreground text-primary font-bold"
                          : isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : canNavigate
                              ? "bg-muted text-muted-foreground"
                              : "bg-muted/50 text-muted-foreground/50"
                      )}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.id + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm hidden lg:block",
                        !canNavigate && "text-muted-foreground/50"
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </aside>

        {/* Main Form Component */}
        <div className="col-span-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-semibold">
                  {FORM_STEPS[currentStep].title}
                </h2>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {FORM_STEPS.length}
                </span>
              </div>

              {StepComponent && (
                <StepComponent
                  key={`${currentStep}-${autoFillKey}`}
                  applicationId={applicationId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default NewForm;
