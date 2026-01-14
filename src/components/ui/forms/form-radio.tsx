import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getFieldError } from "./form-errors";

interface FormRadioProps {
  name: string;
  label: string;
  options: string[] | { label: string; value: string }[];
  colMode?: boolean;
}

export function FormRadio({
  name,
  label,
  options,
  colMode = false,
}: FormRadioProps) {
  const {
    control,
    formState: { errors, isSubmitted },
  } = useFormContext<Record<string, unknown>>();

  const error = getFieldError(errors, name)?.message;

  return (
    <div className={`flex gap-2 ${colMode ? "flex-col" : "items-center"}`}>
      <Label>
        {label} {label && ": "}{" "}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <RadioGroup
            value={value as string}
            onValueChange={onChange}
            className="flex gap-4 flex-wrap"
          >
            {options.map((option) => {
              const optValue = typeof option === "string" ? option : option.value;
              const optLabel = typeof option === "string" ? option : option.label;
              return (
                <Label
                  key={optValue}
                  className="flex items-center space-x-2 cursor-pointer font-normal"
                >
                  <RadioGroupItem value={optValue} />
                  <span>{optLabel}</span>
                </Label>
              );
            })}
          </RadioGroup>
        )}
      />

      {isSubmitted && error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
