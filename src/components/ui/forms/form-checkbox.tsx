import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FormCheckboxProps {
  name: string;
  label: string;
}

export function FormCheckbox({ name, label }: FormCheckboxProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(name);
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={value}
        onCheckedChange={(checked) =>
          (register(name).onChange as any)({
            target: { name, value: checked === true },
          })
        }
      />

      <Label className="cursor-pointer">{label}</Label>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
