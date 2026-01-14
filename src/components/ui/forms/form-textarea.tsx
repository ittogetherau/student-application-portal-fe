import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getFieldError } from "./form-errors";

interface FormTextareaProps {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    rows?: number;
}

export function FormTextarea({
    name,
    label,
    placeholder,
    description,
    rows = 4,
}: FormTextareaProps) {
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
                    <Textarea
                        id={name}
                        ref={ref}
                        placeholder={placeholder}
                        rows={rows}
                        aria-invalid={!!error}
                        value={value ?? ""}
                        onChange={onChange}
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
