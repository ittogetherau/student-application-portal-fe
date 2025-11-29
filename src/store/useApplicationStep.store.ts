import { create } from "zustand";

import { TOTAL_APPLICATION_STEPS } from "@/components/forms/application-forms/form-step-registry";

type ApplicationStepState = {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
};

const clampStep = (step: number) =>
  Math.min(Math.max(step, 1), TOTAL_APPLICATION_STEPS);

export const useApplicationStepStore = create<ApplicationStepState>((set) => ({
  currentStep: 1,
  totalSteps: TOTAL_APPLICATION_STEPS,
  goToStep: (step) =>
    set(() => ({
      currentStep: clampStep(step),
    })),
  goToNext: () =>
    set((state) => ({
      currentStep: clampStep(state.currentStep + 1),
    })),
  goToPrevious: () =>
    set((state) => ({
      currentStep: clampStep(state.currentStep - 1),
    })),
}));
