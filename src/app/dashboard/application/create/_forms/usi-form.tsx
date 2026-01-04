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

const stepId = 9;

const UsiForm = ({ applicationId }: { applicationId: string }) => {
  const usiMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<USIValues>({
    resolver: zodResolver(usiSchema),
    defaultValues: defaultUSIValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  console.log(methods.getValues())

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
