"use client";

import { z } from "zod";

const emailOrEmpty = z
  .string()
  .email("Enter a valid email address.")
  .optional()
  .or(z.literal(""));

const optionalString = z.string().optional();

const yesNoEnum = z.enum(["yes", "no"]);

export const personalDetailsSchema = z.object({
  studentOrigin: z.enum(["offshore", "onshore", "domestic"]),
  title: z.enum(["mr", "ms", "mrs", "other"]),
  firstName: z.string().min(1, "First name is required."),
  middleName: optionalString.or(z.literal("")),
  lastName: z.string().min(1, "Last name is required."),
  gender: z.enum(["male", "female", "other-gender"]),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  contactEmail: z.string().email("Enter a valid email address."),
  alternateEmail: emailOrEmpty,
  mobileNumber: z.string().min(1, "Mobile number is required."),
  homePhone: optionalString.or(z.literal("")),
  countryOfBirth: z.string().min(1, "Country of birth is required."),
  nationality: z.string().min(1, "Nationality is required."),
  passportNumber: z.string().min(1, "Passport number is required."),
  passportExpiry: z.string().min(1, "Passport expiry is required."),
  resCountry: z.string().min(1, "Residential country is required."),
  resBuilding: optionalString.or(z.literal("")),
  resUnit: optionalString.or(z.literal("")),
  resStreetNumber: z.string().min(1, "Street number is required."),
  resStreetName: z.string().min(1, "Street name is required."),
  resCity: z.string().min(1, "City is required."),
  resState: z.string().min(1, "State is required."),
  resPostCode: z.string().min(1, "Post code is required."),
  postalSameAsResidential: z.boolean().optional(),
  posCountry: optionalString.or(z.literal("")),
  posBuilding: optionalString.or(z.literal("")),
  posUnit: optionalString.or(z.literal("")),
  posStreetNumber: optionalString.or(z.literal("")),
  posStreetName: optionalString.or(z.literal("")),
  posCity: optionalString.or(z.literal("")),
  posState: optionalString.or(z.literal("")),
  posPostCode: optionalString.or(z.literal("")),
  overseasCountry: optionalString.or(z.literal("")),
  overseasAddress: optionalString.or(z.literal("")),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const emergencyContactSchema = z.object({
  contactPerson: z.string().min(1, "Contact person is required."),
  relationship: z.string().min(1, "Relationship is required."),
  phone: z.string().min(1, "Phone is required."),
  email: emailOrEmpty,
  address: optionalString.or(z.literal("")),
});

export type EmergencyContactValues = z.infer<typeof emergencyContactSchema>;

export const healthCoverSchema = z.object({
  applyOHSC: yesNoEnum,
});

export type HealthCoverValues = z.infer<typeof healthCoverSchema>;

const englishTestSchema = z.object({
  testType: z.string().min(1, "Select a test type."),
  testDate: z.string().min(1, "Test date is required."),
  scoreType: z.enum(["4skills", "overall", ""]).optional(),
  listeningScore: optionalString.or(z.literal("")),
  readingScore: optionalString.or(z.literal("")),
  writingScore: optionalString.or(z.literal("")),
  speakingScore: optionalString.or(z.literal("")),
  overallScore: z.string().optional(),
});

export const languageCulturalSchema = z.object({
  aboriginalOrigin: z
    .enum(["both", "aboriginal", "islander", "neither", "not-stated"])
    .optional(),
  englishMain: yesNoEnum,
  mainLanguage: optionalString.or(z.literal("")),
  englishProficiency: optionalString.or(z.literal("")),
  englishInstruction: yesNoEnum.optional(),
  completedEnglishTest: yesNoEnum.optional(),
  englishTests: z.array(englishTestSchema).optional(),
});

export type LanguageCulturalValues = z.infer<typeof languageCulturalSchema>;

export const disabilitySupportSchema = z.object({
  hasDisability: yesNoEnum,
  disabilityTypes: z
    .record(z.string(), z.boolean())
    .optional()
    .default({}),
});

export type DisabilitySupportValues = z.infer<typeof disabilitySupportSchema>;

export const schoolingHistorySchema = z.object({
  highestSchoolLevel: z.string().min(1, "Highest level is required."),
  stillAttending: yesNoEnum.optional(),
  schoolType: optionalString.or(z.literal("")),
  fundingSource: optionalString.or(z.literal("")),
  vetInSchool: yesNoEnum.optional(),
});

export type SchoolingHistoryValues = z.infer<typeof schoolingHistorySchema>;

export const previousQualificationsSchema = z.object({
  hasQualifications: yesNoEnum,
});

export type PreviousQualificationsValues = z.infer<
  typeof previousQualificationsSchema
>;

const employmentHistoryItemSchema = z.object({
  employer: optionalString.or(z.literal("")),
  occupation: optionalString.or(z.literal("")),
  durationFrom: optionalString.or(z.literal("")),
  durationTo: optionalString.or(z.literal("")),
  duties: optionalString.or(z.literal("")),
});

export const employmentHistorySchema = z.object({
  employmentStatus: z.string().min(1, "Employment status is required."),
  employmentHistory: z.array(employmentHistoryItemSchema).optional(),
});

export type EmploymentHistoryValues = z.infer<typeof employmentHistorySchema>;

export const usiSchema = z.object({
  hasUSI: yesNoEnum,
  usiNumber: optionalString.or(z.literal("")),
  applyUSI: z.boolean().optional(),
});

export type UsiValues = z.infer<typeof usiSchema>;

export const additionalServicesSchema = z.object({
  requestAdditionalServices: yesNoEnum,
});

export type AdditionalServicesValues = z.infer<
  typeof additionalServicesSchema
>;

export const surveySchema = z.object({
  surveyContactStatus: z.string().min(1, "Select a survey status."),
});

export type SurveyValues = z.infer<typeof surveySchema>;

const documentFileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: optionalString.or(z.literal("")),
  lastModified: z.number().optional(),
});

const documentRequirementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  required: z.boolean().optional().default(false),
  files: z.array(documentFileSchema).optional().default([]),
});

export const documentsSchema = z.object({
  documents: z.array(documentRequirementSchema),
});

export type DocumentChecklistValues = z.infer<typeof documentsSchema>;

export const applicationCreateSchema = z.object({
  personalDetails: personalDetailsSchema,
  emergencyContact: emergencyContactSchema,
  healthCover: healthCoverSchema,
  languageCultural: languageCulturalSchema,
  disabilitySupport: disabilitySupportSchema,
  schoolingHistory: schoolingHistorySchema,
  previousQualifications: previousQualificationsSchema,
  employmentHistory: employmentHistorySchema,
  usi: usiSchema,
  additionalServices: additionalServicesSchema,
  survey: surveySchema,
  documents: documentsSchema.optional(),
});

export type ApplicationCreateValues = z.infer<typeof applicationCreateSchema>;
