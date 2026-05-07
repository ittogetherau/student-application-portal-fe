import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getFieldError } from "./form-errors";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  maxLength?: number;
  description?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  min,
  max,
  maxLength,
  description,
  disabled = false,
  readOnly = false,
}: FormInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = getFieldError(errors, name)?.message as string | undefined;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <div className="relative">
            <Input
              id={name}
              ref={ref}
              type={currentType}
              placeholder={placeholder}
              min={min}
              max={max}
              maxLength={maxLength}
              aria-invalid={!!error}
              value={
                currentType === "number" && typeof value === "number" && Number.isNaN(value)
                  ? ""
                  : (value ?? "")
              }
              onChange={(e) => {
                if (currentType === "number") {
                  onChange(e.target.value === "" ? undefined : e.target.valueAsNumber);
                } else {
                  onChange(e.target.value);
                }
              }}
              onBlur={onBlur}
              disabled={disabled}
              readOnly={readOnly}
              className={cn(isPassword && "pr-10")}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}
      />

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
