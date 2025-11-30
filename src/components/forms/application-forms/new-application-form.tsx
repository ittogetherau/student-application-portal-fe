"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { siteRoutes } from "@/constants/site-routes";
import { APPLICATION_FORM_STEPS } from "./form-step-registry";
import { TOTAL_APPLICATION_STEPS } from "@/constants/application-steps";
import { cn } from "@/lib/utils";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationCreateMutation } from "@/hooks/useApplication.hook";
import { toast } from "react-hot-toast";

const NewApplicationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStep = useApplicationStepStore((state) => state.currentStep);
  const goToStep = useApplicationStepStore((state) => state.goToStep);
  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const goToPrevious = useApplicationStepStore((state) => state.goToPrevious);
  const setTotalSteps = useApplicationStepStore((state) => state.setTotalSteps);
  const isStepCompleted = useApplicationStepStore(
    (state) => state.isStepCompleted
  );
  const createApplication = useApplicationCreateMutation();
  const hasCreatedRef = useRef(false);

  useEffect(() => {
    setTotalSteps(TOTAL_APPLICATION_STEPS);
  }, [setTotalSteps]);

  useEffect(() => {
    if (hasCreatedRef.current) return;

    // Prefer existing id from URL
    const existingId = searchParams.get("applicationId");
    if (existingId) {
      // already in URL, nothing else to do
      hasCreatedRef.current = true;
      return;
    }

    hasCreatedRef.current = true;

    const defaultPayload = {
      agent_profile_id: "ea7cab76-0e47-4de8-b923-834f0d53abf1",
      course_offering_id: "4ba78380-8158-4941-9420-a1495d88e9d6",
    };

    // Simply call mutate - success/error handling is inside the hook
    createApplication.mutate(defaultPayload);
  }, [createApplication, searchParams]);

  const handleNext = useCallback(() => {
    if (currentStep >= TOTAL_APPLICATION_STEPS) return;
    if (!isStepCompleted(currentStep)) {
      toast.error("Please submit this step before continuing.");
      return;
    }
    goToNext();
    toast.success(`Moved to step ${currentStep + 1}`);
  }, [currentStep, goToNext, isStepCompleted]);

  const handlePrevious = useCallback(() => {
    goToPrevious();
  }, [goToPrevious]);

  const handleStepNavigation = useCallback(
    (stepId: number) => {
      goToStep(stepId);
      return;
      //
      const movingForward = stepId > currentStep;
      if (movingForward && !isStepCompleted(currentStep)) {
        toast.error("Please submit this step before continuing.");
        return;
      }
      goToStep(stepId);
    },
    [currentStep, goToStep, isStepCompleted]
  );

  const handleSubmit = useCallback(() => {
    router.push(siteRoutes.dashboard.application.root);
  }, [router]);

  const currentStepDefinition = APPLICATION_FORM_STEPS[currentStep - 1] ?? null;
  const progress = ((currentStep - 1) / (TOTAL_APPLICATION_STEPS - 1)) * 100;

  return (
    <div className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card className="sticky top-8 z-10">
            <CardContent className="px-2 py-3">
              <div className="mb-2 border-b pb-2">
                <Progress value={progress} className="h-1" />
              </div>

              <div className="flex flex-col gap-1">
                {APPLICATION_FORM_STEPS.map((step) => (
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
                        : "hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs",
                        currentStep === step.id
                          ? "bg-primary-foreground text-primary"
                          : isStepCompleted(step.id)
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted"
                      )}
                    >
                      {currentStep === step.id || isStepCompleted(step.id) ? (
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
                    Step {currentStep} of {TOTAL_APPLICATION_STEPS}
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
                  Step {currentStep} of {TOTAL_APPLICATION_STEPS}
                </span>

                {currentStep === TOTAL_APPLICATION_STEPS ? (
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
                    {isStepCompleted(currentStep) ? "Next" : "Submit this step"}
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
