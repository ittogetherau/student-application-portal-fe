import { z } from "zod";

export const schoolingEntrySchema = z.object({
  country: z.string().min(1, "Country is required"),
  start_year: z.number().min(1900, "Valid year required"),
  institution: z.string().min(1, "Institution is required"),
  qualification_level: z.string().min(1, "Qualification level is required"),
  currently_attending: z.boolean(),
});

export const schoolingSchema = z.object({
  // Highest Completed School Level
  highest_school_level: z.string().min(1, "Please select your highest school level"),

  // Currently Attending
  still_attending: z.enum(["Yes", "No"]).optional(),

  // Secondary School Type (Conditional)
  secondary_school_type: z.string().optional(),

  // Entries
  entries: z.array(schoolingEntrySchema),
}).superRefine((data, ctx) => {
  if (data.highest_school_level !== "02 - Did not go to School") {
    if (!data.still_attending) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select if you are still attending school",
        path: ["still_attending"],
      });
    }

    if (data.still_attending === "Yes" && (!data.secondary_school_type || data.secondary_school_type === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select your secondary school type",
        path: ["secondary_school_type"],
      });
    }
  }
});

export type SchoolingValues = z.infer<typeof schoolingSchema>;

export const createEmptySchoolingEntry = () => ({
  country: "",
  start_year: new Date().getFullYear(),
  institution: "",
  qualification_level: "",
  currently_attending: false,
});

export const defaultSchoolingValues: SchoolingValues = {
  highest_school_level: "",
  still_attending: "No",
  secondary_school_type: "",
  entries: [],
};
