'use client';

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

  const formValues = watch();

  useEffect(() => {
    onUpdate(formValues);
  }, [formValues, onUpdate]);

  useEffect(() => {
    if (formValues.requestAdditionalServices !== undefined) {
      onComplete();
    }
  }, [formValues, onComplete]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="required">
          Do you want to request additional services?
        </Label>
        <RadioGroup
          value={formValues.requestAdditionalServices}
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
      </div>

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}

