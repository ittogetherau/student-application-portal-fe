import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FormCheckboxProps {
  name: string;
  label: string;
}

export function FormCheckbox({ name, label }: FormCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<Record<string, unknown>>();

  const error = (errors[name] as { message?: string } | undefined)?.message;

  return (
    <div className="flex items-center gap-2">
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ref } }) => (
          <Checkbox
            ref={ref}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
        )}
      />

      <Label className="cursor-pointer" htmlFor={name}>
        {label}
      </Label>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
