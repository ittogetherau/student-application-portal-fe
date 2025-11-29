import { z } from "zod";

export const languageAndCultureSchema = z.object({
  first_language: z.string().min(1, "First language is required"),
  english_proficiency: z.string().min(1, "English proficiency is required"),
  other_languages: z.string(),
  indigenous_status: z.string().min(1, "Indigenous status is required"),
  country_of_birth: z.string().min(1, "Country of birth is required"),
  citizenship_status: z.string().min(1, "Citizenship status is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  visa_expiry: z.string().min(1, "Visa expiry is required"),
  english_test_type: z.string().min(1, "English test type is required"),
  english_test_score: z.string().min(1, "English test score is required"),
  english_test_date: z.string().min(1, "English test date is required"),
});

export type LanguageAndCultureValues = z.infer<typeof languageAndCultureSchema>;

export const defaultLanguageAndCultureValues: LanguageAndCultureValues = {
  first_language: "",
  english_proficiency: "",
  other_languages: "",
  indigenous_status: "",
  country_of_birth: "",
  citizenship_status: "",
  visa_type: "",
  visa_expiry: "",
  english_test_type: "",
  english_test_score: "",
  english_test_date: "",
};
