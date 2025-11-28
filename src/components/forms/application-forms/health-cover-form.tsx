"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";

const healthCoverSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  policy_number: z.string().min(1, "Policy number is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  coverage_type: z.string().min(1, "Coverage type is required"),
  cost: z.number().nonnegative("Cost must be zero or positive"),
});

type HealthCoverValues = z.infer<typeof healthCoverSchema>;

export default function HealthCoverForm() {
  const methods = useForm<HealthCoverValues>({
    resolver: zodResolver(healthCoverSchema),
    defaultValues: {
      provider: "",
      policy_number: "",
      start_date: "",
      end_date: "",
      coverage_type: "",
      cost: 0,
    },
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
