/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { useStepForm } from "@/features/application-form/hooks/use-step-form.hook";
import {
  createEmptyQualification,
  defaultQualificationsValues,
  qualificationsSchema,
  type QualificationsFormValues,
} from "@/features/application-form/validations/qualifications";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useFieldArray, useWatch } from "react-hook-form";
import ApplicationStepHeader from "../application-step-header";

const stepId = 7;

const QualificationsForm = ({ applicationId }: { applicationId: string }) => {
  const {
    methods,
    mutation: qualificationsMutation,
    onSubmit,
  } = useStepForm<QualificationsFormValues>({
    applicationId,
    stepId,
    resolver: zodResolver(qualificationsSchema),
    defaultValues: defaultQualificationsValues,
    enabled: !!applicationId,
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications",
  });

  const hasQualifications = useWatch({
    control,
    name: "has_qualifications",
  });

  // Reset qualifications when "No" is selected
  useEffect(() => {
    if (hasQualifications === "No") {
      methods.setValue("qualifications", []);
    } else if (hasQualifications === "Yes" && fields.length === 0) {
      append(createEmptyQualification() as any);
    }
  }, [hasQualifications, methods, fields.length, append]);

  const canAddMore = fields.length < 10;

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <section className="space-y-6">
          <div className="space-y-6">
            <div className="border p-4 rounded-lg">
              <p className="text-sm mb-3">
                Have you successfully completed any previous qualifications?
              </p>
              <FormRadio
                name="has_qualifications"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {hasQualifications === "Yes" && (
              <div className="">
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Qualification {index + 1}</p>

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

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormInput
                          name={`qualifications.${index}.qualification_name`}
                          label="Qualification Name"
                          placeholder="Enter qualification name"
                        />

                        <FormInput
                          name={`qualifications.${index}.institution`}
                          label="Institution"
                          placeholder="Enter institution"
                        />

                        <FormInput
                          name={`qualifications.${index}.field_of_study`}
                          label="Field of Study"
                          placeholder="Enter field of study"
                        />

                        <FormInput
                          name={`qualifications.${index}.grade`}
                          label="Grade"
                          placeholder="Enter grade"
                        />

                        <FormInput
                          name={`qualifications.${index}.completion_date`}
                          label="Completion Date"
                          type="date"
                        />

                        <FormInput
                          name={`qualifications.${index}.certificate_number`}
                          label="Certificate Number"
                          placeholder="Enter certificate number"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canAddMore}
                onClick={() => append(createEmptyQualification() as any)}
              >
                <Plus />
                Add Qualification
              </Button>
            </div>
          </div>
        </section>

        <ApplicationStepHeader>
          <Button type="submit" disabled={qualificationsMutation.isPending}>
            {qualificationsMutation.isPending ? (
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

export default QualificationsForm;
