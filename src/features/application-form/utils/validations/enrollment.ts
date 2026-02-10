import { z } from "zod";

const yesNoSchema = z.enum(["Yes", "No"]);
const yesNoNaSchema = z.enum(["Yes", "No", "N/A"]);

const requiredSelectId = (message: string) =>
  z
    .number()
    .int()
    .min(1, message)
    .optional()
    .refine((value) => value !== undefined, message);

const requiredNonNegativeNumber = (message: string) =>
  z
    .number()
    .min(0, "Must be 0 or more")
    .optional()
    .refine((value) => value !== undefined, message);

export const enrollmentFormSchema = z
  .object({
    course: requiredSelectId("Please select a course"),
    intake: requiredSelectId("Please select an intake"),
    campus: requiredSelectId("Please select a campus"),

    advanced_standing_credit: yesNoSchema,
    credit_subject_count: z
      .number()
      .int()
      .min(1, "Please select number of subjects")
      .max(12, "Please select number of subjects")
      .optional(),

    offer_issued_date: z.string().min(1, "Offer issued date is required"),

    study_reason: z.enum(
      ["01", "02", "03", "04", "05", "06", "07", "08", "11", "12", "@@"],
      { message: "Please select a study reason" },
    ),

    course_actual_fee: requiredNonNegativeNumber(
      "Course actual fee is required",
    ),
    course_upfront_fee: requiredNonNegativeNumber(
      "Course upfront fee is required",
    ),
    enrollment_fee: requiredNonNegativeNumber("Enrollment fee is required"),
    material_fee: requiredNonNegativeNumber("Material fee is required"),

    include_material_fee_in_initial_payment: yesNoSchema,
    receiving_scholarship_bursary: yesNoSchema,
    wil_requirements: yesNoNaSchema,
    third_party_providers_application_request: yesNoNaSchema,

    application_request: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.advanced_standing_credit === "Yes") {
      if (!data.credit_subject_count) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select number of subjects",
          path: ["credit_subject_count"],
        });
      }
    }
  });

export type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

export const enrollmentSchema = z.object({
  course: z.number(),
  course_name: z.string(),
  intake: z.number(),
  intake_name: z.string(),
  campus: z.number(),
  campus_name: z.string(),

  advanced_standing_credit: yesNoSchema,
  credit_subject_count: z.number().int().min(1).max(12).optional(),
  offer_issued_date: z.string().min(1),
  study_reason: z.string().min(1),
  course_actual_fee: z.number().min(0),
  course_upfront_fee: z.number().min(0),
  enrollment_fee: z.number().min(0),
  material_fee: z.number().min(0),
  include_material_fee_in_initial_payment: yesNoSchema,
  receiving_scholarship_bursary: yesNoSchema,
  wil_requirements: yesNoNaSchema,
  third_party_providers_application_request: yesNoNaSchema,
  application_request: z.string().optional(),
});

export type EnrollmentValues = z.infer<typeof enrollmentSchema>;

export const defaultEnrollmentFormValues: Omit<
  EnrollmentFormValues,
  "offer_issued_date"
> = {
  course: undefined,
  intake: undefined,
  campus: undefined,
  advanced_standing_credit: "No",
  credit_subject_count: undefined,
  study_reason: "@@",
  course_actual_fee: undefined,
  course_upfront_fee: undefined,
  enrollment_fee: undefined,
  material_fee: undefined,
  include_material_fee_in_initial_payment: "No",
  receiving_scholarship_bursary: "No",
  wil_requirements: "N/A",
  third_party_providers_application_request: "N/A",
  application_request: "",
};
