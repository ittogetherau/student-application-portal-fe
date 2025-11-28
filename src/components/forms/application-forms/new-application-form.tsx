"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, type ComponentType } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { siteRoutes } from "@/constants/site-routes";
import { cn } from "@/lib/utils";
import { clampStep } from "@/utils/application-form";
import { useApplicationFormFlow } from "@/hooks/useApplicationFormFlow";

import AdditionalServicesForm from "./additional-services-form";
import DisabilityForm from "./disability-form";
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

type FormStep = {
  id: number;
  title: string;
  component: ComponentType;
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
  { id: 12, title: "Review", component: ReviewForm },
];

const REVIEW_STEP_ID = 12;

const NewApplicationForm = () => {
  const router = useRouter();

  const { applicationId, currentStep, goToStep, goToNext, completedSteps } =
    useApplicationFormFlow(1, FORM_STEPS.length);

  const requiredStepIds = useMemo(
    () => FORM_STEPS.map((s) => s.id).filter((id) => id !== REVIEW_STEP_ID),
    []
  );

  const completedStepsWithoutReview = useMemo(
    () =>
      Array.from(completedSteps).filter((id) => id !== REVIEW_STEP_ID).length,
    [completedSteps]
  );

  const isAllRequiredStepsComplete = useMemo(
    () => requiredStepIds.every((id) => completedSteps.has(id)),
    [requiredStepIds, completedSteps]
  );

  const totalStepsWithoutReview = FORM_STEPS.length - 1;

  const progress =
    totalStepsWithoutReview > 0
      ? Math.min(
          (completedStepsWithoutReview / totalStepsWithoutReview) * 100,
          100
        )
      : 0;

  const handleNext = useCallback(() => {
    try {
      if (currentStep >= FORM_STEPS.length) return;
      goToNext();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Please complete this step before continuing.";
      toast.error(message);
    }
  }, [currentStep, goToNext]);

  const handlePrevious = useCallback(() => {
    if (currentStep <= 1) return;
    try {
      goToStep(clampStep(currentStep - 1, FORM_STEPS.length));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to go back.";
      toast.error(message);
    }
  }, [currentStep, goToStep]);

  const handleStepNavigation = useCallback(
    (stepId: number) => {
      if (currentStep === stepId) return;
      if (stepId === REVIEW_STEP_ID && !isAllRequiredStepsComplete) {
        toast.error("Please complete all sections before reviewing.");
        return;
      }
      try {
        goToStep(stepId);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Please complete previous steps before continuing.";
        toast.error(message);
      }
    },
    [currentStep, goToStep, isAllRequiredStepsComplete]
  );

  const handleSubmit = useCallback(() => {
    if (!isAllRequiredStepsComplete) {
      toast.error("Please complete all required steps before submitting.");
      return;
    }

    console.log("Submitting full application", {
      applicationId,
      step: currentStep,
    });

    toast.success("Application submission initialized.");
    router.push(siteRoutes.dashboard.application.root);
  }, [applicationId, router, currentStep, isAllRequiredStepsComplete]);

  const currentStepDefinition = FORM_STEPS[currentStep - 1] ?? null;

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

              <div className="flex flex-col gap-1">
                {FORM_STEPS.map((step) => (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => {
                      handleStepNavigation(step.id);
                    }}
                    className={cn(
                      "flex items-center gap-3 whitespace-nowrap rounded-lg px-2 py-2.5 text-left transition-colors lg:w-full lg:whitespace-normal",
                      "flex-shrink-0",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : completedSteps.has(step.id)
                        ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                        : "hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs",
                        currentStep === step.id
                          ? "bg-primary-foreground text-primary"
                          : completedSteps.has(step.id)
                          ? "bg-emerald-500 text-white"
                          : "bg-muted"
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
                  {currentStepDefinition?.title ?? "Application"}
                </h2>
              </div>

              {currentStepDefinition ? (
                <currentStepDefinition.component />
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
                  >
                    Submit Application
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
