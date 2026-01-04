"use client";

import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormSelect } from "@/components/ui/forms/form-select";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import {
  defaultHealthCoverValues,
  healthCoverSchema,
  type HealthCoverValues,
} from "@/validation/application/health-cover";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

const stepId = 3;

const HealthCoverForm = ({ applicationId }: { applicationId: string }) => {
  const healthCoverMutation =
    useApplicationStepMutations(applicationId)[stepId];
  const getStepData = useApplicationFormDataStore((state) => state.getStepData);

  const initialValues = useMemo(() => {
    if (!applicationId) return defaultHealthCoverValues;
    const persistedData = getStepData<HealthCoverValues>(stepId);
    if (persistedData) {
      return { ...defaultHealthCoverValues, ...persistedData };
    }
    return defaultHealthCoverValues;
  }, [applicationId, getStepData]);

  const methods = useForm<HealthCoverValues>({
    resolver: zodResolver(healthCoverSchema),
    defaultValues: initialValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const { handleSubmit } = methods;

  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  useEffect(() => {
    if (!applicationId) return;

    const persistedData = getStepData<HealthCoverValues>(stepId);
    if (persistedData) {
      methods.reset({ ...defaultHealthCoverValues, ...persistedData });
    }
  }, [applicationId, methods, getStepData]);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          if (applicationId) {
            saveOnSubmit(values);
          }
          healthCoverMutation.mutate(values);
        })}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput name="provider" label="Provider" placeholder="Medibank" />

          <FormInput
            name="policy_number"
            label="Policy Number"
            placeholder="ABC12345"
          />

          <FormInput name="start_date" label="Start Date" type="date" />

          <FormInput name="end_date" label="End Date" type="date" />

          <FormSelect
            name="coverage_type"
            label="Coverage Type"
            placeholder="Select coverage type"
            options={[
              { value: "single", label: "Single" },
              { value: "couple", label: "Couple" },
              { value: "family", label: "Family" },
              { value: "overseas", label: "Overseas Visitor" },
              { value: "other", label: "Other" },
            ]}
          />

          <FormInput name="cost" label="Cost" type="number" placeholder="0" />
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={healthCoverMutation.isPending}>
            {healthCoverMutation.isPending ? "Saving..." : "Save "}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default HealthCoverForm;
