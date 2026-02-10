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
  disabled?: boolean;
}

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  description,
  disabled = false,
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
            value={
              type === "number" && typeof value === "number" && Number.isNaN(value)
                ? ""
                : (value ?? "")
            }
            onChange={(e) => {
              if (type === "number") {
                onChange(e.target.value === "" ? undefined : e.target.valueAsNumber);
              } else {
                onChange(e.target.value);
              }
            }}
            onBlur={onBlur}
            disabled={disabled}
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
