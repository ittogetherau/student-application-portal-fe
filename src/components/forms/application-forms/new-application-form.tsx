"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import applicationService from "@/service/application.service";
import {
  ApplicationCreateValues,
  applicationCreateSchema,
} from "@/validation/application";

import AdditionalServicesForm from "./additional-services-form";
import DisabilityForm from "./disability-form";
import DocumentsForm from "./documents-form";
import EmergencyContactForm from "./emergency-contact-form";
import EmploymentForm from "./employment-form";
import HealthCoverForm from "./health-cover-form";
import LanguageCulturalForm from "./language-cultural-form";
import PersonalDetailsForm from "./personal-details-form";
import QualificationsForm from "./qualifications-form";
import ReviewForm from "./review-form";
import SchoolingForm from "./schooling-form";
import SurveyForm from "./survey-form";
import USIForm from "./usi-form";

type StepFormData = Record<string, unknown>;
type FormDataState = Record<number, StepFormData>;

type StepComponentProps = {
  data: StepFormData;
  allData: FormDataState;
  onUpdate: (data: StepFormData) => void;
  onComplete: () => void;
};

type FormStep = {
  id: number;
  title: string;
  component: ComponentType<StepComponentProps>;
};

export const FORM_STEPS: FormStep[] = [
  { id: 1, title: "Personal Details", component: PersonalDetailsForm },
  { id: 2, title: "Emergency Contact", component: EmergencyContactForm },
  { id: 3, title: "Health Cover", component: HealthCoverForm },
  { id: 4, title: "Language & Culture", component: LanguageCulturalForm },
  { id: 5, title: "Disability", component: DisabilityForm },
  { id: 6, title: "Schooling", component: SchoolingForm },
  { id: 7, title: "Qualifications", component: QualificationsForm },
  { id: 8, title: "Employment", component: EmploymentForm },
  { id: 9, title: "USI", component: USIForm },
  { id: 10, title: "Additional Services", component: AdditionalServicesForm },
  { id: 11, title: "Survey", component: SurveyForm },
  { id: 12, title: "Documents", component: DocumentsForm },
  { id: 13, title: "Review", component: ReviewForm },
] satisfies FormStep[];

const STORAGE_KEY = "application_form_data";
const APPLICATION_ID_STORAGE_KEY = "application_form_application_id";
const REVIEW_STEP_ID = 13;
const STEP_SAVE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
type StepNumber = (typeof STEP_SAVE_ORDER)[number];

const clampStep = (step: number) =>
  Math.max(1, Math.min(step, FORM_STEPS.length));

const STEP_MUTATION_MAP: Partial<
  Record<
    StepNumber,
    (applicationId: string, payload: StepFormData) => Promise<unknown>
  >
> = {
  1: applicationService.updatePersonalDetails.bind(applicationService),
  2: applicationService.updateEmergencyContact.bind(applicationService),
  3: applicationService.updateHealthCover.bind(applicationService),
  4: applicationService.updateLanguageCultural.bind(applicationService),
  5: applicationService.updateDisabilitySupport.bind(applicationService),
  6: applicationService.updateSchoolingHistory.bind(applicationService),
  7: applicationService.updatePreviousQualifications.bind(applicationService),
  8: applicationService.updateEmploymentHistory.bind(applicationService),
  9: applicationService.updateUsi.bind(applicationService),
  10: applicationService.updateAdditionalServices.bind(applicationService),
  11: applicationService.updateSurvey.bind(applicationService),
};

const usePersistentFormState = () => {
  const [formData, setFormData] = useState<FormDataState>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set(),
  );
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedData = window.localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;
    try {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData ?? {});
      setCompletedSteps(new Set(parsed.completedSteps ?? []));
      setCurrentStep(parsed.currentStep ?? 1);
    } catch (error) {
      console.error("Error loading saved form data:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dataToSave = {
      formData,
      completedSteps: Array.from(completedSteps),
      currentStep,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, completedSteps, currentStep]);

  return {
    formData,
    setFormData,
    completedSteps,
    setCompletedSteps,
    currentStep,
    setCurrentStep,
  };
};

const useStepMutation = (
  applicationId: string | null,
  stepId: StepNumber,
) => {
  const mutationFn = STEP_MUTATION_MAP[stepId];
  return useMutation({
    mutationKey: ["application-step", applicationId, stepId],
    mutationFn: async (payload: StepFormData) => {
      if (!mutationFn) return null;
      if (!applicationId) {
        throw new Error("Missing application reference. Please reload the draft.");
      }
      const response = await mutationFn(applicationId, payload);
      if (
        typeof response === "object" &&
        response !== null &&
        "success" in response &&
        response.success === false
      ) {
        throw new Error(
          "message" in response && typeof response.message === "string"
            ? response.message
            : `Failed to save step ${stepId}.`,
        );
      }
      return response;
    },
  });
};

const NewApplicationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [lastSavedSnapshots, setLastSavedSnapshots] = useState<
    Record<number, string>
  >({});
  const [applicationId, setApplicationId] = useState<string | null>(
    searchParams.get("applicationId"),
  );

  const {
    formData,
    setFormData,
    completedSteps,
    setCompletedSteps,
    currentStep,
    setCurrentStep,
  } = usePersistentFormState();

  useEffect(() => {
    const queryId = searchParams.get("applicationId");
    if (queryId) {
      setApplicationId(queryId);
      return;
    }
    if (typeof window === "undefined") return;
    const storedId = window.localStorage.getItem(APPLICATION_ID_STORAGE_KEY);
    if (storedId) {
      setApplicationId(storedId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (applicationId) {
      window.localStorage.setItem(
        APPLICATION_ID_STORAGE_KEY,
        applicationId,
      );
    }
  }, [applicationId]);

  useEffect(() => {
    setLastSavedSnapshots({});
  }, [applicationId]);

  const personalDetailsMutation = useStepMutation(applicationId, 1);
  const emergencyContactMutation = useStepMutation(applicationId, 2);
  const healthCoverMutation = useStepMutation(applicationId, 3);
  const languageMutation = useStepMutation(applicationId, 4);
  const disabilityMutation = useStepMutation(applicationId, 5);
  const schoolingMutation = useStepMutation(applicationId, 6);
  const qualificationsMutation = useStepMutation(applicationId, 7);
  const employmentMutation = useStepMutation(applicationId, 8);
  const usiMutation = useStepMutation(applicationId, 9);
  const additionalServicesMutation = useStepMutation(applicationId, 10);
  const surveyMutation = useStepMutation(applicationId, 11);

  const stepMutations = useMemo<
    Record<number, ReturnType<typeof useStepMutation> | undefined>
  >(
    () => ({
      1: personalDetailsMutation,
      2: emergencyContactMutation,
      3: healthCoverMutation,
      4: languageMutation,
      5: disabilityMutation,
      6: schoolingMutation,
      7: qualificationsMutation,
      8: employmentMutation,
      9: usiMutation,
      10: additionalServicesMutation,
      11: surveyMutation,
    }),
    [
      personalDetailsMutation,
      emergencyContactMutation,
      healthCoverMutation,
      languageMutation,
      disabilityMutation,
      schoolingMutation,
      qualificationsMutation,
      employmentMutation,
      usiMutation,
      additionalServicesMutation,
      surveyMutation,
    ],
  );

  const updateFormData = useCallback(
    (stepId: number, data: StepFormData) => {
      setFormData((prev) => ({
        ...prev,
        [stepId]: data,
      }));
    },
    [setFormData],
  );

  const markStepComplete = useCallback(
    (stepId: number) => {
      setCompletedSteps((prev) => {
        if (prev.has(stepId)) return prev;
        const next = new Set(prev);
        next.add(stepId);
        return next;
      });
    },
    [setCompletedSteps],
  );

  const saveStep = useCallback(
    async (stepId: number) => {
      const mutation = stepMutations[stepId as StepNumber];
      const payload = formData[stepId];
      if (!mutation || !payload) return true;
      const snapshot = JSON.stringify(payload);
      if (lastSavedSnapshots[stepId] === snapshot) return true;
      try {
        await mutation.mutateAsync(payload);
        setLastSavedSnapshots((prev) => ({
          ...prev,
          [stepId]: snapshot,
        }));
        return true;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to save step ${stepId}. Please try again.`,
        );
        return false;
      }
    },
    [formData, lastSavedSnapshots, stepMutations],
  );

  const saveAllSteps = useCallback(async () => {
    for (const stepId of STEP_SAVE_ORDER) {
      // eslint-disable-next-line no-await-in-loop
      const saved = await saveStep(stepId);
      if (!saved) return false;
    }
    return true;
  }, [saveStep]);

  const handleNext = useCallback(async () => {
    if (currentStep >= FORM_STEPS.length) return;
    const saved = await saveStep(currentStep);
    if (!saved) return;
    setCurrentStep((prev) =>
      prev < FORM_STEPS.length ? clampStep(prev + 1) : prev,
    );
  }, [currentStep, saveStep, setCurrentStep]);

  const handlePrevious = useCallback(async () => {
    if (currentStep <= 1) return;
    const saved = await saveStep(currentStep);
    if (!saved) return;
    setCurrentStep((prev) => (prev > 1 ? clampStep(prev - 1) : prev));
  }, [currentStep, saveStep, setCurrentStep]);

  const goToStep = useCallback(
    async (stepId: number) => {
      if (currentStep === stepId) return;
      const saved = await saveStep(currentStep);
      if (!saved) return;
      setCurrentStep(clampStep(stepId));
    },
    [currentStep, saveStep, setCurrentStep],
  );

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(event.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!isDragging || !scrollContainerRef.current) return;
    event.preventDefault();
    const x = event.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const buildApplicationPayload = useCallback((): ApplicationCreateValues => {
    return applicationCreateSchema.parse({
      personalDetails: formData[1],
      emergencyContact: formData[2],
      healthCover: formData[3],
      languageCultural: formData[4],
      disabilitySupport: formData[5],
      schoolingHistory: formData[6],
      previousQualifications: formData[7],
      employmentHistory: formData[8],
      usi: formData[9],
      additionalServices: formData[10],
      survey: formData[11],
      documents: formData[12],
    });
  }, [formData]);

  const submitMutation = useMutation({
    mutationKey: ["application-submit", applicationId],
    mutationFn: async () => {
      if (!applicationId) {
        throw new Error("Missing application reference.");
      }
      const payload = buildApplicationPayload();
      const response = await applicationService.submitApplication(
        applicationId,
        payload,
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(APPLICATION_ID_STORAGE_KEY);
      }
      router.push("/dashboard/application");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again.",
      );
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!applicationId) {
      toast.error("Missing application reference. Please open an existing draft.");
      return;
    }
    try {
      const saved = await saveAllSteps();
      if (!saved) return;
      await submitMutation.mutateAsync();
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(
          error.errors[0]?.message ?? "Please complete all required fields.",
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    }
  }, [applicationId, saveAllSteps, submitMutation]);

  const CurrentStepComponent = FORM_STEPS[currentStep - 1]?.component ?? null;
  const totalStepsWithoutReview = FORM_STEPS.length - 1;
  const completedStepsWithoutReview = useMemo(
    () =>
      Array.from(completedSteps).filter((id) => id !== REVIEW_STEP_ID).length,
    [completedSteps],
  );
  const progress =
    totalStepsWithoutReview > 0
      ? Math.min(
          (completedStepsWithoutReview / totalStepsWithoutReview) * 100,
          100,
        )
      : 0;

  const handleStepUpdate = useCallback(
    (data: StepFormData) => {
      updateFormData(currentStep, data);
    },
    [currentStep, updateFormData],
  );

  const handleStepComplete = useCallback(() => {
    markStepComplete(currentStep);
    void saveStep(currentStep);
  }, [currentStep, markStepComplete, saveStep]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card className="sticky top-0 z-10">
            <CardContent className="px-2 py-3">
              <div className="mb-2 border-b pb-2">
                <Progress value={progress} className="h-1" />
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-xs text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {completedStepsWithoutReview} of {totalStepsWithoutReview}{" "}
                    completed
                  </span>
                </div>
              </div>

              <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={cn(
                  "flex gap-2 overflow-x-auto pb-0 lg:flex-col lg:gap-0 lg:overflow-x-visible lg:pb-0",
                  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                  isDragging
                    ? "cursor-grabbing select-none"
                    : "cursor-grab lg:cursor-default",
                )}
              >
                {FORM_STEPS.map((step) => (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => {
                      void goToStep(step.id);
                    }}
                    className={cn(
                      "flex items-center gap-3 whitespace-nowrap rounded-lg px-2 py-2.5 text-left transition-colors lg:w-full lg:whitespace-normal",
                      "flex-shrink-0",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : completedSteps.has(step.id)
                          ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                          : "hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs",
                        currentStep === step.id
                          ? "bg-primary-foreground text-primary"
                          : completedSteps.has(step.id)
                            ? "bg-emerald-500 text-white"
                            : "bg-muted",
                      )}
                    >
                      {completedSteps.has(step.id) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="text-sm">{step.title}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Step {currentStep} of {FORM_STEPS.length}
                  </span>
                </div>
                <h2 className="text-2xl">
                  {FORM_STEPS[currentStep - 1]?.title ?? "Application"}
                </h2>
              </div>

              {CurrentStepComponent ? (
                <CurrentStepComponent
                  data={(formData[currentStep] as StepFormData) ?? {}}
                  allData={formData}
                  onUpdate={handleStepUpdate}
                  onComplete={handleStepComplete}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    void handlePrevious();
                  }}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {FORM_STEPS.length}
                </span>

                {currentStep === FORM_STEPS.length ? (
                  <Button
                    onClick={() => {
                      void handleSubmit();
                    }}
                    className="gap-2"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      void handleNext();
                    }}
                    className="gap-2"
                  >
                    Save & Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewApplicationForm;
