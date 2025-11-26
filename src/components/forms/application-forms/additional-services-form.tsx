"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormField from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";

const additionalServicesSchema = z.object({
  requestAdditionalServices: z.string().min(1, "Please select an option"),
});

type AdditionalServicesValues = z.infer<typeof additionalServicesSchema>;

export default function AdditionalServicesForm() {
  const { watch, setValue, handleSubmit, reset } = useForm<AdditionalServicesValues>({
    resolver: zodResolver(additionalServicesSchema),
    defaultValues: {
      requestAdditionalServices: "",
    },
  });

  const requestAdditionalServices = watch("requestAdditionalServices");

  const onSubmit = (values: AdditionalServicesValues) => {
    console.log("Additional services submitted", values);
    reset(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Do you want to request additional services?" required>
        <RadioGroup
          value={requestAdditionalServices}
          onValueChange={(value) =>
            setValue("requestAdditionalServices", value)
          }
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="services-yes" />
              <Label
                htmlFor="services-yes"
                className="font-normal cursor-pointer"
              >
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="services-no" />
              <Label
                htmlFor="services-no"
                className="font-normal cursor-pointer"
              >
                No
              </Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      <div className="flex justify-end">
        <Button type="submit">Submit Additional Services</Button>
      </div>

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </form>
  );
}
