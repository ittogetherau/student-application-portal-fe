import { useApplicationStepStore } from "@/store/useApplicationStep.store";

export const useStepNavigation = (isEditMode: boolean) => {
  const { completedSteps } = useApplicationStepStore();

  const canNavigateToStep = (stepId: number, currentStep: number): boolean => {
    if (isEditMode) return true;
    if (stepId === currentStep) return true;
    if (stepId === 0) return true;

    // Allow navigation to any completed step (useful for auto-fill scenarios)
    // Use completedSteps array directly to ensure reactivity
    if (completedSteps.includes(stepId)) return true;

    console.log(completedSteps.includes(stepId - 1), stepId);

    // For sequential navigation, require previous step to be completed
    return completedSteps.includes(stepId - 1);
  };

  return { canNavigateToStep };
};
