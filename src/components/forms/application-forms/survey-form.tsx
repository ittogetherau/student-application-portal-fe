"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";

const responseSchema = z.object({
  question_id: z.string().min(1, "Question ID is required"),
  question_text: z.string().min(1, "Question text is required"),
  answer: z.string().min(1, "Answer is required"),
  answer_type: z.string().min(1, "Answer type is required"),
});

const surveySchema = z.object({
  responses: z.array(responseSchema).min(1, "Add at least one response"),
  how_did_you_hear: z.string().min(1, "This field is required"),
  referral_source: z.string().min(1, "Referral source is required"),
});

type SurveyValues = z.infer<typeof surveySchema>;

const emptyResponse: SurveyValues["responses"][number] = {
  question_id: "",
  question_text: "",
  answer: "",
  answer_type: "",
};

export default function SurveyForm() {
  const methods = useForm<SurveyValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      responses: [emptyResponse],
      how_did_you_hear: "",
      referral_source: "",
    },
  });

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "responses",
  });

  const canAddMore = fields.length < 10;

  const onSubmit = (values: SurveyValues) => {
    console.log(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Survey Responses</h3>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Question {index + 1}</p>
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
                  name={`responses.${index}.question_id`}
                  label="Question ID"
                  placeholder="Q1"
                />

                <FormInput
                  name={`responses.${index}.answer_type`}
                  label="Answer Type"
                  placeholder="e.g. text, single_choice"
                />

                <FormInput
                  name={`responses.${index}.question_text`}
                  label="Question Text"
                  placeholder="How did you hear about us?"
                />

                <FormInput
                  name={`responses.${index}.answer`}
                  label="Answer"
                  placeholder="Your answer"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canAddMore}
              onClick={() => append(emptyResponse)}
            >
              Add Question
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="how_did_you_hear"
            label="How did you hear about us?"
            placeholder="Friend, social media, agent, etc."
          />

          <FormInput
            name="referral_source"
            label="Referral Source"
            placeholder="Name of agent / website / organisation"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Submit Survey</Button>
        </div>
      </form>
    </FormProvider>
  );
}
