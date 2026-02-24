"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";
import { useStepForm } from "@/features/application-form/hooks/use-step-form.hook";
import {
  createEmptyContact,
  emergencyContactsSchema,
  type EmergencyContactsValues,
} from "@/features/application-form/validations/emergency-contacts";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus } from "lucide-react";
import { useEffect } from "react";
import { Controller, FormProvider, useFieldArray } from "react-hook-form";

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

  const primaryIndex = contacts.findIndex((contact) => contact.is_primary);
  if (contacts.length) {
    const primaryToKeep = primaryIndex >= 0 ? primaryIndex : 0;
    contacts.forEach((contact, index) => {
      contact.is_primary = index === primaryToKeep;
    });
  }

  return {
    contacts: contacts.length
      ? contacts
      : [{ ...createEmptyContact(), is_primary: true }],
  };
};

const EmergencyContactForm = ({ applicationId }: { applicationId: string }) => {
  const {
    methods,
    mutation: emergencyContactMutation,
    onSubmit,
  } = useStepForm<EmergencyContactsValues>({
    applicationId,
    stepId: STEP_ID,
    resolver: zodResolver(emergencyContactsSchema),
    defaultValues: {
      contacts: [{ ...createEmptyContact(), is_primary: true }],
    },
    enabled: !!applicationId,
    normalizeBeforeSave: sanitizeEmergencyContacts,
    onDataLoaded: (data) => {
      methods.reset(sanitizeEmergencyContacts(data));
    },
  });

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const maxContacts = 3;
  const canAddMore = fields.length < maxContacts;
  const contactsErrorMessage =
    errors.contacts?.message ?? errors.contacts?.root?.message;

  const setPrimaryContact = (
    indexToSelect: number,
    options?: { shouldDirty?: boolean },
  ) => {
    const contacts = getValues("contacts");
    contacts.forEach((_, index) => {
      setValue(`contacts.${index}.is_primary`, index === indexToSelect, {
        shouldValidate: true,
        shouldDirty: options?.shouldDirty ?? true,
      });
    });
  };

  useEffect(() => {
    const contacts = getValues("contacts");
    if (!contacts.length) return;

    const primaryIndexes = contacts
      .map((contact, index) => (contact.is_primary ? index : -1))
      .filter((index) => index >= 0);

    if (primaryIndexes.length !== 1) {
      const indexToSelect = primaryIndexes[0] ?? 0;
      contacts.forEach((_, index) => {
        setValue(`contacts.${index}.is_primary`, index === indexToSelect, {
          shouldValidate: true,
          shouldDirty: false,
        });
      });
    }
  }, [fields.length, getValues, setValue]);

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

                <div className="flex items-center gap-2">
                  <Controller
                    name={`contacts.${index}.is_primary`}
                    control={control}
                    render={({ field: { value, ref } }) => (
                      <Checkbox
                        id={`contacts.${index}.is_primary`}
                        ref={ref}
                        checked={Boolean(value)}
                        onCheckedChange={() => setPrimaryContact(index)}
                      />
                    )}
                  />

                  <Label
                    className="cursor-pointer select-none font-normal"
                    htmlFor={`contacts.${index}.is_primary`}
                  >
                    Primary contact
                  </Label>
                </div>

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
