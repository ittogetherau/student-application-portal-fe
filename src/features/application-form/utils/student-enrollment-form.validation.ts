import { z } from "zod";

const yesNoSchema = z.enum(["Yes", "No"]);
const yesNoNaSchema = z.enum(["Yes", "No", "N/A"]);
const classTypeSchema = z.enum(["classroom", "hybrid", "online"]);

export const studentEnrollmentFormSchema = z
  .object({
    preferred_start_date: z.string().min(1, "Preferred start date is required"),
    advanced_standing_credit: yesNoSchema,
    number_of_subjects: z
      .number()
      .int()
      .min(1, "Please select number of subjects")
      .max(12, "Please select number of subjects")
      .optional(),
    no_of_weeks: z.number().int().min(1, "Number of weeks is required"),
    course_end_date: z.string().min(1, "Course end date is required"),
    offer_issued_date: z.string().min(1, "Offer issued date is required"),
    study_reason: z.string().min(1, "Please select a study reason"),
    course_actual_fee: z.number().min(0, "Course actual fee is required"),
    course_upfront_fee: z.number().min(0, "Course upfront fee is required"),
    enrollment_fee: z.number().min(0, "Enrollment fee is required"),
    material_fee: z.number().min(0, "Material fee is required"),
    inclue_material_fee_in_initial_payment: yesNoSchema,
    receiving_scholarship: yesNoSchema,
    scholarship_percentage: z.number().min(0).max(100).optional(),
    work_integrated_learning: yesNoNaSchema,
    third_party_provider: yesNoNaSchema,
    class_type: classTypeSchema,
    application_request: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.advanced_standing_credit === "Yes" && !data.number_of_subjects) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select number of subjects",
        path: ["number_of_subjects"],
      });
    }

    if (
      data.receiving_scholarship === "Yes" &&
      data.scholarship_percentage == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scholarship percentage is required",
        path: ["scholarship_percentage"],
      });
    }
  });

export type StudentEnrollmentFormValues = z.infer<
  typeof studentEnrollmentFormSchema
>;
