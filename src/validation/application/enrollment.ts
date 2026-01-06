import { z } from "zod";

export const enrollmentSchema = z.object({
    course: z.number(),
    intake: z.number(),
    campus: z.number(),
});

export type EnrollmentValues = z.infer<typeof enrollmentSchema>;
