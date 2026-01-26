"use client";

import { Button } from "@/components/ui/button";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";
import { FormInput } from "@/components/ui/forms/form-input";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import {
  defaultUSIValues,
  usiSchema,
  type USIValues,
} from "@/validation/application/usi";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import ApplicationStepHeader from "../_components/application-step-header";
import Link from "next/link";

const stepId = 9;

const UsiForm = ({ applicationId }: { applicationId: string }) => {
  const usiMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<USIValues>({
    resolver: zodResolver(usiSchema),
    defaultValues: defaultUSIValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  console.log(methods.getValues());

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const { handleSubmit } = methods;

  const onSubmit = (values: USIValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    usiMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="border rounded-lg p-4 space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              You may already have a USI if you have done any nationally
              recognised training, which could include training at work,
              completing a first aid course or RSA (Responsible Service of
              Alcohol) course, getting a white card, or studying at a TAFE or
              training organisation. It is important that you try to find out
              whether you already have a USI before attempting to create a new
              one. You should not have more than one USI. To check if you
              already have a USI, use the ‘Forgotten USI’ link on the USI
              website at{" "}
              <Link
                href="https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/"
                target="_blank"
                className="text-primary underline"
              >
                https://www.usi.gov.au/faqs/i-have-forgotten-my-usi/
              </Link>
            </p>
          </div>

          <FormInput
            name="usi"
            label="USI (Optional)"
            placeholder="Enter USI"
          />

          <FormCheckbox
            name="consent_to_verify"
            label="I have read and I consent to the collection, use and disclosure of my personal information (which may include sensitive information) pursuant to the information detailed at below link"
          />

          <Link
            target="_blank"
            className="text-primary underline"
            href="https://www.usi.gov.au/about-us/privacy/provider-privacy-obligations"
          >
            https://www.usi.gov.au/about-us/privacy/provider-privacy-obligations
          </Link>
        </section>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={usiMutation.isPending}>
            {usiMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default UsiForm;
