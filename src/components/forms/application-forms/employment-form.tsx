"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormCheckbox } from "../../ui/forms/form-checkbox";

const employmentEntrySchema = z.object({
  employer: z.string().min(1, "Employer is required"),
  role: z.string().min(1, "Role is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_current: z.boolean(),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  industry: z.string().min(1, "Industry is required"),
});

const employmentSchema = z.object({
  entries: z.array(employmentEntrySchema).min(1, "Add at least one entry"),
});

type EmploymentFormValues = z.infer<typeof employmentSchema>;

const emptyEntry: EmploymentFormValues["entries"][number] = {
  employer: "",
  role: "",
  start_date: "",
  end_date: "",
  is_current: false,
  responsibilities: "",
  industry: "",
};

export default function EmploymentForm() {
  const methods = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      entries: [emptyEntry],
    },
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const canAddMore = fields.length < 10; // arbitrary cap; tweak if you want

  const onSubmit = (values: EmploymentFormValues) => {
    // 👇 matches exactly the shape you described
    console.log(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Employment History</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddMore}
            onClick={() => append(emptyEntry)}
          >
            Add Entry
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Entry {index + 1}</p>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name={`entries.${index}.employer`}
                  label="Employer"
                  placeholder="e.g. ABC Pty Ltd"
                />

                <FormInput
                  name={`entries.${index}.role`}
                  label="Role"
                  placeholder="e.g. IT Support Engineer"
                />

                <FormInput
                  name={`entries.${index}.industry`}
                  label="Industry"
                  placeholder="e.g. Information Technology"
                />

                <FormInput
                  name={`entries.${index}.responsibilities`}
                  label="Responsibilities"
                  placeholder="e.g. Help desk, ticket triage..."
                />

                <FormInput
                  name={`entries.${index}.start_date`}
                  label="Start Date"
                  type="date"
                />

                <FormInput
                  name={`entries.${index}.end_date`}
                  label="End Date"
                  type="date"
                />
              </div>

              <FormCheckbox
                name={`entries.${index}.is_current`}
                label="I currently work in this role"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit">Submit Employment</Button>
        </div>
      </form>
    </FormProvider>
  );
}
