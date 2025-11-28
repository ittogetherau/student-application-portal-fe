import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormArrayInputProps {
  name: string; // "other_languages"
  index: number; // 0, 1, 2...
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
    register,
    formState: { errors },
  } = useFormContext();

  const fieldName = `${name}.${index}` as const;
  const error = (errors[name] as any)?.[index]?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          placeholder={placeholder}
          {...register(fieldName)}
          className="flex-1"
        />

        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          ✕
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
