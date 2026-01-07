"use client";

import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormRadio } from "@/components/ui/forms/form-radio";
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
import { FormProvider, useForm, useWatch } from "react-hook-form";

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
  const { handleSubmit, control, setValue } = methods;

  // Watch the OSHC selection to conditionally show health cover fields
  const arrangeOSHC = useWatch({
    control,
    name: "arrange_OSHC",
  });

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
          // Data is already in API format
          healthCoverMutation.mutate(values);
        })}
      >
        {/* OSHC Application Question */}
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">
              Do you wish to apply for Overseas Student Health Cover (OSHC)
              through your education provider?
            </p>
            <p className="text-xs italic mb-4">
              <strong>Note:</strong> If you select yes, OSHC cost will be added
              as a cost in your offer letter.
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="arrange_OSHC_radio"
                  value="yes"
                  checked={arrangeOSHC === true}
                  onChange={() => setValue("arrange_OSHC", true, { shouldValidate: true })}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="arrange_OSHC_radio"
                  value="no"
                  checked={arrangeOSHC === false}
                  onChange={() => setValue("arrange_OSHC", false, { shouldValidate: true })}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Health Cover Form - Only show if user selected true */}
        {arrangeOSHC && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              name="OSHC_provider"
              label="OSHC Provider"
              placeholder="e.g., Allianze, Medibank, Bupa"
            />

            <FormSelect
              name="OSHC_type"
              label="OSHC Type"
              placeholder="Select OSHC type"
              options={[
                { value: "Single", label: "Single" },
                { value: "Couple", label: "Couple" },
                { value: "Family", label: "Family" },
              ]}
            />

            <FormInput name="OSHC_start_date" label="Start Date" type="date" />

            <FormInput name="OSHC_end_date" label="End Date" type="date" />

            <FormInput
              name="OSHC_duration"
              label="OSHC Duration"
              placeholder="e.g., 12 months, 2 years"
            />

            <FormInput
              name="OSHC_fee"
              label="OSHC Fee"
              type="number"
              placeholder="0"
            />
          </div>
        )}

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
