import { z } from "zod";

export const disabilitySchema = z.object({
  has_disability: z.boolean(),
  disability_type: z.string(),
  disability_details: z.string(),
  support_required: z.string(),
  has_documentation: z.boolean(),
  documentation_status: z.string(),
  adjustments_needed: z.string(), // Just a string now
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
