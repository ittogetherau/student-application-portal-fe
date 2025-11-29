"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormCheckbox } from "../../ui/forms/form-checkbox";

import {
  disabilitySchema,
  type DisabilityValues,
  defaultDisabilityValues,
} from "@/validation/application/disability";

export default function DisabilityForm() {
  const form = useForm({
    resolver: zodResolver(disabilitySchema),
    defaultValues: defaultDisabilityValues,
  });

  const onSubmit = (values: DisabilityValues) => {
    const formattedValues = {
      ...values,
      adjustments_needed: values.adjustments_needed
        ? values.adjustments_needed
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "")
        : [],
    };

    console.log(JSON.stringify(formattedValues, null, 2));
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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

          <FormInput
            name="adjustments_needed"
            label="Adjustments Needed"
            placeholder="Enter adjustments separated by commas (e.g., Extra time, Quiet room, Assistive technology)"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Submit Disability</Button>
        </div>
      </form>
    </FormProvider>
  );
}
