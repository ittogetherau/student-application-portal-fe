import { z } from "zod";

export const disabilitySchema = z.object({
  has_disability: z.boolean(),
  disability_type: z.string().min(1, "Disability type is required"),
  disability_details: z.string().min(1, "Disability details are required"),
  support_required: z.string().min(1, "Support required is required"),
  has_documentation: z.boolean(),
  documentation_status: z.string().min(1, "Documentation status is required"),
  adjustments_needed: z
    .string()
    .min(1, "Please provide any adjustments needed"),
});

export type DisabilityValues = z.infer<typeof disabilitySchema>;

export const defaultDisabilityValues: DisabilityValues = {
  has_disability: false,
  disability_type: "",
  disability_details: "",
  support_required: "",
  has_documentation: false,
  documentation_status: "",
  adjustments_needed: "",
};
