"use client";

import { FormCheckbox } from "@/components/forms/form-checkbox";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";
import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import {
  createEmptyContact,
  emergencyContactsSchema,
  type EmergencyContactsValues,
} from "@/features/application-form/utils/validations/emergency-contacts";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useApplicationStepMutations } from "../../hooks/use-application-steps.hook";

const STEP_ID = 2;

const sanitizeEmergencyContacts = (input: unknown): EmergencyContactsValues => {
  const source = input as
    | { contacts?: Array<Record<string, unknown>> }
    | Array<Record<string, unknown>>
    | undefined;

  const rawContacts = Array.isArray(source)
    ? source
    : Array.isArray(source?.contacts)
      ? source.contacts
      : [];

  const contacts = rawContacts.map((contact) => ({
    name: typeof contact?.name === "string" ? contact.name : "",
    relationship:
      typeof contact?.relationship === "string" ? contact.relationship : "",
    phone: typeof contact?.phone === "string" ? contact.phone : "",
    email: typeof contact?.email === "string" ? contact.email : "",
    address: typeof contact?.address === "string" ? contact.address : "",
    is_primary: Boolean(contact?.is_primary),
  }));

  return {
    contacts: contacts.length ? contacts : [createEmptyContact()],
  };
};

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
    onDataLoaded: (data) => {
      methods.reset(sanitizeEmergencyContacts(data));
    },
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
          const normalizedValues = sanitizeEmergencyContacts(values);

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
