import { z } from "zod";

// Manual interface definitions to avoid z.coerce inference issues in Zod v4
export interface AdditionalServiceEntry {
  service_name: string;
  category_name: string;
  facility_name: string;
  service_provider: string;
  student_price_per_service: number;
  provider_price_per_service: number;
  service_start_date: string;
  service_end_date: string;
  service_comment?: string;
  selected: boolean;
}

export interface AdditionalServicesValues {
  request_additional_services: "Yes" | "No";
  services: AdditionalServiceEntry[];
}

export const serviceSchema = z.object({
  service_name: z.string().min(1, "Service name is required"),
  category_name: z.string().min(1, "Category is required"),
  facility_name: z.string().min(1, "Facility is required"),
  service_provider: z.string().min(1, "Provider is required"),
  student_price_per_service: z.coerce.number().min(0, "Price must be positive"),
  provider_price_per_service: z.coerce.number().min(0, "Price must be positive"),
  service_start_date: z.string().min(1, "Start date is required"),
  service_end_date: z.string().min(1, "End date is required"),
  service_comment: z.string().optional(),
  selected: z.boolean(),
});

export const additionalServicesBaseSchema = z.object({
  request_additional_services: z.enum(["Yes", "No"]),
  services: z.array(serviceSchema),
});

export const additionalServicesSchema = additionalServicesBaseSchema.superRefine(
  (val, ctx) => {
    if (val.request_additional_services === "Yes") {
      if (!val.services || val.services.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services"],
          message: "Please add at least one service",
        });
      }
    }
  }
);

export const createEmptyAdditionalService =
  (): AdditionalServiceEntry => ({
    service_name: "",
    category_name: "",
    facility_name: "",
    service_provider: "",
    student_price_per_service: 0,
    provider_price_per_service: 0,
    service_start_date: "",
    service_end_date: "",
    service_comment: "",
    selected: true,
  });

export const defaultAdditionalServicesValues: AdditionalServicesValues = {
  request_additional_services: "No",
  services: [],
};
