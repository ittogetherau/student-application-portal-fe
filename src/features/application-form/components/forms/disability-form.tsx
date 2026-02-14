"use client";

import { FormCheckbox } from "@/components/forms/form-checkbox";
import { FormRadio } from "@/components/forms/form-radio";
import { Button } from "@/components/ui/button";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";
import { useStepForm } from "@/features/application-form/hooks/use-step-form.hook";
import {
  defaultDisabilityValues,
  disabilitySchema,
  type DisabilityFormValues,
} from "@/features/application-form/validations/disability";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { FormProvider, useWatch } from "react-hook-form";

const stepId = 5;

const DisabilityForm = ({ applicationId }: { applicationId: string }) => {
  const normalizeDisabilityValues = (
    values: DisabilityFormValues,
  ): DisabilityFormValues => {
    const cleanedValues = { ...values };
    if (cleanedValues.has_disability === "No") {
      cleanedValues.disability_hearing = false;
      cleanedValues.disability_physical = false;
      cleanedValues.disability_intellectual = false;
      cleanedValues.disability_learning = false;
      cleanedValues.disability_mental_illness = false;
      cleanedValues.disability_acquired_brain = false;
      cleanedValues.disability_vision = false;
      cleanedValues.disability_medical_condition = false;
      cleanedValues.disability_other = false;
    }
    return disabilitySchema.parse(cleanedValues);
  };

  const {
    methods,
    mutation: disabilityMutation,
    onSubmit,
  } = useStepForm<DisabilityFormValues>({
    applicationId,
    stepId,
    resolver: zodResolver(disabilitySchema),
    defaultValues: defaultDisabilityValues,
    enabled: !!applicationId,
    normalizeBeforeSave: normalizeDisabilityValues,
  });

  const hasDisability = useWatch({
    control: methods.control,
    name: "has_disability",
  });

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
        <section className="space-y-6 border p-4 rounded-lg">
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-3">
                Do you consider yourself to have a disability, impairment or
                long-term condition?
              </p>
              <FormRadio
                name="has_disability"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {hasDisability === "Yes" && (
              <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground italic">
                    If Yes, select the below list.
                  </p>
                  {methods.formState.isSubmitted &&
                    methods.formState.errors.disability_type && (
                      <p className="text-sm text-red-500 font-medium">
                        {methods.formState.errors.disability_type.message}
                      </p>
                    )}
                </div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pl-1 p-3 rounded-md transition-colors ${
                    methods.formState.isSubmitted &&
                    methods.formState.errors.disability_type
                      ? "bg-red-50/50 border border-red-200"
                      : "border border-transparent"
                  }`}
                >
                  <FormCheckbox
                    name="disability_hearing"
                    label="Hearing/deaf"
                  />
                  <FormCheckbox name="disability_physical" label="Physical" />
                  <FormCheckbox
                    name="disability_intellectual"
                    label="Intellectual"
                  />
                  <FormCheckbox name="disability_learning" label="Learning" />
                  <FormCheckbox
                    name="disability_mental_illness"
                    label="Mental illness"
                  />
                  <FormCheckbox
                    name="disability_acquired_brain"
                    label="Acquired brain impairment"
                  />
                  <FormCheckbox name="disability_vision" label="Vision" />
                  <FormCheckbox
                    name="disability_medical_condition"
                    label="Medical condition-18"
                  />
                  <FormCheckbox name="disability_other" label="Other-19" />
                </div>
              </div>
            )}
          </div>
        </section>

        <ApplicationStepHeader>
          <Button type="submit" disabled={disabilityMutation.isPending}>
            {disabilityMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                Save & Continue <ChevronRight />
              </>
            )}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default DisabilityForm;
