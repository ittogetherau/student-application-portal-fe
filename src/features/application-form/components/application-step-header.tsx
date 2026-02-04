"use client";

import { ChevronLeft } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApplicationStepStore } from "../store/use-application-step.store";

type StepHeaderProps = PropsWithChildren<{
  className?: string;
}>;

const ApplicationStepHeader = ({ className, children }: StepHeaderProps) => {
  const currentStep = useApplicationStepStore((state) => state.currentStep);
  const totalSteps = useApplicationStepStore((state) => state.totalSteps);
  const goToPrevious = useApplicationStepStore((state) => state.goToPrevious);
  const isStepDirty = useApplicationStepStore((state) => state.isStepDirty);
  const unsavedMessage = useApplicationStepStore(
    (state) => state.unsavedMessage,
  );
  const setUnsavedMessage = useApplicationStepStore(
    (state) => state.setUnsavedMessage,
  );
  const clearUnsavedMessage = useApplicationStepStore(
    (state) => state.clearUnsavedMessage,
  );

  useEffect(() => {
    if (!isStepDirty(currentStep)) {
      clearUnsavedMessage();
    }
  }, [currentStep, isStepDirty, clearUnsavedMessage]);

  return (
    <div
      className={`sticky bottom-0 z-10 border-t bg-background/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (currentStep === 0) return;
            if (isStepDirty(currentStep)) {
              setUnsavedMessage(
                "You have unsaved changes. Please save before going back.",
              );
              return;
            }
            clearUnsavedMessage();
            goToPrevious();
          }}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="flex-1 text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>

        {children ? (
          <div className="flex items-center gap-2">
            {unsavedMessage ? (
              <Tooltip open={!!unsavedMessage}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent className="w-52" variant="destructive">
                  {unsavedMessage}
                </TooltipContent>
              </Tooltip>
            ) : (
              children
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ApplicationStepHeader;
