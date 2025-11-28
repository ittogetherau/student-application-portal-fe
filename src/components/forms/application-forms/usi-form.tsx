"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";

const usiSchema = z.object({
  usi: z.string().optional(),
  consent_to_verify: z.boolean().refine((v) => v === true, {
    message: "You must give permission.",
  }),
});

type USIValues = z.infer<typeof usiSchema>;

export default function USIForm() {
  const methods = useForm<USIValues>({
    resolver: zodResolver(usiSchema),
    defaultValues: {
      usi: "",
      consent_to_verify: false,
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = (values: USIValues) => {
    console.log(JSON.stringify(values, null, 2)); // EXACT desired output
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            If you already completed nationally recognised training (RSA, White
            Card, First Aid, TAFE, etc.) you may already have a USI. Please
            check before creating a new one:{" "}
            <a
              href="https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/
            </a>
          </p>
        </div>

        <FormInput name="usi" label="USI (optional)" placeholder="ABC1234567" />

        <FormCheckbox
          name="consent_to_verify"
          label="I authorize my provider to verify or create a USI on my behalf"
        />

        <div className="flex justify-end">
          <Button type="submit">Submit USI</Button>
        </div>
      </form>
    </FormProvider>
  );
}
