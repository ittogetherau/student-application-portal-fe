"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { clampStep } from "@/utils/application-form";
import {
  STEP_SAVE_ORDER,
  useApplicationCreateMutation,
  useApplicationStepMutations,
  type StepNumber,
} from "./useApplication.hook";
import type {
  AdditionalServicesValues,
  ApplicationCreateValues,
  DisabilitySupportValues,
  EmergencyContactValues,
  EmploymentHistoryValues,
  HealthCoverValues,
  LanguageCulturalValues,
  PersonalDetailsValues,
  PreviousQualificationsValues,
  SchoolingHistoryValues,
  SurveyValues,
  UsiValues,
} from "@/validation/application.validation";

const APPLICATION_ID_STORAGE_KEY = "application_form_application_id";
const COMPLETED_STEPS_STORAGE_KEY = "application_form_completed_steps";
const CURRENT_STEP_STORAGE_KEY = "application_form_current_step";

type StepPayloadMap = {
  1: PersonalDetailsValues;
  2: EmergencyContactValues;
  3: HealthCoverValues;
  4: LanguageCulturalValues;
  5: DisabilitySupportValues;
  6: SchoolingHistoryValues;
  7: PreviousQualificationsValues;
  8: EmploymentHistoryValues;
  9: UsiValues;
  10: AdditionalServicesValues;
  11: SurveyValues;
};

type SubmitOptions = {
  createPayload?: ApplicationCreateValues;
  skipNavigation?: boolean;
};

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const useApplicationFormFlow = (initialStep = 1, totalSteps = 12) => {
  const generateTempId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    const random = Math.random().toString(16).slice(2, 10);
    return `0000-${random}`;
  };

  const [applicationId, setApplicationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("applicationId");
    const idFromStorage = window.localStorage.getItem(
      APPLICATION_ID_STORAGE_KEY
    );
    const nextId = idFromUrl || idFromStorage || generateTempId();
    if (nextId) {
      window.localStorage.setItem(APPLICATION_ID_STORAGE_KEY, nextId);
    }
    return nextId;
  });
  const [isInitializingDraft, setIsInitializingDraft] = useState(false);

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    const saved = readJson<number[]>(COMPLETED_STEPS_STORAGE_KEY, []);
    return new Set(saved);
  });

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = readJson<number>(CURRENT_STEP_STORAGE_KEY, initialStep);
    return clampStep(saved, totalSteps);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      COMPLETED_STEPS_STORAGE_KEY,
      JSON.stringify(Array.from(completedSteps))
    );
  }, [completedSteps]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      CURRENT_STEP_STORAGE_KEY,
      JSON.stringify(currentStep)
    );
  }, [currentStep]);

  const createDraftMutation = useApplicationCreateMutation();
  const stepMutations = useApplicationStepMutations(applicationId);

  const persistApplicationId = useCallback((id: string) => {
    setApplicationId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(APPLICATION_ID_STORAGE_KEY, id);
    }
  }, []);

  const setExistingApplicationId = useCallback(
    (id: string) => persistApplicationId(id),
    [persistApplicationId]
  );

  const ensureDraft = useCallback(
    async (payload: ApplicationCreateValues = {}) => {
      if (applicationId) return applicationId;
      const result = await createDraftMutation.mutateAsync(payload);
      const extractId = (value: unknown): string | null => {
        if (!value || typeof value !== "object") return null;
        const obj = value as Record<string, unknown>;
        const candidate =
          obj.id ?? obj.applicationId ?? obj.application_id ?? null;
        return typeof candidate === "string" ? candidate : null;
      };
      const newId = extractId(result);
      if (!newId) {
        throw new Error("Application id missing from create response.");
      }
      persistApplicationId(newId);
      return newId;
    },
    [applicationId, createDraftMutation, persistApplicationId]
  );

  const isStepComplete = useCallback(
    (step: number) => completedSteps.has(step),
    [completedSteps]
  );

  const markStepComplete = useCallback((step: StepNumber) => {
    setCompletedSteps((prev) => {
      if (prev.has(step)) return prev;
      const next = new Set(prev);
      next.add(step);
      return next;
    });
  }, []);

  const canGoToStep = useCallback(
    (targetStep: number) => {
      if (targetStep <= 1) return true;
      const requiredSteps = STEP_SAVE_ORDER.filter((s) => s < targetStep);
      return requiredSteps.every((s) => completedSteps.has(s));
    },
    [completedSteps]
  );

  const goToStep = useCallback(
    (targetStep: number) => {
      if (!canGoToStep(targetStep)) {
        throw new Error("Please complete previous steps before continuing.");
      }
      setCurrentStep(clampStep(targetStep, totalSteps));
    },
    [canGoToStep, totalSteps]
  );

  const goToNext = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const submitStep = useCallback(
    async <TStep extends StepNumber>(
      stepId: TStep,
      payload: StepPayloadMap[TStep],
      options: SubmitOptions = {}
    ) => {
      const draftId = await ensureDraft(options.createPayload);
      const mutation = stepMutations[stepId];
      if (!mutation) {
        throw new Error(`No mutation configured for step ${stepId}.`);
      }
      const result = await mutation.mutateAsync(payload);
      markStepComplete(stepId);
      if (!options.skipNavigation) {
        setCurrentStep(clampStep(stepId + 1, totalSteps));
      }
      return { result, applicationId: draftId };
    },
    [ensureDraft, markStepComplete, stepMutations, totalSteps]
  );

  const resetFlow = useCallback(() => {
    setApplicationId(null);
    setCompletedSteps(new Set());
    setCurrentStep(1);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(APPLICATION_ID_STORAGE_KEY);
      window.localStorage.removeItem(COMPLETED_STEPS_STORAGE_KEY);
      window.localStorage.removeItem(CURRENT_STEP_STORAGE_KEY);
    }
  }, []);

  const inProgressStep = useMemo(() => {
    const matchedStep = STEP_SAVE_ORDER.find((s) => s === currentStep);
    return matchedStep ? stepMutations[matchedStep] : undefined;
  }, [currentStep, stepMutations]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("applicationId");
    if (!idFromUrl && applicationId) {
      params.set("applicationId", applicationId);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    }
  }, [applicationId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (applicationId || isInitializingDraft) return;

    const createDraft = async () => {
      try {
        setIsInitializingDraft(true);
        const newId = await ensureDraft({});
        if (!newId) return;
        const params = new URLSearchParams(window.location.search);
        params.set("applicationId", newId);
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${params.toString()}`
        );
      } catch (error) {
        console.error("Failed to initialize application draft", error);
      } finally {
        setIsInitializingDraft(false);
      }
    };

    void createDraft();
  }, [applicationId, ensureDraft, isInitializingDraft]);

  return {
    applicationId,
    ensureDraft,
    submitStep,
    currentStep,
    goToStep,
    goToNext,
    canGoToStep,
    isStepComplete,
    completedSteps,
    resetFlow,
    setExistingApplicationId,
    // expose mutations for UI-level loading/error states
    createDraftMutation,
    stepMutations,
    activeStepMutation: inProgressStep,
  };
};
