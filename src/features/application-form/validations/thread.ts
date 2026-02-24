import { z } from "zod";
import {
  dateInputString,
  getTodayDateInputValue,
} from "@/shared/validation/date-input";

// Schema for creating communication threads (is_internal handled server-side)
export const threadCreateSchema = z.object({
  subject: z
    .string()
    .min(2, "Subject is required")
    .max(200, "Subject must be at most 200 characters"),
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
  deadline: dateInputString({
    min: getTodayDateInputValue,
    invalidFormatMessage: "Invalid deadline date",
    minMessage: "Deadline cannot be before today",
  }),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .max(200, "Message must be at most 200 characters"),
});

export type ThreadCreateValues = z.infer<typeof threadCreateSchema>;
