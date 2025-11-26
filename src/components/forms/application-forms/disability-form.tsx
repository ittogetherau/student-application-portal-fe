"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import FormField from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";

const disabilitySchema = z.object({
  hasDisability: z.string().min(1, "Please select an option"),
  disabilityTypes: z.record(z.boolean()).optional(),
});

type DisabilityValues = z.infer<typeof disabilitySchema>;

export default function DisabilityForm() {
  const { watch, setValue, handleSubmit, reset } = useForm<DisabilityValues>({
    resolver: zodResolver(disabilitySchema),
    defaultValues: {
      hasDisability: "",
      disabilityTypes: {},
    },
  });

  const hasDisability = watch("hasDisability");
  const disabilityTypes = watch("disabilityTypes");

  const disabilities = [
    { id: "hearing", label: "Hearing/deaf" },
    { id: "physical", label: "Physical" },
    { id: "intellectual", label: "Intellectual" },
    { id: "learning", label: "Learning" },
    { id: "mental", label: "Mental illness" },
    { id: "brain", label: "Acquired brain impairment" },
    { id: "vision", label: "Vision" },
    { id: "medical", label: "Medical condition" },
    { id: "other", label: "Other" },
  ];

  const onSubmit = (values: DisabilityValues) => {
    console.log("Disability form submitted", values);
    reset(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Do you consider yourself to have a disability, impairment or long-term condition?"
        required
      >
        <RadioGroup
          value={hasDisability}
          onValueChange={(value) => setValue("hasDisability", value)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="disability-yes" />
              <Label
                htmlFor="disability-yes"
                className="font-normal cursor-pointer"
              >
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="disability-no" />
              <Label
                htmlFor="disability-no"
                className="font-normal cursor-pointer"
              >
                No
              </Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      {hasDisability === "yes" && (
        <FormField label="If Yes, select from the list below:">
          <div className="space-y-3">
            {disabilities.map((disability) => (
              <div key={disability.id} className="flex items-center space-x-2">
                <Checkbox
                  id={disability.id}
                  checked={disabilityTypes?.[disability.id] || false}
                  onCheckedChange={(checked) =>
                    setValue(`disabilityTypes.${disability.id}`, checked)
                  }
                />
                <Label
                  htmlFor={disability.id}
                  className="font-normal cursor-pointer"
                >
                  {disability.label}
                </Label>
              </div>
            ))}
          </div>
        </FormField>
      )}

      <div className="flex justify-end">
        <Button type="submit">Submit Disability</Button>
      </div>

      <style>{`
        .required::after {
          content: " *";
          color: hsl(var(--destructive));
        }
      `}</style>
    </form>
  );
}
