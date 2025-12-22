"use client";

import { Check, User, Info, ArrowLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { APPLICATION_FORM_STEPS } from "./form-step-registry";
import { TOTAL_APPLICATION_STEPS } from "@/constants/application-steps";
import { cn } from "@/lib/utils";
import { ApplicationFormProvider, useApplicationFormContext } from "@/contexts/ApplicationFormContext";
import EnrollmentManagementView from "./enrollment-management-view";

// ⚠️ TESTING MODE: Set to 'true' to allow free navigation during testing
// Set to 'false' in production to enforce step completion before navigation
const TESTING_MODE = false;

const NewApplicationForm = () => {
  // Use form context
  const { currentStep, goToStep, isStepCompleted, applicationId } = useApplicationFormContext();

  // Local state for Enrollment Management
  const [isManagingEnrollment, setIsManagingEnrollment] = useState(false);

  // Step navigation handler
  const handleStepNavigation = useCallback(
    (stepId: number) => {
      const movingForward = stepId > currentStep;

      // Block forward navigation if current step isn't completed (only in production mode)
      if (!TESTING_MODE && movingForward && !isStepCompleted(currentStep)) {
        toast.error("Please complete this step before continuing.");
        return;
      }

      goToStep(stepId);
    },
    [currentStep, goToStep, isStepCompleted]
  );

  // Calculate progress and get current step component
  const currentStepDefinition = APPLICATION_FORM_STEPS[currentStep - 1] ?? null;
  const progress = ((currentStep - 1) / (TOTAL_APPLICATION_STEPS - 1)) * 100;


  return (
    <div className="mx-auto w-full">
      <div className={cn(
        "grid grid-cols-1 gap-6 items-start",
        isManagingEnrollment ? "grid-cols-1" : "lg:grid-cols-4"
      )}>
        {/* Sidebar */}
        {!isManagingEnrollment && (
          <aside
            className="lg:col-span-1"
            style={{
              position: 'sticky',
              top: '24px',
              alignSelf: 'flex-start',
              height: 'fit-content',
              maxHeight: 'calc(100vh - 3rem)',
              overflowY: 'auto',
              zIndex: 10,
            }}
          >
            <div className="space-y-4">
              {/* Applicant Info */}
              <Card className="overflow-hidden border-none bg-primary/5 shadow-none ring-1 ring-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-foreground truncate">Other. Merritt Higgins</p>
                      <p className="text-[11px] text-muted-foreground font-medium">ID: 112511827584</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enrollment Info */}
              <Card className="shadow-sm border-muted/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[13px] text-foreground">Enrollment</h3>
                      <Info className="h-3 w-3 text-muted-foreground/70" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-primary tracking-tight leading-tight uppercase">
                      BBHM : Bachelor of Business- Major In Hospitality
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsManagingEnrollment(true)}
                      className="text-[12px] text-primary hover:text-primary/80 underline underline-offset-4 font-semibold text-left transition-colors"
                    >
                      Manage Enrollment
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Navigation */}
              <Card className="shadow-sm border-muted/60">
                <CardContent className="px-1.5 py-3">
                  <div className="px-3 mb-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <h3 className="font-bold text-[13px] text-foreground">Applicant Details</h3>
                      <Info className="h-3 w-3 text-muted-foreground/70" />
                    </div>
                    <Separator className="mb-4 opacity-60" />
                    <Progress value={progress} className="h-1.5 bg-muted" />
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 lg:flex lg:flex-col">
                    {APPLICATION_FORM_STEPS.map((step) => (
                      <button
                        type="button"
                        key={step.id}
                        onClick={() => handleStepNavigation(step.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors shrink-0",
                          currentStep === step.id
                            ? "bg-primary text-primary-foreground col-span-3 lg:col-span-1"
                            : "hover:bg-muted justify-center lg:justify-start lg:w-full"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
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
                        <span
                          className={cn(
                            "text-sm whitespace-nowrap",
                            currentStep === step.id ? "block" : "hidden lg:block"
                          )}
                        >
                          {step.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className={cn(
          "space-y-6",
          isManagingEnrollment ? "w-full" : "lg:col-span-3"
        )}>
          {isManagingEnrollment ? (
            <EnrollmentManagementView onBack={() => setIsManagingEnrollment(false)} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h2 className="text-2xl">
                    {currentStepDefinition?.title ?? "Application"}
                  </h2>
                </div>

                {/* Render current step component */}
                {currentStepDefinition && (
                  <currentStepDefinition.component />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper component with context provider
const NewApplicationFormWithProvider = () => {
  return (
    <ApplicationFormProvider>
      <NewApplicationForm />
    </ApplicationFormProvider>
  );
};

export default NewApplicationFormWithProvider;
