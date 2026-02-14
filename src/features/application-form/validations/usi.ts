import { z } from "zod";

export const usiSchema = z.object({
  usi: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "USI must be exactly 10 characters",
    }),

  consent_to_verify: z
    .boolean()
    .refine((v) => v === true, "You must give permission."),
});

export type USIValues = z.infer<typeof usiSchema>;

export const defaultUSIValues: USIValues = {
  usi: "",
  consent_to_verify: true,
};
