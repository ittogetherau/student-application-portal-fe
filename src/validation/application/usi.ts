import { z } from "zod";

export const usiSchema = z.object({
  usi: z.string().optional(),
  consent_to_verify: z.boolean().refine((v) => v === true, {
    message: "You must give permission.",
  }),
});

export type USIValues = z.infer<typeof usiSchema>;

export const defaultUSIValues: USIValues = {
  usi: "",
  consent_to_verify: false,
};
