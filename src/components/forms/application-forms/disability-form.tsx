"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormInput } from "../../ui/forms/form-input";
import { FormCheckbox } from "../../ui/forms/form-checkbox";
import { FormArrayInput } from "../../ui/forms/form-array-input";

const disabilitySchema = z.object({
  has_disability: z.boolean(),
  disability_type: z.string().min(1, "Disability type is required"),
  disability_details: z.string().min(1, "Details are required"),
  support_required: z.string().min(1, "Support required is required"),
  has_documentation: z.boolean(),
  documentation_status: z.string().min(1, "Documentation status is required"),
  adjustments_needed: z.array(z.string().min(1, "Adjustment cannot be empty")),
});

type DisabilityValues = z.infer<typeof disabilitySchema>;

export default function DisabilityForm() {
  const methods = useForm<DisabilityValues>({
    resolver: zodResolver(disabilitySchema),
    defaultValues: {
      has_disability: false,
      disability_type: "",
      disability_details: "",
      support_required: "",
      has_documentation: false,
      documentation_status: "",
      adjustments_needed: [],
    },
  });

  const { handleSubmit, control } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "adjustments_needed",
  });

  const canAdd = fields.length < 5;

  const onSubmit = (values: DisabilityValues) => {
    console.log(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 rounded-lg border p-4">
          <FormCheckbox
            name="has_disability"
            label="I have a disability, impairment, or long-term condition"
          />

          <FormInput
            name="disability_type"
            label="Disability Type"
            placeholder="e.g., Vision, Physical, Learning"
          />

          <FormInput
            name="disability_details"
            label="Disability Details"
            placeholder="Provide details about your condition"
          />

          <FormInput
            name="support_required"
            label="Support Required"
            placeholder="What support do you require?"
          />

          <FormCheckbox name="has_documentation" label="I have documentation" />

          <FormInput
            name="documentation_status"
            label="Documentation Status"
            placeholder="e.g., Pending, Submitted, Not available"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Adjustments Needed</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append("")}
              disabled={!canAdd}
            >
              Add Adjustment
            </Button>
          </div>

          <div className="space-y-2">
            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No adjustments added.
              </p>
            ) : null}

            {fields.map((field, index) => (
              <FormArrayInput
                key={field.id}
                name="adjustments_needed"
                index={index}
                placeholder="Adjustment description"
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Submit Disability</Button>
        </div>
      </form>
    </FormProvider>
  );
}
