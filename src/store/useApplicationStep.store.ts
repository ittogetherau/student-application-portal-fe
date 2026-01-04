import { FORM_STEPS } from "@/app/dashboard/application/create/_utils/form-steps-data";
import { create } from "zustand";

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
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

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
    if (!filledSteps.includes(i)) return i;
  }

  return REVIEW_STEP_ID;
};

export const useApplicationStepStore = create<ApplicationStepState>(
  (set, get) => ({
    currentStep: 0,
    totalSteps: FORM_STEPS.length,
    completedSteps: [],

    initializeStep: (applicationId, stepData) => {
      const totalSteps = get().totalSteps;
      const step = getInitialStep(applicationId, stepData, totalSteps);
      set({ currentStep: clamp(step, totalSteps) });
    },

    goToStep: (step) =>
      set((s) => ({ currentStep: clamp(step, s.totalSteps) })),

    goToNext: () =>
      set((s) => ({
        currentStep: clamp(s.currentStep + 1, s.totalSteps),
      })),

    goToPrevious: () =>
      set((s) => ({
        currentStep: clamp(s.currentStep - 1, s.totalSteps),
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
  })
);
