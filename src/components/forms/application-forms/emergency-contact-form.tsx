"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "../../ui/forms/form-input";
import { FormCheckbox } from "../../ui/forms/form-checkbox";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(1, "Address is required"),
  is_primary: z.boolean(), // simple, non-optional boolean
});

const emergencyContactsSchema = z.object({
  contacts: z
    .array(contactSchema)
    .min(1, "Add at least one emergency contact")
    .max(3, "You can add up to 3 contacts"),
});

type EmergencyContactsValues = z.infer<typeof emergencyContactsSchema>;

const emptyContact: EmergencyContactsValues["contacts"][number] = {
  name: "",
  relationship: "",
  phone: "",
  email: "",
  address: "",
  is_primary: false,
};

export default function EmergencyContactForm() {
  const methods = useForm<EmergencyContactsValues>({
    resolver: zodResolver(emergencyContactsSchema),
    defaultValues: {
      contacts: [emptyContact],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const canAddMore = fields.length < 3;

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          // ✅ payload exactly as requested
          console.log(
            JSON.stringify(
              {
                contacts: values.contacts,
              },
              null,
              2
            )
          );
        })}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Emergency Contacts</h3>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(emptyContact)}
            disabled={!canAddMore}
          >
            Add Contact
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const contactError =
              (errors.contacts?.[index] as any) || ({} as any);

            return (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Contact {index + 1}</p>

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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput
                    name={`contacts.${index}.name`}
                    label="Name"
                    placeholder="Jane Doe"
                  />
                  <FormInput
                    name={`contacts.${index}.relationship`}
                    label="Relationship"
                    placeholder="Sister"
                  />
                  <FormInput
                    name={`contacts.${index}.phone`}
                    label="Phone"
                    placeholder="+61 400 000 000"
                  />
                  <FormInput
                    name={`contacts.${index}.email`}
                    label="Email"
                    placeholder="user@example.com"
                    type="email"
                  />
                </div>

                <FormInput
                  name={`contacts.${index}.address`}
                  label="Address"
                  placeholder="123 Main Street, Suburb"
                />

                <FormCheckbox
                  name={`contacts.${index}.is_primary`}
                  label="Primary contact"
                />

                {/* optional: per-contact general error */}
                {contactError?.root?.message && (
                  <p className="text-sm text-red-500">
                    {contactError.root.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button type="submit">Submit Emergency Contacts</Button>
        </div>
      </form>
    </FormProvider>
  );
}
