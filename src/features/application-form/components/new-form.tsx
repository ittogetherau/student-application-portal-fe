"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import TwoColumnLayout from "@/components/ui-kit/layout/two-column-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AgentAssignmentSelect } from "@/features/application-detail/components/toolbar/agent-assignment-select";
import { usePublicStudentApplicationStore } from "@/features/student-application/store/use-public-student-application.store";
import type { ApplicationDetailResponse } from "@/service/application.service";
import { siteRoutes } from "@/shared/constants/site-routes";
import { useApplicationGetMutation } from "@/shared/hooks/use-applications";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { cn } from "@/shared/lib/utils";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  APPLICATION_FORM_STEPS,
  HIDDEN_STEP_IDS,
} from "../constants/form-step-config";
import useAutoFill from "../hooks/use-auto-fill";
import { useApplicationFormDataStore } from "../store/use-application-form-data.store";
import { useApplicationStepStore } from "../store/use-application-step.store";
import { useStepNavigation } from "../utils/use-step-navigation";
import { FORM_COMPONENTS } from "./form-step-components";

const NewForm = ({
  applicationId: propApplicationId,
  backHref,
  title,
  description,
  publicMode = false,
}: {
  applicationId?: string;
  backHref?: string;
  title?: string;
  description?: string;
  publicMode?: boolean;
}) => {
  const isDev = process.env.NODE_ENV === "development";
  const [autoFillKey, setAutoFillKey] = useState(0);
  const searchParams = useSearchParams();
  const isPublicAccessMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const publicToken = usePublicStudentApplicationStore((state) => state.token);

  const storedApplicationId = useApplicationFormDataStore(
    (state) => state.applicationId,
  );

  // Get applicationId from either prop or query params
  const applicationId =
    propApplicationId ||
    searchParams.get("id") ||
    storedApplicationId ||
    undefined;

  const {
    currentStep,
    goToStep,
    initializeStep,
    isStepCompleted,
    resetNavigation,
    completedSteps,
    setUnsavedMessage,
    clearUnsavedMessage,
    getNavigationBlockMessage,
  } = useApplicationStepStore();

  const stepData = useApplicationFormDataStore((state) => state.stepData);
  const clearAllData = useApplicationFormDataStore(
    (state) => state.clearAllData,
  );
  const { mutate: getApplication, isPending: isFetching } =
    useApplicationGetMutation(applicationId || null);
  const { performAutoFill } = useAutoFill({ applicationId, setAutoFillKey });

  const StepComponent = FORM_COMPONENTS[currentStep]?.component;
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentApplication, setCurrentApplication] =
    useState<ApplicationDetailResponse | null>(null);
  const { isAgent } = useRoleFlags();

  const hasHydratedData = useApplicationFormDataStore(
    (state) => state._hasHydrated,
  );
  const hasHydratedSteps = useApplicationStepStore(
    (state) => state._hasHydrated,
  );
  const isHydrated = hasHydratedData && hasHydratedSteps;

  // Determine mode
  const isEditMode = searchParams.get("edit") === "true" && !!applicationId;
  const isCreateMode = !applicationId && !isPublicAccessMode;
  const resolvedBackHref =
    backHref ||
    (applicationId
      ? siteRoutes.dashboard.application.id.details(applicationId)
      : publicMode
        ? siteRoutes.student.root
        : siteRoutes.dashboard.application.root);
  const resolvedTitle =
    title || (isEditMode ? "Edit Application" : "Create New Application");
  const resolvedDescription =
    description ||
    (isEditMode
      ? "Update your application details"
      : "Complete all steps to submit your application");

  const { canNavigateToStep } = useStepNavigation(isEditMode);
  const hasStoredStepData = useMemo(
    () => Object.keys(stepData).length > 0,
    [stepData],
  );
  const hasCompletedSteps = completedSteps.length > 0;

  const fetchedEditApplicationRef = useRef<string | null>(null);
  const queueInitializationState = useCallback((value: boolean) => {
    queueMicrotask(() => {
      setIsInitialized(value);
    });
  }, []);

  const handleStepNavigation = (targetStep: number, canNavigate: boolean) => {
    if (!canNavigate) return;

    const navigationMessage = getNavigationBlockMessage(
      currentStep,
      targetStep,
    );
    if (navigationMessage) {
      setUnsavedMessage(navigationMessage);
      return;
    }

    clearUnsavedMessage();
    goToStep(targetStep);
  };

  // Initialize form
  useEffect(() => {
    if (!isHydrated) return;

    queueInitializationState(false);

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
      queueInitializationState(true);
    } else if (isEditMode || isPublicAccessMode) {
      const fetchKey = isPublicAccessMode
        ? `public:${publicToken ?? "missing"}`
        : applicationId;
      const hasFetchedThisSession =
        fetchedEditApplicationRef.current === fetchKey;

      if (fetchKey && !hasFetchedThisSession) {
        getApplication(undefined, {
          onSuccess: (res) => {
            setCurrentApplication(res?.data ?? null);
            if (res?.data) {
              const resolvedApplicationId = res.data.id || applicationId;
              const stepData = useApplicationFormDataStore.getState().stepData;
              if (resolvedApplicationId) {
                initializeStep(resolvedApplicationId, stepData);
              }
              setAutoFillKey((prev) => prev + 1);
            }
            fetchedEditApplicationRef.current = fetchKey;
            queueInitializationState(true);
          },
          onError: () => {
            setCurrentApplication(null);
            fetchedEditApplicationRef.current = fetchKey;
            queueInitializationState(true);
          },
        });
      } else {
        const stepData = useApplicationFormDataStore.getState().stepData;
        if (applicationId) {
          initializeStep(applicationId, stepData);
        }
        queueInitializationState(true);
      }
    } else {
      queueInitializationState(true);
    }
  }, [
    applicationId,
    isEditMode,
    isCreateMode,
    isPublicAccessMode,
    clearAllData,
    resetNavigation,
    goToStep,
    getApplication,
    initializeStep,
    isHydrated,
    storedApplicationId,
    hasStoredStepData,
    hasCompletedSteps,
    publicToken,
    queueInitializationState,
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
            <div className="flex items-center gap-2">
              <Link href={resolvedBackHref}>
                <Button size={"icon-sm"} variant={"outline"}>
                  <ChevronLeft />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{resolvedTitle}</h1>
            </div>
            <p className="text-muted-foreground mt-1">{resolvedDescription}</p>
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
          <aside className="space-y-4">
            <Card>
              <CardContent className="py-0">
                <div className="flex w-full overflow-x-scroll lg:flex-col gap-1 px-2 lg:px-0 py-3">
                  {APPLICATION_FORM_STEPS.filter(
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
                        onClick={() =>
                          handleStepNavigation(step.id, canNavigate)
                        }
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
                            "text-sm",
                            !canNavigate && "text-muted-foreground/50",
                          )}
                        >
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {applicationId && !isAgent ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Agent</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AgentAssignmentSelect
                    applicationId={applicationId}
                    assignedAgentProfileId={
                      currentApplication?.agent_profile_id ?? null
                    }
                    assignedAgentEmail={
                      (currentApplication?.agent_email as string | null) ?? null
                    }
                    onAssigned={() => {
                      getApplication(undefined, {
                        onSuccess: (res) =>
                          setCurrentApplication(res?.data ?? null),
                      });
                    }}
                  />
                </CardContent>
                {publicMode ? (
                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    Selecting an agent is optional. If you leave this blank, one
                    can be assigned later. Only choose an agent if you already
                    know who you want to work with.
                  </CardFooter>
                ) : null}
              </Card>
            ) : null}
          </aside>
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {APPLICATION_FORM_STEPS[currentStep].title}
          </h2>
          {/* <span className="text-sm text-muted-foreground"> Step {currentStep + 1} of {APPLICATION_FORM_STEPS.length} </span> */}
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
