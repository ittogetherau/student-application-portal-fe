import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(1, "Address is required"),
  is_primary: z.boolean(),
});

export const emergencyContactsSchema = z.object({
  contacts: z
    .array(contactSchema)
    .min(1, "Add at least one emergency contact")
    .max(3, "You can add up to 3 contacts"),
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
