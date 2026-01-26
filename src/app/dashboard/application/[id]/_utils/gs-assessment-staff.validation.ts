import { z } from "zod";

const yesNoEnum = z.enum(["yes", "no"]);
const approvalStatusEnum = z.enum(["approved", "not-approved", "not-applicable"]);
const riskLevelEnum = z.enum(["low", "medium", "high"]);

const optionalEmail = z
  .string()
  .optional()
  .refine(
    (value) => {
      const trimmed = value?.trim() ?? "";
      if (trimmed === "") return true;
      return z.string().email().safeParse(trimmed).success;
    },
    { message: "Email must be a valid email address" },
  );

export const gsAssessmentStaffSchema = z.object({
  applicantDetails: z
    .object({
      givenName: z.string().optional(),
      familyName: z.string().optional(),
      dob: z.string().optional(),
      refNo: z.string().optional(),
      passportNo: z.string().optional(),
      email: optionalEmail,
    })
    .optional(),

  stage1: z
    .array(
      z.object({
        answer: yesNoEnum.optional(),
        evidenceVerified: z.boolean().optional(),
      }),
    )
    .optional(),

  stage2: z
    .array(
      z.object({
        answer: yesNoEnum.optional(),
        evidenceVerified: z.boolean().optional(),
        approvalStatus: approvalStatusEnum.optional(),
      }),
    )
    .optional(),

  gsStatus: z.enum(["approved", "not_approved", "conditional_approval"]).optional(),
  notes: z.string().optional(),
  conditions: z.string().optional(),
  riskLevel: riskLevelEnum.optional(),
});

export type GSAssessmentStaffFormValues = z.infer<typeof gsAssessmentStaffSchema>;

