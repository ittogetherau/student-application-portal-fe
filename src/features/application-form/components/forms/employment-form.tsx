"use client";

import { FormCheckbox } from "@/components/forms/form-checkbox";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import {
  createEmptyEmploymentEntry,
  defaultEmploymentValues,
  employmentSchema,
  type EmploymentFormValues,
} from "@/features/application-form/utils/validations/employment";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Info } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useApplicationStepMutations } from "../../hooks/use-application-steps.hook";
import ApplicationStepHeader from "../application-step-header";

const stepId = 8;

const EmploymentForm = ({ applicationId }: { applicationId: string }) => {
  const employmentMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentSchema),
    defaultValues: defaultEmploymentValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const { control, handleSubmit, watch } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const canAddMore = (fields?.length || 0) < 10;

  // Watch entries to handle conditional logic
  const watchEntries = watch("entries");

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
          <section className="border p-4 rounded-lg">
            <div className="flex items-center gap-1 mb-2">
              <p>Which BEST describes your current employment status?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <span className="max-w-[32ch] block">
                    For casual, seasonal, contract and shift work, use the
                    current number of hours worked per week to determine whether
                    full time (35 hours or more per week) or part-time employed
                    (less than 35 hours per week).
                  </span>
                </TooltipContent>
              </Tooltip>
            </div>

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
          </section>
        </section>

        <>
          <div className="space-y-6">
            {fields.map((field, index) => {
              const isCurrent = watchEntries?.[index]?.is_current;

              return (
                <div key={field.id} className="space-y-6 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Entry {index + 1}</p>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      name={`entries.${index}.employer`}
                      label="Employer *"
                      placeholder="Enter employer name"
                    />

                    <FormInput
                      name={`entries.${index}.role`}
                      label="Role *"
                      placeholder="Enter role"
                    />

                    <FormInput
                      name={`entries.${index}.industry`}
                      label="Industry *"
                      placeholder="Enter industry"
                    />

                    <FormInput
                      name={`entries.${index}.responsibilities`}
                      label="Responsibilities *"
                      placeholder="Describe responsibilities"
                    />

                    <FormInput
                      name={`entries.${index}.start_date`}
                      label="Start Date *"
                      type="date"
                    />

                    <div className="relative">
                      <FormInput
                        name={`entries.${index}.end_date`}
                        label={isCurrent ? "End Date" : "End Date *"}
                        type="date"
                        description={
                          isCurrent ? "Not required for current role" : ""
                        }
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 z-10 bg-background/50 cursor-not-allowed mt-6 rounded-md" />
                      )}
                    </div>
                  </div>

                  <div className="pt-2 px-1">
                    <FormCheckbox
                      name={`entries.${index}.is_current`}
                      label="I currently work in this role"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
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
        </>

        <ApplicationStepHeader>
          <Button type="submit" disabled={employmentMutation.isPending}>
            {employmentMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                Save & Continue
                <ChevronRight />
              </>
            )}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default EmploymentForm;
