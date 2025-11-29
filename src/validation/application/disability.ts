import { z } from "zod";

export const disabilitySchema = z
  .object({
    has_disability: z.boolean(),
    disability_type: z.string().optional(),
    disability_details: z.string().optional(),
    support_required: z.string().optional(),
    has_documentation: z.boolean(),
    documentation_status: z.string().optional(),
    adjustments_needed: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.has_disability) {
      if (!val.disability_type?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["disability_type"],
          message: "Disability type is required",
        });
      }
      if (!val.disability_details?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["disability_details"],
          message: "Disability details are required",
        });
      }
      if (!val.support_required?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["support_required"],
          message: "Support required is required",
        });
      }
    }

    if (val.has_documentation) {
      if (!val.documentation_status?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["documentation_status"],
          message: "Documentation status is required",
        });
      }
      if (!val.adjustments_needed?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["adjustments_needed"],
          message: "Please provide any adjustments needed",
        });
      }
    }
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
