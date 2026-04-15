import { z } from "zod";

export const subAgentCreateSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
      message: "Password must include at least one letter and one number.",
    }),
  organization_name: z
    .string()
    .trim()
    .min(1, "Organization name is required.")
    .max(120, "Organization name is too long."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .max(30, "Phone number is too long."),
  address: z
    .string()
    .trim()
    .min(1, "Address is required.")
    .max(200, "Address is too long."),
});

export type SubAgentCreateValues = z.infer<typeof subAgentCreateSchema>;
