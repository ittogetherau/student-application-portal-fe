"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormField from "@/components/forms/form-field";

interface AdditionalServicesFormProps {
  data: any;
  allData: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
}

export default function AdditionalServicesForm({
  data,
  onUpdate,
  onComplete,
}: AdditionalServicesFormProps) {
  const { watch, setValue } = useForm({
    defaultValues: data,
  });

  const requestAdditionalServices = watch("requestAdditionalServices");

  useEffect(() => {
    const subscription = watch((formValues) => {
      onUpdate(formValues);

      if (formValues.requestAdditionalServices !== undefined) {
        onComplete();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, onUpdate, onComplete]);

  return (
    <div className="space-y-6">
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

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}
