import { z } from "zod";

// Schema for creating communication threads (is_internal handled server-side)
export const threadCreateSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  issue_type: z.string().min(1, "Issue type is required"),
  target_section: z.string().min(1, "Target section is required"),
  priority: z.enum(["low", "medium", "high"], {
    message: "Priority is required",
  }),
  deadline: z.string(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export type ThreadCreateValues = z.infer<typeof threadCreateSchema>;
