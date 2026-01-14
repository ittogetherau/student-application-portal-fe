import {
  FORM_STEPS,
  HIDDEN_STEP_IDS,
} from "@/app/dashboard/application/create/_utils/form-steps-data";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const REVIEW_STEP_ID = FORM_STEPS[12].id;

type StepData = Record<number, unknown>;

type ApplicationStepState = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  initializeStep: (applicationId: string | null, stepData: StepData) => void;
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  setTotalSteps: (total: number) => void;
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  restoreCompletedSteps: (stepData: StepData) => void;
  resetNavigation: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);
const isHiddenStep = (stepId: number) => HIDDEN_STEP_IDS.includes(stepId);

const getNextVisibleStep = (current: number, totalSteps: number) => {
  for (let i = current + 1; i < totalSteps; i++) {
    if (!isHiddenStep(i)) return i;
  }
  return current;
};

const getPreviousVisibleStep = (current: number) => {
  for (let i = current - 1; i >= 0; i--) {
    if (!isHiddenStep(i)) return i;
  }
  return 0;
};

const getInitialStep = (
  applicationId: string | null,
  stepData: StepData,
  totalSteps: number
): number => {
  if (!applicationId) return 0;

  const step0 = stepData[0] as { enrollments?: unknown[] } | undefined;
  if (!step0?.enrollments?.length) return 0;

  const filledSteps = Object.keys(stepData)
    .map(Number)
    .filter(
      (s) =>
        Number.isInteger(s) && s >= 0 && s < totalSteps && stepData[s] != null
    );

  for (let i = 0; i < totalSteps; i++) {
    if (isHiddenStep(i)) continue;
    if (!filledSteps.includes(i)) return i;
  }

  return REVIEW_STEP_ID;
};

const getCompletedStepsFromData = (
  stepData: StepData,
  totalSteps: number
): number[] => {
  const completedSteps: number[] = [];

  for (let i = 0; i < totalSteps; i++) {
    const data = stepData[i];
    if (data != null) {
      // Check if the step has meaningful data
      if (typeof data === "object" && !Array.isArray(data)) {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          completedSteps.push(i);
        }
      } else if (Array.isArray(data) && data.length > 0) {
        completedSteps.push(i);
      } else if (data !== null && data !== undefined && data !== "") {
        completedSteps.push(i);
      }
    }
  }

  return completedSteps;
};

export const useApplicationStepStore = create<ApplicationStepState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      totalSteps: FORM_STEPS.length,
      completedSteps: [],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      initializeStep: (applicationId, stepData) => {
        const totalSteps = get().totalSteps;
        const step = getInitialStep(applicationId, stepData, totalSteps);
        const completedSteps = getCompletedStepsFromData(stepData, totalSteps);

        set({
          currentStep: clamp(step, totalSteps),
          completedSteps: completedSteps,
        });
      },

      goToStep: (step) =>
        set((s) => {
          const target = isHiddenStep(step)
            ? getNextVisibleStep(step, s.totalSteps)
            : step;
          return { currentStep: clamp(target, s.totalSteps) };
        }),

      goToNext: () =>
        set((s) => ({
          currentStep: clamp(
            getNextVisibleStep(s.currentStep, s.totalSteps),
            s.totalSteps
          ),
        })),

      goToPrevious: () =>
        set((s) => ({
          currentStep: clamp(
            getPreviousVisibleStep(s.currentStep),
            s.totalSteps
          ),
        })),

      setTotalSteps: (total) =>
        set((s) => ({
          totalSteps: total,
          currentStep: clamp(s.currentStep, total),
        })),

      markStepCompleted: (step) =>
        set((s) =>
          s.completedSteps.includes(step)
            ? s
            : { completedSteps: [...s.completedSteps, step] }
        ),

      isStepCompleted: (step) => get().completedSteps.includes(step),

      restoreCompletedSteps: (stepData) => {
        const totalSteps = get().totalSteps;
        const completedSteps = getCompletedStepsFromData(stepData, totalSteps);
        set({ completedSteps });
      },

      resetNavigation: () => {
        set({ currentStep: 0, completedSteps: [] });
      },
    }),
    {
      name: "application-step-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
      }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
