"use client";

import { useCallback } from "react";
import type {
  StepUpdateResponse,
} from "@/service/application-steps.service";
import type { ServiceResponse } from "@/shared/types/service";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  type DefaultValues,
  type FieldValues,
  type Resolver,
  useForm,
} from "react-hook-form";
import { useApplicationStepMutations } from "./use-application-steps.hook";
import { useFormPersistence } from "./use-form-persistence.hook";

type UseStepFormOptions<T extends FieldValues> = {
  applicationId: string;
  stepId: number;
  resolver: Resolver<T>;
  defaultValues: DefaultValues<T>;
  enabled?: boolean;
  mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
  reValidateMode?: "onSubmit" | "onBlur" | "onChange";
  normalizeBeforeSave?: (values: T) => T;
  onDataLoaded?: (data: T) => void;
};

export const useStepForm = <T extends FieldValues>({
  applicationId,
  stepId,
  resolver,
  defaultValues,
  enabled = true,
  mode = "onSubmit",
  reValidateMode = "onChange",
  normalizeBeforeSave,
  onDataLoaded,
}: UseStepFormOptions<T>) => {
  const mutation = useApplicationStepMutations(applicationId)[
    stepId as keyof ReturnType<typeof useApplicationStepMutations>
  ] as unknown as UseMutationResult<
    ServiceResponse<StepUpdateResponse>,
    Error,
    T,
    unknown
  >;

  const methods = useForm<T>({
    resolver,
    defaultValues,
    mode,
    reValidateMode,
  });

  const { saveOnSubmit } = useFormPersistence<T>({
    applicationId,
    stepId,
    form: methods,
    enabled,
    onDataLoaded,
  });

  const onSubmit = useCallback(
    (values: T) => {
      const payload = normalizeBeforeSave
        ? normalizeBeforeSave(values)
        : values;
      saveOnSubmit(payload);
      mutation.mutate(payload);
    },
    [mutation, normalizeBeforeSave, saveOnSubmit],
  );

  return { methods, mutation, onSubmit };
};

