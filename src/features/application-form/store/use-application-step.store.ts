import {
  APPLICATION_FORM_STEPS,
  HIDDEN_STEP_IDS,
} from "@/features/application-form/constants/form-step-config";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const APPLICATION_STEP_STORAGE_KEY = "application-step-storage";
const ANONYMOUS_APPLICATION_STORAGE_ID = "__anonymous__";

const REVIEW_STEP_ID =
  APPLICATION_FORM_STEPS[APPLICATION_FORM_STEPS.length - 1].id;

type StepData = Record<number, unknown>;

type ApplicationStepState = {
  activeApplicationId: string | null;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  dirtySteps: number[];
  unsavedMessage: string | null;
  setStorageScope: (applicationId: string | null) => void;
  initializeStep: (applicationId: string | null, stepData: StepData) => void;
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  setTotalSteps: (total: number) => void;
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  setStepDirty: (step: number, isDirty: boolean) => void;
  clearStepDirty: (step: number) => void;
  clearDirtySteps: () => void;
  isStepDirty: (step: number) => boolean;
  setUnsavedMessage: (message: string | null) => void;
  clearUnsavedMessage: () => void;
  getNavigationBlockMessage: (
    fromStep: number,
    toStep: number,
  ) => string | null;
  restoreCompletedSteps: (stepData: StepData) => void;
  resetNavigation: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);
const isHiddenStep = (stepId: number) => HIDDEN_STEP_IDS.includes(stepId);

type PersistedApplicationStepState = Pick<
  ApplicationStepState,
  "activeApplicationId" | "currentStep" | "completedSteps"
>;

const getApplicationStepStorageKey = (applicationId: string | null) =>
  `${APPLICATION_STEP_STORAGE_KEY}:${
    applicationId ?? ANONYMOUS_APPLICATION_STORAGE_ID
  }`;

const readPersistedApplicationStepState = (
  storageKey: string,
): PersistedApplicationStepState | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { state?: PersistedApplicationStepState };
    return parsed?.state ?? null;
  } catch (error) {
    console.error("[ApplicationStepStore] Failed to read persisted state", {
      storageKey,
      error,
    });
    return null;
  }
};

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
  totalSteps: number,
): number => {
  if (!applicationId) return 0;

  const step0 = stepData[0] as { enrollments?: unknown[] } | undefined;
  if (!step0?.enrollments?.length) return 0;

  const filledSteps = Object.keys(stepData)
    .map(Number)
    .filter(
      (s) =>
        Number.isInteger(s) && s >= 0 && s < totalSteps && stepData[s] != null,
    );

  for (let i = 0; i < totalSteps; i++) {
    if (isHiddenStep(i)) continue;
    if (!filledSteps.includes(i)) return i;
  }

  return REVIEW_STEP_ID;
};

const getCompletedStepsFromData = (
  stepData: StepData,
  totalSteps: number,
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
      activeApplicationId: null,
      currentStep: 0,
      totalSteps: APPLICATION_FORM_STEPS.length,
      completedSteps: [],
      dirtySteps: [],
      unsavedMessage: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setStorageScope: (applicationId) => {
        const nextStorageKey = getApplicationStepStorageKey(applicationId);
        const currentStorageKey =
          useApplicationStepStore.persist.getOptions().name;

        if (currentStorageKey === nextStorageKey) {
          set({ activeApplicationId: applicationId, _hasHydrated: true });
          return;
        }

        const persistedState = readPersistedApplicationStepState(nextStorageKey);
        useApplicationStepStore.persist.setOptions({ name: nextStorageKey });

        set({
          activeApplicationId: applicationId,
          currentStep: persistedState?.currentStep ?? 0,
          completedSteps: persistedState?.completedSteps ?? [],
          dirtySteps: [],
          unsavedMessage: null,
          _hasHydrated: true,
        });
      },
      initializeStep: (applicationId, stepData) => {
        const totalSteps = get().totalSteps;
        const step = getInitialStep(applicationId, stepData, totalSteps);
        const completedSteps = getCompletedStepsFromData(stepData, totalSteps);

        set({
          activeApplicationId: applicationId,
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
            s.totalSteps,
          ),
        })),

      goToPrevious: () =>
        set((s) => ({
          currentStep: clamp(
            getPreviousVisibleStep(s.currentStep),
            s.totalSteps,
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
            : { completedSteps: [...s.completedSteps, step] },
        ),

      isStepCompleted: (step) => get().completedSteps.includes(step),

      setStepDirty: (step, isDirty) =>
        set((s) => {
          const hasStep = s.dirtySteps.includes(step);
          if (isDirty && !hasStep) {
            return { dirtySteps: [...s.dirtySteps, step] };
          }
          if (!isDirty && hasStep) {
            return { dirtySteps: s.dirtySteps.filter((id) => id !== step) };
          }
          return s;
        }),

      clearStepDirty: (step) =>
        set((s) => ({
          dirtySteps: s.dirtySteps.filter((id) => id !== step),
        })),

      clearDirtySteps: () => set({ dirtySteps: [] }),

      isStepDirty: (step) => get().dirtySteps.includes(step),

      setUnsavedMessage: (message) => set({ unsavedMessage: message }),

      clearUnsavedMessage: () => set({ unsavedMessage: null }),

      getNavigationBlockMessage: (fromStep, toStep) => {
        const { dirtySteps } = get();

        if (toStep > fromStep) {
          const hasBlockingDirty = dirtySteps.some((stepId) => stepId < toStep);
          if (hasBlockingDirty) {
            return "Please save your changes before moving forward.";
          }
        }

        if (toStep < fromStep && dirtySteps.includes(fromStep)) {
          return "You have unsaved changes. Please save before going back.";
        }

        return null;
      },

      restoreCompletedSteps: (stepData) => {
        const totalSteps = get().totalSteps;
        const completedSteps = getCompletedStepsFromData(stepData, totalSteps);
        set({ completedSteps });
      },

      resetNavigation: () => {
        set({
          currentStep: 0,
          completedSteps: [],
          dirtySteps: [],
          unsavedMessage: null,
        });
      },
    }),
    {
      name: getApplicationStepStorageKey(null),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeApplicationId: state.activeApplicationId,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
      }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    },
  ),
);
