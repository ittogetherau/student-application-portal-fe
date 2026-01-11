import { z } from "zod";

export const personalDetailsSchema = z.object({
  // Basic Information
  student_origin: z.string().min(1, "Please select student origin"),
  title: z.string().min(1, "Please select a title"),
  given_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().or(z.literal("")),
  family_name: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Please select a gender"),
  date_of_birth: z.string().min(1, "Date of birth is required"),

  // Contact Details
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  alternate_email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  home_phone: z.string().optional().or(z.literal("")),

  // Passport Details
  country_of_birth: z.string().min(1, "Country of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  passport_number: z.string().min(1, "Passport number is required"),
  passport_expiry: z.string().min(1, "Passport expiry is required"),

  // Visa Details
  visa_type: z.string().optional().or(z.literal("")),
  visa_number: z.string().optional().or(z.literal("")),
  visa_expiry: z.string().optional().or(z.literal("")).nullable(),

  // Residential Address
  search_address: z.string().optional().or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  building_name: z.string().optional().or(z.literal("")),
  flat_unit: z.string().optional().or(z.literal("")),
  street_number: z.string().min(1, "Street number is required"),
  street_name: z.string().min(1, "Street name is required"),
  suburb: z.string().min(1, "City/Town/Suburb is required"),
  state: z.string().min(1, "State/Province is required"),
  postcode: z.string().min(1, "Post code is required"),

  // Postal Address
  postal_same_as_residential: z.string().min(1, "Please select an option"),
  postal_country: z.string().optional().or(z.literal("")),
  postal_building_name: z.string().optional().or(z.literal("")),
  postal_flat_unit: z.string().optional().or(z.literal("")),
  postal_street_number: z.string().optional().or(z.literal("")),
  postal_street_name: z.string().optional().or(z.literal("")),
  postal_suburb: z.string().optional().or(z.literal("")),
  postal_state: z.string().optional().or(z.literal("")),
  postal_postcode: z.string().optional().or(z.literal("")),

  // Overseas/Permanent Address
  overseas_country: z.string().optional().or(z.literal("")),
  overseas_address: z.string().optional().or(z.literal("")),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const defaultPersonalDetailsValues: PersonalDetailsValues = {
  // Basic Information
  student_origin: "",
  title: "",
  given_name: "",
  middle_name: "",
  family_name: "",
  gender: "",
  date_of_birth: "",

  // Contact Details
  email: "",
  alternate_email: "",
  phone: "",
  home_phone: "",

  // Passport Details
  country_of_birth: "",
  nationality: "",
  passport_number: "",
  passport_expiry: "",

  // Visa Details
  visa_type: "",
  visa_number: "",
  visa_expiry: null,

  // Residential Address
  search_address: "",
  country: "",
  building_name: "",
  flat_unit: "",
  street_number: "",
  street_name: "",
  suburb: "",
  state: "",
  postcode: "",

  // Postal Address
  postal_same_as_residential: "",
  postal_country: "",
  postal_building_name: "",
  postal_flat_unit: "",
  postal_street_number: "",
  postal_street_name: "",
  postal_suburb: "",
  postal_state: "",
  postal_postcode: "",

  // Overseas/Permanent Address
  overseas_country: "",
  overseas_address: "",
};
