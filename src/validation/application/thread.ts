import { z } from "zod";

// Schema for creating communication threads (is_internal handled server-side)
export const threadCreateSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  issue_type: z
    .string()
    .trim()
    .min(1, "Issue type is required")
    .optional()
    .or(z.literal("")),
  target_section: z
    .string()
    .trim()
    .min(1, "Target section is required")
    .optional()
    .or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]).optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export type ThreadCreateValues = z.infer<typeof threadCreateSchema>;
