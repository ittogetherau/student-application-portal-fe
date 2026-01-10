import { z } from "zod";

export const employmentEntrySchema = z.object({
  employer: z.string().min(1, "Employer is required"),
  role: z.string().min(1, "Role is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean(),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  industry: z.string().min(1, "Industry is required"),
}).superRefine((data, ctx) => {
  if (!data.is_current && (!data.end_date || data.end_date === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date is required if not currently working",
      path: ["end_date"],
    });
  }
});

export const employmentSchema = z.object({
  employment_status: z.string().min(1, "Employment status is required"),
  entries: z.array(employmentEntrySchema).min(1, "At least one employment entry is required"),
});

export type EmploymentFormValues = z.infer<typeof employmentSchema>;

export const createEmptyEmploymentEntry =
  (): z.infer<typeof employmentEntrySchema> => ({
    employer: "",
    role: "",
    start_date: "",
    end_date: "",
    is_current: false,
    responsibilities: "",
    industry: "",
  });

export const defaultEmploymentValues: EmploymentFormValues = {
  employment_status: "",
  entries: [createEmptyEmploymentEntry()],
};
