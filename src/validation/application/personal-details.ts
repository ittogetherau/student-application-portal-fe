import { z } from "zod";

export const personalDetailsSchema = z.object({
  country: z.string().min(1),
  country_of_birth: z.string().min(1),
  date_of_birth: z.string().min(1),
  email: z.string().email(),
  family_name: z.string().min(1),
  gender: z.string().min(1),
  given_name: z.string().min(1),
  middle_name: z.string().optional(),
  nationality: z.string().min(1),
  passport_expiry: z.string().min(1),
  passport_number: z.string().min(1),
  phone: z.string().min(1),
  postcode: z.string().min(1),
  state: z.string().min(1),
  street_address: z.string().min(1),
  suburb: z.string().min(1),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const defaultPersonalDetailsValues: PersonalDetailsValues = {
  country: "",
  country_of_birth: "",
  date_of_birth: "",
  email: "",
  family_name: "",
  gender: "",
  given_name: "",
  middle_name: "",
  nationality: "",
  passport_expiry: "",
  passport_number: "",
  phone: "",
  postcode: "",
  state: "",
  street_address: "",
  suburb: "",
};
