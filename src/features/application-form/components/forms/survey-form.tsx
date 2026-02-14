"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useStepForm } from "@/features/application-form/hooks/use-step-form.hook";
import {
  surveySchema,
  type SurveyValues,
} from "@/features/application-form/validations/survey";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { Controller, FormProvider } from "react-hook-form";
import { useSurveyAvailabilityCodes } from "../../hooks/use-application-steps.hook";
import ApplicationStepHeader from "../application-step-header";

const stepId = 11;

const SurveyForm = ({ applicationId }: { applicationId: string }) => {
  const {
    methods,
    mutation: surveyMutation,
    onSubmit,
  } = useStepForm<SurveyValues>({
    applicationId,
    stepId,
    resolver: zodResolver(surveySchema),
    defaultValues: {
      availability_status: "",
    },
    enabled: !!applicationId,
  });

  const { data: availabilityCodesData, isLoading: isLoadingCodes } =
    useSurveyAvailabilityCodes();

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 border p-4 rounded-lg">
          {isLoadingCodes ? (
            <p className="text-sm text-muted-foreground">
              Loading availability codes...
            </p>
          ) : availabilityCodesData?.data ? (
            <Controller
              name="availability_status"
              control={methods.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {(availabilityCodesData.data || []).map((code) => (
                      <Label
                        key={code.code}
                        className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg "
                      >
                        <RadioGroupItem value={code.code} />
                        <div className="flex flex-col">
                          <span className="font-medium">{code.label}</span>
                          <span className="text-xs text-muted-foreground">
                            Code: {code.code}
                          </span>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          ) : (
            <p className="text-sm text-destructive">
              Failed to load availability codes
            </p>
          )}
        </div>

        <ApplicationStepHeader className="mt-4">
          <Button type="submit" disabled={surveyMutation.isPending}>
            {surveyMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                Save & Continue
                <ChevronRight />
              </>
            )}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default SurveyForm;
