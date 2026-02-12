import { z } from "zod";

const yesNoApiSchema = z.enum(["yes", "no"]);
const yesNoNaApiSchema = z.enum(["yes", "no", "na"]);
const classTypeSchema = z.enum(["classroom", "hybrid", "online"]);
const requiredYmdDateSchema = (requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format");

const agentEnrollmentSchema = z
  .object({
    course: z.number().int().min(1),
    course_name: z.string().min(1),
    intake: z.number().int().min(1),
    intake_name: z.string().min(1),
    campus: z.number().int().min(1),
    campus_name: z.string().min(1),

    advanced_standing_credit: yesNoApiSchema,
    number_of_subjects: z.number().int().min(1).max(12).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.advanced_standing_credit === "yes" && !data.number_of_subjects) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "number_of_subjects is required when advanced_standing_credit is yes",
        path: ["number_of_subjects"],
      });
    }
  });

const staffEnrollmentSchema = z.object({
  course: z.number(),
  course_name: z.string(),
  intake: z.number(),
  intake_name: z.string(),
  campus: z.number(),
  campus_name: z.string(),

  advanced_standing_credit: yesNoApiSchema,
  preferred_start_date: requiredYmdDateSchema("preferred_start_date is required"),
  number_of_subjects: z.number().int().min(1).max(12).optional(),
  no_of_weeks: z.number().int().min(1),
  course_end_date: requiredYmdDateSchema("course_end_date is required"),
  offer_issued_date: requiredYmdDateSchema("offer_issued_date is required"),
  study_reason: z.string().min(1),
  course_actual_fee: z.number().min(0),
  course_upfront_fee: z.number().min(0),
  enrollment_fee: z.number().min(0),
  material_fee: z.number().min(0),
  inclue_material_fee_in_initial_payment: yesNoApiSchema,
  receiving_scholarship: yesNoApiSchema,
  scholarship_percentage: z.number().min(0).max(100).optional(),
  work_integrated_learning: yesNoNaApiSchema,
  third_party_provider: yesNoNaApiSchema,
  class_type: classTypeSchema,
  application_request: z.string().optional(),
});

export const enrollmentSchema = z.union([
  staffEnrollmentSchema.strict(),
  agentEnrollmentSchema,
]);

export type EnrollmentValues = z.infer<typeof enrollmentSchema>;
