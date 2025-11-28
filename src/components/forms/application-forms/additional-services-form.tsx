"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";

const serviceSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  fee: z.number().nonnegative("Fee must be zero or positive"),
  selected: z.boolean(),
});

const additionalServicesSchema = z.object({
  services: z.array(serviceSchema).min(1, "Add at least one service"),
});

type AdditionalServicesValues = z.infer<typeof additionalServicesSchema>;

const emptyService: AdditionalServicesValues["services"][number] = {
  service_id: "",
  name: "",
  description: "",
  fee: 0,
  selected: false,
};

export default function AdditionalServicesForm() {
  const methods = useForm<AdditionalServicesValues>({
    resolver: zodResolver(additionalServicesSchema),
    defaultValues: {
      services: [emptyService],
    },
  });

  const { control, handleSubmit, watch } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const services = watch("services") ?? [];
  const totalAdditionalFees = services
    .filter((s) => s.selected)
    .reduce((sum, s) => sum + (s.fee || 0), 0);

  const canAddMore = fields.length < 10; // tweak if you want

  const onSubmit = (values: AdditionalServicesValues) => {
    const payload = {
      services: values.services,
      total_additional_fees: totalAdditionalFees,
    };

    console.log(JSON.stringify(payload, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Additional Services</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddMore}
            onClick={() => append(emptyService)}
          >
            Add Service
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Service {index + 1}</p>
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
                  name={`services.${index}.service_id`}
                  label="Service ID"
                  placeholder="e.g. SVC-001"
                />

                <FormInput
                  name={`services.${index}.name`}
                  label="Service Name"
                  placeholder="e.g. Airport Pickup"
                />

                <FormInput
                  name={`services.${index}.description`}
                  label="Description"
                  placeholder="Short description of the service"
                />

                <FormInput
                  name={`services.${index}.fee`}
                  label="Fee"
                  type="number"
                  placeholder="0"
                />
              </div>

              <FormCheckbox
                name={`services.${index}.selected`}
                label="Select this service"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border rounded-lg px-4 py-3">
          <span className="text-sm font-medium">
            Total additional fees (selected services)
          </span>
          <span className="font-semibold">
            ${totalAdditionalFees.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Submit Additional Services</Button>
        </div>
      </form>
    </FormProvider>
  );
}
