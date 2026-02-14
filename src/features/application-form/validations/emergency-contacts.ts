import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .nullish()
    .refine((val) => !!val && val.length > 0, "Please enter a contact name"),
  relationship: z
    .string()
    .nullish()
    .refine((val) => !!val && val.length > 0, "Please describe the relationship"),
  phone: z
    .string()
    .max(15, "Phone number must be at most 15 characters")
    .nullish()
    .refine((val) => !!val && val.length > 0, "Phone number is required"),
  email: z
    .string()
    .nullish()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Enter a valid email address"
    ),
  address: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Address is required"),
  is_primary: z.boolean().nullable(),
});

export const emergencyContactsSchema = z
  .object({
    contacts: z
      .array(contactSchema)
      .min(1, "Add at least one emergency contact")
      .max(3, "You can add up to 3 contacts"),
  })
  .superRefine(({ contacts }, ctx) => {
    const primaryCount = contacts.filter((c) => c.is_primary).length;

    if (primaryCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please mark one contact as primary",
        path: ["contacts", 0, "is_primary"],
      });
    } else if (primaryCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only one contact can be primary",
        path: ["contacts"],
      });
    }
  });

export type EmergencyContactsValues = z.infer<typeof emergencyContactsSchema>;

export const createEmptyContact =
  (): EmergencyContactsValues["contacts"][number] => ({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
    is_primary: false,
  });
