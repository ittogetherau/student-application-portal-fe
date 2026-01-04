"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NewForm = ({ applicationId }: { applicationId?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { currentStep, goToStep, initializeStep, isStepCompleted } =
    useApplicationStepStore();

  const clearAllData = useApplicationFormDataStore(
    (state) => state.clearAllData
  );

  const createApplication = useApplicationCreateMutation();
  const { mutate: getApplication, isPending: isFetching } =
    useApplicationGetMutation(applicationId || null);

  const StepComponent = FORM_COMPONENTS[currentStep]?.component;

  // 🚨 INIT GUARD
  const [isInitialized, setIsInitialized] = useState(false);

  // -----------------------------
  // CREATE APPLICATION
  // -----------------------------
  async function handleApplicationCreate() {
    try {
      const res = await createApplication.mutateAsync(
        DEFAULT_CREATE_PAYLOAD_temp
      );
      const id = res.application.id;

      const params = new URLSearchParams(searchParams.toString());
      params.set("id", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Failed to create application draft", error);
    }
  }

  // -----------------------------
  // INITIALIZATION LOGIC
  // -----------------------------
  useEffect(() => {
    setIsInitialized(false);

    if (!applicationId) {
      // --- NEW APPLICATION MODE ---
      if (currentStep !== 0) {
        goToStep(0);
        clearAllData();
      }
      setIsInitialized(true);
    } else {
      // --- EDIT / CONTINUE MODE ---
      const storedId = useApplicationFormDataStore.getState().applicationId;

      if (storedId !== applicationId) {
        getApplication(undefined, {
          onSuccess: (res) => {
            if (res?.data) {
              initializeStep(
                applicationId,
                useApplicationFormDataStore.getState().stepData
              );
            }
            setIsInitialized(true);
          },
        });
      } else {
        setIsInitialized(true);
      }
    }
  }, [applicationId]);

  // -----------------------------
  // AUTO-CREATE (GUARDED)
  // -----------------------------
  useEffect(() => {
    if (!isInitialized) return;

    if (!applicationId && currentStep > 0 && !createApplication.isPending) {
      clearAllData();
      handleApplicationCreate();
    }
  }, [currentStep, applicationId, isInitialized]);

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (isFetching || !isInitialized) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading Application Progress...
        </span>
      </div>
    );
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <main className="relative">
      <section className="grid grid-cols-5 gap-4 max-w-7xl relative">
        <aside className="sticky top-4 self-start w-full">
          <Card>
            <CardContent className="flex flex-col gap-1 p-2">
              {FORM_STEPS.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  disabled={!applicationId && step.id > 0}
                  onClick={() => goToStep(step.id)}
                  className={cn(
                    "flex items-center justify-center lg:justify-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors shrink-0",
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted opacity-80",
                    !applicationId &&
                      step.id > 0 &&
                      "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                      currentStep === step.id
                        ? "bg-primary-foreground text-primary font-bold"
                        : isStepCompleted(step.id)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted"
                    )}
                  >
                    {isStepCompleted(step.id) && currentStep !== step.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      step.id + 1
                    )}
                  </div>
                  <span className="text-sm hidden lg:block">{step.title}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

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

              {StepComponent && <StepComponent applicationId={applicationId} />}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default NewForm;
