"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormInput } from "../../ui/forms/form-input";
import { FormArrayInput } from "../../ui/forms/form-array-input";

const schema = z.object({
  first_language: z.string().min(1, "First language is required"),
  english_proficiency: z.string().min(1, "English proficiency is required"),
  other_languages: z
    .array(z.string().min(1, "Language cannot be empty"))
    .min(1, "Add at least one other language"),
  indigenous_status: z.string().min(1, "Indigenous status is required"),
  country_of_birth: z.string().min(1, "Country of birth is required"),
  citizenship_status: z.string().min(1, "Citizenship status is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  visa_expiry: z.string().min(1, "Visa expiry is required"),
  english_test_type: z.string().min(1, "English test type is required"),
  english_test_score: z.string().min(1, "English test score is required"),
  english_test_date: z.string().min(1, "English test date is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LanguageDefaultForm() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_language: "",
      english_proficiency: "",
      other_languages: [""],
      indigenous_status: "",
      country_of_birth: "",
      citizenship_status: "",
      visa_type: "",
      visa_expiry: "",
      english_test_type: "",
      english_test_score: "",
      english_test_date: "",
    },
  });

  const { handleSubmit, control } = methods;

  const { fields, append, remove } = useFieldArray<
    FormValues,
    "other_languages"
  >({
    control,
    name: "other_languages",
  });

  const onSubmit = (values: FormValues) => {
    // payload exactly matches your example shape
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
