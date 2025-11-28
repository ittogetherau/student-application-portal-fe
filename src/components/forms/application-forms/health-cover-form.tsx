"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import {
  defaultHealthCoverValues,
  healthCoverSchema,
  type HealthCoverValues,
} from "@/validation/application/health-cover";

export default function HealthCoverForm() {
  const methods = useForm<HealthCoverValues>({
    resolver: zodResolver(healthCoverSchema),
    defaultValues: defaultHealthCoverValues,
  });

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          console.log(JSON.stringify(values, null, 2));
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

          <FormInput
            name="coverage_type"
            label="Coverage Type"
            placeholder="Single / Couple / Family"
          />

          <FormInput name="cost" label="Cost" type="number" placeholder="0" />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Submit Health Cover</Button>
        </div>
      </form>
    </FormProvider>
  );
}
