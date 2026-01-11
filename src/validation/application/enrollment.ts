import { z } from "zod";

export const enrollmentSchema = z.object({
  course: z.number(),
  course_name: z.string(),
  intake: z.number(),
  intake_name: z.string(),
  campus: z.number(),
  campus_name: z.string(),
});

export type EnrollmentValues = z.infer<typeof enrollmentSchema>;
