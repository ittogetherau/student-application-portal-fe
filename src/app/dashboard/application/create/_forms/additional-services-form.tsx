/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Button } from "@/components/ui/button";
import { FormCheckbox } from "@/components/ui/forms/form-checkbox";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormRadio } from "@/components/ui/forms/form-radio";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import {
  additionalServicesSchema,
  createEmptyAdditionalService,
  defaultAdditionalServicesValues,
  type AdditionalServicesValues,
} from "@/validation/application/additional-services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";

const stepId = 10;

const AdditionalServicesForm = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const additionalServicesMutation =
    useApplicationStepMutations(applicationId)[stepId];

  const methods = useForm<AdditionalServicesValues>({
    resolver: zodResolver(additionalServicesSchema),
    defaultValues: defaultAdditionalServicesValues,
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

  const { control, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const requestServices = useWatch({
    control,
    name: "request_additional_services",
  });

  // Reset/Init services based on selection
  useEffect(() => {
    if (requestServices === "No") {
      methods.setValue("services", []);
    } else if (requestServices === "Yes" && fields.length === 0) {
      append(createEmptyAdditionalService() as any);
    }
  }, [requestServices, methods, fields.length, append]);

  const services =
    useWatch({
      control,
      name: "services",
    }) ?? [];

  const totalAdditionalFees = (services || [])
    .filter((s) => s?.selected)
    .reduce((sum, s) => sum + (s?.student_price_per_service || 0), 0);

  const canAddMore = (fields?.length || 0) < 10;

  const onSubmit = (values: AdditionalServicesValues) => {
    if (applicationId) {
      saveOnSubmit(values);
    }
    additionalServicesMutation.mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <section className="space-y-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm mb-3">
                Do you want to request for additional services ?
              </p>
              <FormRadio
                name="request_additional_services"
                label=""
                options={["Yes", "No"]}
              />
            </div>

            {requestServices === "Yes" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg">Additional Services List</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canAddMore}
                    onClick={() =>
                      append(createEmptyAdditionalService() as any)
                    }
                  >
                    Add Service
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Service {index + 1}</p>
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
                          name={`services.${index}.service_name`}
                          label="Service Name"
                          placeholder="e.g. Airport Pickup"
                        />

                        <FormInput
                          name={`services.${index}.category_name`}
                          label="Category Name"
                          placeholder="e.g. Transportation"
                        />

                        <FormInput
                          name={`services.${index}.facility_name`}
                          label="Facility Name"
                          placeholder="e.g. Main Campus"
                        />

                        <FormInput
                          name={`services.${index}.service_provider`}
                          label="Service Provider"
                          placeholder="e.g. ABC Transport Services"
                        />

                        <FormInput
                          name={`services.${index}.student_price_per_service`}
                          label="Student Price per Service"
                          type="number"
                          placeholder="0"
                        />

                        <FormInput
                          name={`services.${index}.provider_price_per_service`}
                          label="Provider Price per Service"
                          type="number"
                          placeholder="0"
                        />

                        <FormInput
                          name={`services.${index}.service_start_date`}
                          label="Service Start Date"
                          type="date"
                        />

                        <FormInput
                          name={`services.${index}.service_end_date`}
                          label="Service End Date"
                          type="date"
                        />
                      </div>

                      <FormInput
                        name={`services.${index}.service_comment`}
                        label="Service Comment"
                        placeholder="Additional comments or notes about the service"
                      />

                      <FormCheckbox
                        name={`services.${index}.selected`}
                        label="Select this service"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border rounded-lg px-4 py-3 bg-muted/20">
                  <span className="text-sm">
                    Total additional fees (selected services)
                  </span>
                  <span className="font-semibold">
                    ${totalAdditionalFees.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        <ApplicationStepHeader className="mt-8 pt-6 border-t">
          <Button type="submit" disabled={additionalServicesMutation.isPending}>
            {additionalServicesMutation.isPending
              ? "Saving..."
              : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
};

export default AdditionalServicesForm;