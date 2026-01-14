"use client";

import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Button } from "@/components/ui/button";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormSelect } from "@/components/ui/forms/form-select";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import {
  createEmptyContact,
  emergencyContactsSchema,
  type EmergencyContactsValues,
} from "@/validation/application/emergency-contacts";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

const STEP_ID = 2;

const EmergencyContactForm = ({ applicationId }: { applicationId: string }) => {
  const emergencyContactMutation =
    useApplicationStepMutations(applicationId)[STEP_ID];

  const methods = useForm<EmergencyContactsValues>({
    resolver: zodResolver(emergencyContactsSchema),
    defaultValues: {
      contacts: [createEmptyContact()],
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId: STEP_ID,
    form: methods,
    enabled: !!applicationId,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const maxContacts = 3;
  const canAddMore = fields.length < maxContacts;
  const contactsErrorMessage =
    errors.contacts?.message ?? errors.contacts?.root?.message;

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          const normalizedValues = {
            ...values,
            contacts: values.contacts.map((contact) => ({
              ...createEmptyContact(),
              ...contact,
            })),
          };

          if (applicationId) saveOnSubmit(normalizedValues);
          emergencyContactMutation.mutate(normalizedValues);
        })}
      >
        <div className="space-y-4">
          {fields.map((field, index) => {
            const contactError = errors.contacts?.[index];

            return (
              <div key={field.id} className="space-y-4 border p-4 rounded-lg">
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
                    placeholder="Enter full name"
                  />
                  <FormSelect
                    name={`contacts.${index}.relationship`}
                    label="Relationship"
                    placeholder="Select relationship"
                    options={[
                      { value: "parent", label: "Parent" },
                      { value: "sibling", label: "Sibling" },
                      { value: "spouse", label: "Spouse/Partner" },
                      { value: "relative", label: "Relative" },
                      { value: "friend", label: "Friend" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                  <FormInput
                    name={`contacts.${index}.phone`}
                    label="Phone"
                    placeholder="Enter phone number"
                  />
                  <FormInput
                    name={`contacts.${index}.email`}
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                  />
                </div>

                <FormInput
                  name={`contacts.${index}.address`}
                  label="Address"
                  placeholder="Enter street address"
                />

                <FormCheckbox
                  name={`contacts.${index}.is_primary`}
                  label="Primary contact"
                />

                {contactError?.root?.message && (
                  <p className="text-sm text-red-500">
                    {contactError.root.message}
                  </p>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(createEmptyContact())}
              disabled={!canAddMore}
            >
              <Plus /> Add More Contact
            </Button>
          </div>
        </div>

        {contactsErrorMessage && (
          <p className="text-sm text-red-500">{contactsErrorMessage}</p>
        )}

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={emergencyContactMutation.isPending}>
            {emergencyContactMutation.isPending
              ? "Saving..."
              : "Save & Continue"}

            <ChevronRight />
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default EmergencyContactForm;
