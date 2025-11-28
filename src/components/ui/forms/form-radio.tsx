import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormRadioProps {
  name: string;
  label: string;
  options: string[];
}

export function FormRadio({ name, label, options }: FormRadioProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(name);
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1">
      <Label>{label}</Label>

      <RadioGroup
        value={value}
        onValueChange={(val) => {
          // manually set value
          (register(name).onChange as any)({
            target: { name, value: val },
          });
        }}
        className="flex gap-4 flex-wrap"
      >
        {options.map((option) => (
          <Label
            key={option}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <RadioGroupItem value={option} />
            <span>{option}</span>
          </Label>
        ))}
      </RadioGroup>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
