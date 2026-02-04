"use client";

import { FormRadio } from "@/components/forms/form-radio";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";
import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import {
  defaultSchoolingValues,
  schoolingSchema,
  type SchoolingValues,
} from "@/features/application-form/utils/validations/schooling";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Info } from "lucide-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useApplicationStepMutations } from "../../hooks/use-application-steps.hook";

const stepId = 6;

const SchoolingForm = ({ applicationId }: { applicationId: string }) => {
  const schoolingMutation = useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<SchoolingValues>({
    resolver: zodResolver(schoolingSchema as any),
    defaultValues: defaultSchoolingValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Enable automatic form persistence
  const { saveOnSubmit } = useFormPersistence({
    applicationId,
    stepId,
    form: methods,
    enabled: !!applicationId,
  });

  const stillAttending = useWatch({
    control: methods.control,
    name: "still_attending",
  });

  const highestSchoolLevel = useWatch({
    control: methods.control,
    name: "highest_school_level",
  });

  const didNotGoToSchool = highestSchoolLevel === "02 - Did not go to School";

  const onSubmit = (values: SchoolingValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    schoolingMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
        <section className="space-y-6 border p-4 rounded-lg">
          <div className="space-y-8">
            {/* Highest Completed School Level */}
            <div className="flex items-center gap-1">
              <p className="text-sm">
                What is your highest COMPLETED school level?
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  If you are currently enrolled in secondary education, the
                  Highest school level completed refers to the highest school
                  level you have actually completed and not the level you are
                  currently undertaking. For example, if you are currently in
                  Year 10 the Highest school level completed is Year 9
                </TooltipContent>
              </Tooltip>
            </div>

            {/* <p className="text-xs text-muted-foreground mb-5 leading-relaxed"></p> */}
            <FormRadio
              name="highest_school_level"
              label=""
              options={[
                "02 - Did not go to School",
                "08 - Year 8 or below",
                "09 - Year 9 or below",
                "10 - Completed year 10",
                "11 - Completed year 11",
                "12 - Completed year 12",
                "@@ - Not Specified",
              ]}
            />

            {/* Currently Attending - Hidden if user didn't go to school */}
            {!didNotGoToSchool && (
              <div>
                <p className="text-sm mb-3">
                  Are you still attending secondary school?
                </p>
                <FormRadio
                  name="still_attending"
                  label=""
                  options={["Yes", "No"]}
                />
              </div>
            )}

            {/* Secondary School Type - Conditional */}
            {stillAttending === "Yes" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm mb-3">
                  If Yes, What is your secondary school?
                </p>
                <div className="pl-1">
                  <FormRadio
                    name="secondary_school_type"
                    label=""
                    options={[
                      "School (Government)",
                      "School (Catholic)",
                      "School (Independent)",
                      "Technical and Further Education institute",
                      "Community based adult education provider",
                      "Privately Operated registered training organisation",
                      "Home school arrangement",
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <ApplicationStepHeader>
          <Button type="submit" disabled={schoolingMutation.isPending}>
            {schoolingMutation.isPending ? (
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
export default SchoolingForm;
