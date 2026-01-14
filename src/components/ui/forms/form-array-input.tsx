import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormArrayInputProps {
  name: string;
  index: number;
  placeholder?: string;
  onRemove: () => void;
}

export function FormArrayInput({
  name,
  index,
  placeholder,
  onRemove,
}: FormArrayInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<Record<string, unknown[]>>();

  const fieldName = `${name}.${index}` as const;
  // Use indexed error check explicitly
  const fieldError = (errors[name] as any)?.[index]?.message;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Controller
          name={fieldName}
          control={control}
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <Input
              ref={ref}
              placeholder={placeholder}
              value={(value as string) ?? ""}
              onChange={onChange}
              onBlur={onBlur}
              className="flex-1"
            />
          )}
        />

        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          Remove
        </Button>
      </div>

      {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
    </div>
  );
}
