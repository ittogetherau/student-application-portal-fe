"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import TwoColumnLayout from "@/components/ui-kit/layout/two-column-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApplicationGetMutation } from "@/hooks/useApplication.hook";
import { cn } from "@/lib/utils";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { Check, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useAutoFill from "../_hooks/useAutoFill";
import { useStepNavigation } from "../_hooks/useStepNavigation";
import { FORM_COMPONENTS } from "../_utils/form-step-components";
import { FORM_STEPS, HIDDEN_STEP_IDS } from "../_utils/form-steps-data";

const NewForm = ({
  applicationId: propApplicationId,
}: {
  applicationId?: string;
}) => {
  const isDev = process.env.NODE_ENV === "development";
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
    completedSteps,
    isStepDirty,
    dirtySteps,
    setUnsavedMessage,
    clearUnsavedMessage,
  } = useApplicationStepStore();

  const storedApplicationId = useApplicationFormDataStore(
    (state) => state.applicationId,
  );
  const stepData = useApplicationFormDataStore((state) => state.stepData);
  const clearAllData = useApplicationFormDataStore(
    (state) => state.clearAllData,
  );
  const { mutate: getApplication, isPending: isFetching } =
    useApplicationGetMutation(applicationId || null);
  const { performAutoFill } = useAutoFill({ applicationId, setAutoFillKey });

  const StepComponent = FORM_COMPONENTS[currentStep]?.component;
  const [isInitialized, setIsInitialized] = useState(false);

  const hasHydratedData = useApplicationFormDataStore(
    (state) => state._hasHydrated,
  );
  const hasHydratedSteps = useApplicationStepStore(
    (state) => state._hasHydrated,
  );
  const isHydrated = hasHydratedData && hasHydratedSteps;

  // Determine mode
  const isEditMode = searchParams.get("edit") === "true" && !!applicationId;
  const isCreateMode = !applicationId;

  const { canNavigateToStep } = useStepNavigation(isEditMode);
  const hasStoredStepData = useMemo(
    () => Object.keys(stepData).length > 0,
    [stepData],
  );
  const hasCompletedSteps = completedSteps.length > 0;

  const fetchedEditApplicationRef = useRef<string | null>(null);

  const handleStepNavigation = (targetStep: number, canNavigate: boolean) => {
    if (!canNavigate) return;

    const hasBlockingDirty = dirtySteps.some((stepId) => stepId < targetStep);
    if (hasBlockingDirty) {
      setUnsavedMessage("Please save your changes before moving forward.");
      return;
    }

    if (isStepDirty(currentStep) && targetStep < currentStep) {
      setUnsavedMessage(
        "You have unsaved changes. Please save before going back.",
      );
      return;
    }

    clearUnsavedMessage();
    goToStep(targetStep);
  };

  // Initialize form
  useEffect(() => {
    if (!isHydrated) return;

    setIsInitialized(false);

    if (isCreateMode) {
      // If we are in create mode but have stale data from a previous session, clear it
      if (storedApplicationId || hasStoredStepData || hasCompletedSteps) {
        console.log(
          "[NewForm] Clearing stale application data for new session",
        );
        clearAllData();
        resetNavigation();
        goToStep(0);
      }
      setIsInitialized(true);
    } else if (isEditMode) {
      // --- EDIT / CONTINUE MODE ---
      const hasFetchedThisSession =
        fetchedEditApplicationRef.current === applicationId;

      if (applicationId && !hasFetchedThisSession) {
        // Load fresh data from API
        getApplication(undefined, {
          onSuccess: (res) => {
            if (res?.data) {
              // Initialize step navigation with loaded data
              const stepData = useApplicationFormDataStore.getState().stepData;
              initializeStep(applicationId, stepData);
              setAutoFillKey((prev) => prev + 1);
            }
            fetchedEditApplicationRef.current = applicationId;
            setIsInitialized(true);
          },
          onError: () => {
            fetchedEditApplicationRef.current = applicationId;
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
    isCreateMode,
    clearAllData,
    resetNavigation,
    goToStep,
    getApplication,
    initializeStep,
    isHydrated,
    storedApplicationId,
    hasStoredStepData,
    hasCompletedSteps,
  ]);

  // Loading State
  if (isFetching || !isInitialized || !isHydrated) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          {isFetching ? "Loading Application..." : "Initializing Form..."}
        </span>
      </div>
    );
  }

  return (
    <>
      <ContainerLayout className="mb-4">
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
          {isDev && (
            <Button
              onClick={() => {
                if (!isDev) return;
                performAutoFill();
              }}
              variant="outline"
              size="sm"
              className="gap-2 bg-primary border-primary text-primary-foreground hover:bg-primary/80"
            >
              Auto Fill
            </Button>
          )}
        </div>
      </ContainerLayout>

      <TwoColumnLayout
        reversed={true}
        sticky={true}
        sidebar={
          <Card>
            <CardContent className="flex flex-col gap-1 p-2">
              {FORM_STEPS.filter(
                (step) => !HIDDEN_STEP_IDS.includes(step.id),
              ).map((step, index) => {
                const canNavigate = canNavigateToStep(step.id, currentStep);
                const isCompleted = isStepCompleted(step.id);
                const isCurrent = currentStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!canNavigate}
                    onClick={() => handleStepNavigation(step.id, canNavigate)}
                    className={cn(
                      "flex items-center justify-center lg:justify-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors shrink-0",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : canNavigate
                          ? "hover:bg-muted"
                          : "cursor-not-allowed",
                      !canNavigate && "pointer-events-none",
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
                              : "bg-muted/50 text-muted-foreground/50",
                      )}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm hidden lg:block",
                        !canNavigate && "text-muted-foreground/50",
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {FORM_STEPS[currentStep].title}
          </h2>
          {/* <span className="text-sm text-muted-foreground"> Step {currentStep + 1} of {FORM_STEPS.length} </span> */}
        </div>

        {StepComponent && (
          <StepComponent
            key={`${currentStep}-${autoFillKey}`}
            applicationId={applicationId}
            showDetails={true}
          />
        )}
      </TwoColumnLayout>

    </>
  );
};

export default NewForm;
