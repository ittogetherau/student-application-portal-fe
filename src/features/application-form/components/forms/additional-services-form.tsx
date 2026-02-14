/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { Button } from "@/components/ui/button";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";
import { useStepForm } from "@/features/application-form/hooks/use-step-form.hook";
import {
  additionalServicesSchema,
  createEmptyAdditionalService,
  defaultAdditionalServicesValues,
  type AdditionalServicesValues,
} from "@/features/application-form/validations/additional-services";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Plus } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useFieldArray, useWatch } from "react-hook-form";

const stepId = 10;

const AdditionalServicesForm = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const {
    methods,
    mutation: additionalServicesMutation,
    onSubmit,
  } = useStepForm<AdditionalServicesValues>({
    applicationId,
    stepId,
    resolver: zodResolver(additionalServicesSchema as any),
    defaultValues: defaultAdditionalServicesValues,
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
      append(createEmptyAdditionalService());
    }
  }, [requestServices, methods, fields.length, append]);

  const services =
    useWatch({
      control,
      name: "services",
    }) ?? [];

  const totalAdditionalFees = (services || [])
    .filter((s) => s?.selected)
    .reduce((sum, s) => sum + (Number(s?.student_price_per_service) || 0), 0);

  const canAddMore = (fields?.length || 0) < 10;

  return (
    <FormProvider {...methods}>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <section className="space-y-6">
          <div className="rounded-lg border p-4">
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
            <section className="space-y-6">
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
                        placeholder="Enter service name"
                      />

                      <FormInput
                        name={`services.${index}.category_name`}
                        label="Category Name"
                        placeholder="Enter category"
                      />

                      <FormInput
                        name={`services.${index}.facility_name`}
                        label="Facility Name"
                        placeholder="Enter facility"
                      />

                      <FormInput
                        name={`services.${index}.service_provider`}
                        label="Service Provider"
                        placeholder="Enter provider name"
                      />

                      <FormInput
                        name={`services.${index}.student_price_per_service`}
                        label="Student Price per Service"
                        type="number"
                        placeholder="Enter price"
                      />

                      <FormInput
                        name={`services.${index}.provider_price_per_service`}
                        label="Provider Price per Service"
                        type="number"
                        placeholder="Enter price"
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
                      placeholder="Enter any notes about the service"
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

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canAddMore}
                  onClick={() => append(createEmptyAdditionalService())}
                >
                  <Plus />
                  Add Service
                </Button>
              </div>
            </section>
          )}
        </section>

        <ApplicationStepHeader>
          <Button type="submit" disabled={additionalServicesMutation.isPending}>
            {additionalServicesMutation.isPending ? (
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

export default AdditionalServicesForm;
