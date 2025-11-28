// components/form/form-input.tsx
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, type === "number" ? { valueAsNumber: true } : {})}
      />

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
