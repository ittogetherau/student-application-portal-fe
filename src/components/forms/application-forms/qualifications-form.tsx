"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import {
  createEmptyQualification,
  qualificationsSchema,
  type QualificationsFormValues,
} from "@/validation/application/qualifications";

export default function QualificationsForm() {
  const methods = useForm<QualificationsFormValues>({
    resolver: zodResolver(qualificationsSchema),
    defaultValues: {
      qualifications: [createEmptyQualification()],
    },
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications",
  });

  const canAddMore = fields.length < 10; // tweak if you want

  const onSubmit = (values: QualificationsFormValues) => {
    // 👇 matches the JSON shape you gave
    console.log(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Previous Qualifications</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddMore}
            onClick={() => append(createEmptyQualification())}
          >
            Add Qualification
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Qualification {index + 1}
                </p>

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
                  placeholder="e.g. Bachelor of IT"
                />

                <FormInput
                  name={`qualifications.${index}.institution`}
                  label="Institution"
                  placeholder="e.g. XYZ University"
                />

                <FormInput
                  name={`qualifications.${index}.field_of_study`}
                  label="Field of Study"
                  placeholder="e.g. Software Engineering"
                />

                <FormInput
                  name={`qualifications.${index}.grade`}
                  label="Grade"
                  placeholder="e.g. Distinction"
                />

                <FormInput
                  name={`qualifications.${index}.completion_date`}
                  label="Completion Date"
                  type="date"
                />

                <FormInput
                  name={`qualifications.${index}.certificate_number`}
                  label="Certificate Number"
                  placeholder="e.g. CERT-123456"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Qualifications</Button>
        </div>
      </form>
    </FormProvider>
  );
}
