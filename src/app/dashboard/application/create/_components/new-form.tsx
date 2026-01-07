"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApplicationGetMutation } from "@/hooks/useApplication.hook";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FORM_COMPONENTS } from "../_utils/form-step-components";
import { FORM_STEPS } from "../_utils/form-steps-data";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStepNavigation } from "../_hooks/useStepNavigation";
import useAutoFill from "../_hooks/useAutoFill";

const NewForm = ({
  applicationId: propApplicationId,
}: {
  applicationId?: string;
}) => {
  const [autoFillKey, setAutoFillKey] = useState(0);
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
  const { mutate: getApplication, isPending: isFetching } =
    useApplicationGetMutation(applicationId || null);
  const { performAutoFill } = useAutoFill({ applicationId, setAutoFillKey });

  const StepComponent = FORM_COMPONENTS[currentStep]?.component;
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine mode
  const isEditMode = searchParams.get("edit") === "true" && !!applicationId;
  const isCreateMode = !applicationId;

  const { canNavigateToStep } = useStepNavigation(isEditMode);

  // Initialize form
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

  // Loading State
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

          {/* Auto-fill button */}
          <Button
            onClick={performAutoFill}
            variant="outline"
            size="sm"
            className="gap-2 bg-primary border-primary text-primary-foreground hover:bg-primary/80"
          >
            Auto Fill
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-5 gap-4 max-w-7xl relative">
        {/* Sidebar Navigation */}
        <aside className="sticky top-4 self-start w-full">
          <Card>
            <CardContent className="flex flex-col gap-1 p-2">
              {FORM_STEPS.map((step) => {
                const canNavigate = canNavigateToStep(step.id, currentStep);
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
