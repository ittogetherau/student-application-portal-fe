import { z } from "zod";

export const qualificationSchema = z.object({
  qualification_name: z.string().min(1, "Qualification name is required"),
  institution: z.string().min(1, "Institution name is required"),
  completion_date: z.string().min(1, "Completion date is required"),
  certificate_number: z.string().min(1, "Certificate number is required"),
  field_of_study: z.string().min(1, "Field of study is required"),
  grade: z.string().min(1, "Grade/score is required"),
});

export const qualificationsSchema = z.object({
  has_qualifications: z.enum(["Yes", "No"]),
  qualifications: z.array(qualificationSchema).optional(),
}).superRefine((val, ctx) => {
  if (val.has_qualifications === "Yes") {
    if (!val.qualifications || val.qualifications.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["qualifications"],
        message: "Add at least one qualification",
      });
    }
    // Also validate individual entries if needed, but existing refined items handle their own validation
    // However, if the array exists, Zod will validate standard object schema inside. 
    // The issue is if the user adds an empty one. The existing schema validator handles empty string checks.
  }
});

export type QualificationsFormValues = z.infer<typeof qualificationsSchema>;

export const createEmptyQualification =
  (): unknown => ({ // flexible return type to match structure
    qualification_name: "",
    institution: "",
    completion_date: "",
    certificate_number: "",
    field_of_study: "",
    grade: "",
  });

export const defaultQualificationsValues: QualificationsFormValues = {
  has_qualifications: "No",
  qualifications: [],
};
