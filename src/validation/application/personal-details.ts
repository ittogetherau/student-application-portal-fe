import { z } from "zod";

export const personalDetailsSchema = z.object({
  // Basic Information
  student_origin: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Please select student origin"),
  title: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Please select a title"),
  given_name: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "First name is required"),
  middle_name: z.string().nullish(),
  family_name: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Last name is required"),
  gender: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Please select a gender"),
  date_of_birth: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Date of birth is required"),

  // Contact Details
  email: z
    .string()
    .nullish()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Enter a valid email address"
    )
    .refine((val) => !!val && val.trim().length > 0, "Email is required"),

  phone: z
    .string()
    .max(15, "Phone number must be at most 15 characters")
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Phone number is required"),
  home_phone: z
    .string()
    .max(15, "Home phone must be at most 15 characters")
    .nullish(),

  // Passport Details
  country_of_birth: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Country of birth is required"),
  nationality: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Nationality is required"),
  passport_number: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Passport number is required"),
  passport_expiry: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Passport expiry is required"),

  // Visa Details (only required for Onshore students)
  visa_type: z.string().nullish(),
  visa_number: z.string().nullish(),
  visa_expiry: z.string().nullish(),

  // Residential Address
  search_address: z.string().nullish(),
  country: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Country is required"),
  building_name: z.string().nullish(),
  flat_unit: z.string().nullish(),
  street_number: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Street number is required"),
  street_name: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Street name is required"),
  suburb: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "City/Town/Suburb is required"),
  state: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "State/Province is required"),
  postcode: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Post code is required"),

  // Postal Address
  postal_same_as_residential: z
    .string()
    .nullish()
    .refine((val) => !!val && val.trim().length > 0, "Please select an option"),
  postal_country: z.string().nullish(),
  postal_building_name: z.string().nullish(),
  postal_flat_unit: z.string().nullish(),
  postal_street_number: z.string().nullish(),
  postal_street_name: z.string().nullish(),
  postal_suburb: z.string().nullish(),
  postal_state: z.string().nullish(),
  postal_postcode: z.string().nullish(),

  // Overseas/Permanent Address
  overseas_country: z
    .string()
    .nullish()
    .refine(
      (val) => !!val && val.trim().length > 0,
      "Overseas country is required"
    ),
  overseas_address: z
    .string()
    .nullish()
    .refine(
      (val) => !!val && val.trim().length > 0,
      "Overseas address is required"
    ),

}).superRefine((data, ctx) => {
  // Visa details are only required if student_origin is "Overseas Student in Australia (Onshore)"
  if (data.student_origin === "Overseas Student in Australia (Onshore)") {
    if (!data.visa_type || data.visa_type.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Visa type is required",
        path: ["visa_type"],
      });
    }
    if (!data.visa_number || data.visa_number.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Visa number is required",
        path: ["visa_number"],
      });
    }
    if (!data.visa_expiry || data.visa_expiry.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Visa expiry is required",
        path: ["visa_expiry"],
      });
    }
  }

  // Postal address fields are only required if postal_same_as_residential is "No"
  if (data.postal_same_as_residential === "No") {
    if (!data.postal_country || data.postal_country.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Postal country is required",
        path: ["postal_country"],
      });
    }
    if (!data.postal_building_name || data.postal_building_name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Building/Property name is required",
        path: ["postal_building_name"],
      });
    }
    if (!data.postal_flat_unit || data.postal_flat_unit.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Flat/Unit is required",
        path: ["postal_flat_unit"],
      });
    }
    if (!data.postal_street_number || data.postal_street_number.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Street number is required",
        path: ["postal_street_number"],
      });
    }
    if (!data.postal_street_name || data.postal_street_name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Street name is required",
        path: ["postal_street_name"],
      });
    }
    if (!data.postal_suburb || data.postal_suburb.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City/Town/Suburb is required",
        path: ["postal_suburb"],
      });
    }
    if (!data.postal_state || data.postal_state.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "State/Province is required",
        path: ["postal_state"],
      });
    }
    if (!data.postal_postcode || data.postal_postcode.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Post code is required",
        path: ["postal_postcode"],
      });
    }
  }
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const defaultPersonalDetailsValues: PersonalDetailsValues = {
  student_origin: "",
  title: "",
  given_name: "",
  middle_name: "",
  family_name: "",
  gender: "",
  date_of_birth: "",
  email: "",
  // alternate_email: "j.smith.alt@example.com",
  phone: "",
  home_phone: "",
  country_of_birth: "",
  nationality: "",
  passport_number: "",
  passport_expiry: "",
  visa_type: "",
  visa_number: "",
  visa_expiry: "",
  search_address: "",
  country: "",
  building_name: "",
  flat_unit: "",
  street_number: "",
  street_name: "",
  suburb: "",
  state: "",
  postcode: "",
  postal_same_as_residential: "",
  postal_country: "",
  postal_building_name: "",
  postal_flat_unit: "",
  postal_street_number: "",
  postal_street_name: "",
  postal_suburb: "",
  postal_state: "",
  postal_postcode: "",
  overseas_country: "",
  overseas_address: "",
};
