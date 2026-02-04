import { HIDDEN_STEP_IDS } from "../constants/form-steps-data";
import { useApplicationStepStore } from "../store/use-application-step.store";

export const useStepNavigation = (isEditMode: boolean) => {
  const { completedSteps } = useApplicationStepStore();
  const isHiddenStep = (stepId: number) => HIDDEN_STEP_IDS.includes(stepId);
  const getPreviousVisibleStep = (stepId: number) => {
    for (let i = stepId - 1; i >= 0; i--) {
      if (!isHiddenStep(i)) return i;
    }
    return null;
  };

  const canNavigateToStep = (stepId: number, currentStep: number): boolean => {
    if (isEditMode) return true;
    if (isHiddenStep(stepId)) return false;
    if (stepId === currentStep) return true;
    if (stepId === 0) return true;

    // Allow navigation to any completed step (useful for auto-fill scenarios)
    // Use completedSteps array directly to ensure reactivity
    if (completedSteps.includes(stepId)) return true;

    const previousVisibleStep = getPreviousVisibleStep(stepId);
    if (previousVisibleStep === null) return true;

    // For sequential navigation, require previous visible step to be completed
    return completedSteps.includes(previousVisibleStep);
  };

  return { canNavigateToStep };
};
