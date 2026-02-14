import { z } from "zod";

export const languageAndCultureSchema = z.object({
  // Aboriginal/Torres Strait Islander origin
  is_aus_aboriginal_or_islander: z.string().min(1, "Please select your origin"),

  // Main Language
  is_english_main_language: z.string().min(1, "Please select whether English is your main language"),
  main_language: z.string().optional(),

  // English Proficiency
  english_speaking_proficiency: z.string().min(1, "Please select your English speaking proficiency"),

  // Previous studies
  english_instruction_previous_studies: z.string().optional(),

  // English Test
  completed_english_test: z.string().optional(),
  english_test_type: z.string().optional(),
  english_test_date: z.string().optional().nullable().transform(v => v === "" ? null : v),
  english_test_listening: z.any().optional(),
  english_test_writing: z.any().optional(),
  english_test_reading: z.any().optional(),
  english_test_speaking: z.any().optional(),
  english_test_overall: z.any().optional(),

  // Kept for backward compatibility
  first_language: z.string().optional(),
  english_proficiency: z.string().optional(),
  other_languages: z.preprocess((val) => {
    if (typeof val === "string") {
      return val
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }
    if (Array.isArray(val)) {
      return (val as unknown[])
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }
    return [];
  }, z.array(z.string().min(1, "Other languages cannot be empty")).default([])),
  indigenous_status: z.string().optional(),
  country_of_birth: z.string().optional(),
  citizenship_status: z.string().optional(),
  visa_type: z.string().optional(),
  visa_expiry: z.string().optional().nullable().transform(v => v === "" ? null : v),
  english_test_score: z.string().optional(),
}).superRefine((data, ctx) => {
  // Main language requirement
  if (data.is_english_main_language === "No" && !data.main_language) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select your main language",
      path: ["main_language"],
    });
  }

  // English test requirements
  if (data.completed_english_test === "Yes") {
    if (!data.english_test_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Test type is required",
        path: ["english_test_type"],
      });
    }
    if (!data.english_test_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Test date is required",
        path: ["english_test_date"],
      });
    }
    if (!data.english_test_listening) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Listening score is required",
        path: ["english_test_listening"],
      });
    }
    if (!data.english_test_writing) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Writing score is required",
        path: ["english_test_writing"],
      });
    }
    if (!data.english_test_reading) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reading score is required",
        path: ["english_test_reading"],
      });
    }
    if (!data.english_test_speaking) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Speaking score is required",
        path: ["english_test_speaking"],
      });
    }
    if (!data.english_test_overall) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Overall score is required",
        path: ["english_test_overall"],
      });
    }
  }
});

export type LanguageAndCultureValues = z.output<
  typeof languageAndCultureSchema
>;
export type LanguageAndCultureFormValues = z.input<
  typeof languageAndCultureSchema
>;

export const defaultLanguageAndCultureValues: LanguageAndCultureFormValues = {
  // New fields
  is_aus_aboriginal_or_islander: "4",
  is_english_main_language: "No",
  main_language: "",
  english_speaking_proficiency: "",
  english_instruction_previous_studies: "",
  completed_english_test: "",
  english_test_type: "",
  english_test_date: null,
  english_test_listening: null,
  english_test_writing: null,
  english_test_reading: null,
  english_test_speaking: null,
  english_test_overall: null,

  // Legacy fields
  first_language: "",
  english_proficiency: "",
  other_languages: "",
  indigenous_status: "",
  country_of_birth: "",
  citizenship_status: "",
  visa_type: "",
  visa_expiry: null,
  english_test_score: "",
};
