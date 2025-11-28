"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormInput } from "../../ui/forms/form-input";
import { FormArrayInput } from "../../ui/forms/form-array-input";
import {
  defaultLanguageAndCultureValues,
  languageAndCultureSchema,
  type LanguageAndCultureValues,
} from "@/validation/application/language-cultural";

export default function LanguageDefaultForm() {
  const methods = useForm<LanguageAndCultureValues>({
    resolver: zodResolver(languageAndCultureSchema),
    defaultValues: defaultLanguageAndCultureValues,
  });

  const { handleSubmit, control } = methods;

  const { fields, append, remove } = useFieldArray<
    LanguageAndCultureValues,
    "other_languages"
  >({
    control,
    name: "other_languages",
  });

  const onSubmit = (values: LanguageAndCultureValues) => {
    console.log(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            name="first_language"
            label="First language"
            placeholder="e.g. Nepali"
          />

          <FormInput
            name="english_proficiency"
            label="English proficiency"
            placeholder="e.g. Advanced"
          />

          <FormInput name="indigenous_status" label="Indigenous status" />

          <FormInput
            name="country_of_birth"
            label="Country of birth"
            placeholder="e.g. Nepal"
          />

          <FormInput
            name="citizenship_status"
            label="Citizenship status"
            placeholder="e.g. Citizen / PR"
          />

          <FormInput
            name="visa_type"
            label="Visa type"
            placeholder="Student visa"
          />

          <FormInput name="visa_expiry" label="Visa expiry" type="date" />

          <FormInput
            name="english_test_type"
            label="English test type"
            placeholder="IELTS / PTE"
          />

          <FormInput
            name="english_test_score"
            label="English test score"
            placeholder="e.g. 7.0"
          />

          <FormInput
            name="english_test_date"
            type="date"
            label="English test date"
          />
        </div>

        {/* other_languages dynamic list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Other languages</Label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append("")}
            >
              Add language
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <FormArrayInput
                key={field.id}
                name="other_languages"
                index={index}
                placeholder="e.g. Hindi"
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </div>

        <Button type="submit">Save language details</Button>
      </form>
    </FormProvider>
  );
}
