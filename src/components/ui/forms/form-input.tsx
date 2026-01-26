import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getFieldError } from "./form-errors";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  description?: string;
}

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  description,
}: FormInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = getFieldError(errors, name)?.message as string | undefined;

  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <Input
            id={name}
            ref={ref}
            type={type}
            placeholder={placeholder}
            aria-invalid={!!error}
            value={value ?? ""}
            onChange={(e) => {
              const val = type === "number" ? e.target.valueAsNumber : e.target.value;
              onChange(val);
            }}
            onBlur={onBlur}
          />
        )}
      />

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
