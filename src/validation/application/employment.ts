import { z } from "zod";

export const employmentEntrySchema = z
  .object({
    employer: z.string().min(1, "Please enter your employer name"),
    role: z.string().min(1, "Please enter your role"),
    start_date: z.string().min(1, "Please select a start date"),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean(),
    responsibilities: z.string().min(1, "Please describe your responsibilities"),
    industry: z.string().min(1, "Please enter your industry"),
  })
  .superRefine((data, ctx) => {
    if (!data.is_current && (!data.end_date || data.end_date === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required if this is not your current role",
        path: ["end_date"],
      });
    }

    if (data.start_date && data.end_date && !data.is_current) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (endDate <= startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date",
          path: ["end_date"],
        });
      }
    }
  });

export const employmentSchema = z.object({
  employment_status: z
    .string()
    .min(1, "Please select your current employment status"),
  entries: z
    .array(employmentEntrySchema)
    .min(1, "Please add at least one employment entry"),
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
