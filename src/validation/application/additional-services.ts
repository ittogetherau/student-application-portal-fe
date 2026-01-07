import { z } from "zod";

export const serviceSchema = z.object({
  service_name: z.string().optional(),
  category_name: z.string().optional(),
  facility_name: z.string().optional(),
  service_provider: z.string().optional(),
  student_price_per_service: z.number().optional(),
  provider_price_per_service: z.number().optional(),
  service_start_date: z.string().optional(),
  service_end_date: z.string().optional(),
  service_comment: z.string().optional(),
  selected: z.boolean().optional(),
});

export const additionalServicesSchema = z
  .object({
    request_additional_services: z.enum(["Yes", "No"]),
    services: z.array(serviceSchema).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.request_additional_services === "Yes") {
      // If Yes is selected, we might want to ensure at least one service is in the list
      // OR we just ensure the list exists.
      // The previous validation had min(1).
      if (!val.services || val.services.length === 0) {
        // It's possible to hav an empty list if they haven't added any.
        // We can leave it flexible or enforce adding one.
        // Based on "validate it nicely", enforcing at least one seems appropriate if they said YES.
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services"],
          message: "Please add at least one service",
        });
      }
    }
  });

export type AdditionalServicesValues = z.infer<typeof additionalServicesSchema>;

export const createEmptyAdditionalService = (): unknown => ({
  service_name: "",
  category_name: "",
  facility_name: "",
  service_provider: "",
  student_price_per_service: 0,
  provider_price_per_service: 0,
  service_start_date: "",
  service_end_date: "",
  service_comment: "",
  selected: false,
});

export const defaultAdditionalServicesValues: AdditionalServicesValues = {
  request_additional_services: "No",
  services: [],
};
