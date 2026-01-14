import { z } from "zod";

export const usiSchema = z.object({
  usi: z
    .string()
    .min(1, "USI is required")
    .length(10, "USI must be exactly 10 characters"),

  consent_to_verify: z
    .boolean()
    .refine((v) => v === true, "You must give permission."),
});

export type USIValues = z.infer<typeof usiSchema>;

export const defaultUSIValues: USIValues = {
  usi: "",
  consent_to_verify: true,
};
