import { Controller, useFormContext } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getFieldError } from "./form-errors";

type Option = {
  value: string;
  label: string;
};

interface FormSelectProps {
  name: string;
  label: string;
  placeholder?: string;
  options: ReadonlyArray<Option>;
}

export function FormSelect({
  name,
  label,
  placeholder = "Select an option",
  options,
}: FormSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = getFieldError(errors, name)?.message as string | undefined;

  return (
    <div className="space-y-1 ">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref } }) => {
          // Ensure the value exists in the options list
          const isValidValue = options.some((opt) => opt.value === value);
          const displayValue = isValidValue ? (value as string) : "";

          return (
            <Select
              value={displayValue}
              onValueChange={onChange}
              defaultValue={displayValue}
            >
              <SelectTrigger ref={ref} id={name} aria-invalid={!!error}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
