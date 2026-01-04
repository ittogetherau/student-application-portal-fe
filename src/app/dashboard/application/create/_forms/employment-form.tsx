"use client";

import { Button } from "@/components/ui/button";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormRadio } from "@/components/ui/forms/form-radio";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import {
  createEmptyEmploymentEntry,
  defaultEmploymentValues,
  employmentSchema,
  type EmploymentFormValues,
} from "@/validation/application/employment";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import ApplicationStepHeader from "../_components/application-step-header";

const stepId = 8;

const EmploymentForm = ({ applicationId }: { applicationId: string }) => {
  const employmentMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentSchema),
    defaultValues: defaultEmploymentValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const canAddMore = (fields?.length || 0) < 10;

  const onSubmit = (values: EmploymentFormValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    employmentMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <section className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              For casual, seasonal, contract and shift work, use the current
              number of hours worked per week to determine whether full time (35
              hours or more per week) or part-time employed (less than 35 hours
              per week).
            </p>

            <p className="text-sm mb-3">
              Which BEST describes your current employment status?
            </p>
            <FormRadio
              name="employment_status"
              label=""
              options={[
                "01 - Fulltime employee",
                "02 - Part-time employee",
                "03 - Self-employed - not employing others",
                "04 - Employer",
                "05 - Employed - unpaid worker in family business",
                "06 - Unemployed - seeking fulltime work",
                "07 - Unemployed - seeking parttime work",
                "08 - Not employed - not seeking employment",
                "09 - Not Specified",
              ]}
            />
          </div>
        </section>

        {/* Detailed Employment History Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Employment History</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canAddMore}
              onClick={() => append(createEmptyEmploymentEntry())}
            >
              Add Entry
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Entry {index + 1}</p>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name={`entries.${index}.employer`}
                    label="Employer"
                    placeholder="e.g. ABC Pty Ltd"
                  />

                  <FormInput
                    name={`entries.${index}.role`}
                    label="Role"
                    placeholder="e.g. IT Support Engineer"
                  />

                  <FormInput
                    name={`entries.${index}.industry`}
                    label="Industry"
                    placeholder="e.g. Information Technology"
                  />

                  <FormInput
                    name={`entries.${index}.responsibilities`}
                    label="Responsibilities"
                    placeholder="e.g. Help desk, ticket triage..."
                  />

                  <FormInput
                    name={`entries.${index}.start_date`}
                    label="Start Date"
                    type="date"
                  />

                  <FormInput
                    name={`entries.${index}.end_date`}
                    label="End Date"
                    type="date"
                  />
                </div>

                <div className="pl-1">
                  <FormCheckbox
                    name={`entries.${index}.is_current`}
                    label="I currently work in this role"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <ApplicationStepHeader className="mt-8 pt-6 border-t">
          <Button type="submit" disabled={employmentMutation.isPending}>
            {employmentMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default EmploymentForm;
