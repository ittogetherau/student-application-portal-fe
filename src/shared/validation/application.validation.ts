import { z } from "zod";

import {
  additionalServicesSchema,
  type AdditionalServicesValues,
} from "../../features/application-form/utils/validations/additional-services";
import {
  enrollmentSchema,
  type EnrollmentValues,
} from "../../features/application-form/utils/validations/enrollment";
import {
  disabilitySchema,
  type DisabilityValues,
} from "../../features/application-form/utils/validations/disability";
import {
  documentsSchema,
  type DocumentsFormValues,
  type DocumentType,
} from "../../features/application-form/utils/validations/documents";
import {
  emergencyContactsSchema,
  type EmergencyContactsValues,
} from "../../features/application-form/utils/validations/emergency-contacts";
import {
  employmentSchema,
  type EmploymentFormValues,
} from "../../features/application-form/utils/validations/employment";
import {
  healthCoverSchema,
  type HealthCoverValues,
} from "../../features/application-form/utils/validations/health-cover";
import {
  languageAndCultureSchema,
  type LanguageAndCultureValues,
} from "../../features/application-form/utils/validations/language-cultural";
import {
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "../../features/application-form/utils/validations/personal-details";
import {
  qualificationsSchema,
  type QualificationsFormValues,
} from "../../features/application-form/utils/validations/qualifications";
import {
  schoolingSchema,
  type SchoolingValues,
} from "../../features/application-form/utils/validations/schooling";
import {
  surveySchema,
  type SurveyValues,
} from "../../features/application-form/utils/validations/survey";
import {
  usiSchema,
  type USIValues,
} from "../../features/application-form/utils/validations/usi";
import {
  threadCreateSchema,
  type ThreadCreateValues,
} from "../../features/application-form/utils/validations/thread";

// Application creation schema
export const applicationCreateSchema = z.object({
  agent_profile_id: z.string().uuid(),
  course_offering_id: z.string().uuid(),
});

export type ApplicationCreateValues = z.infer<typeof applicationCreateSchema>;

// Export all schemas for zod validation
export {
  additionalServicesSchema,
  enrollmentSchema,
  disabilitySchema,
  documentsSchema,
  emergencyContactsSchema,
  employmentSchema,
  healthCoverSchema,
  languageAndCultureSchema,
  personalDetailsSchema,
  qualificationsSchema,
  schoolingSchema,
  surveySchema,
  usiSchema,
  threadCreateSchema,
};

// Export all types for react-hook-form
export type {
  AdditionalServicesValues,
  EnrollmentValues,
  DisabilityValues,
  DocumentsFormValues,
  DocumentType,
  EmergencyContactsValues,
  EmploymentFormValues,
  HealthCoverValues,
  LanguageAndCultureValues,
  PersonalDetailsValues,
  QualificationsFormValues,
  SchoolingValues,
  SurveyValues,
  USIValues,
  ThreadCreateValues,
};

// Legacy aliases for backward compatibility
export {
  disabilitySchema as disabilitySupportSchema,
  emergencyContactsSchema as emergencyContactSchema,
  employmentSchema as employmentHistorySchema,
  languageAndCultureSchema as languageCulturalSchema,
  qualificationsSchema as previousQualificationsSchema,
  schoolingSchema as schoolingHistorySchema,
};

export type DisabilitySupportValues = DisabilityValues;
export type EmergencyContactValues = EmergencyContactsValues;
export type EmploymentHistoryValues = EmploymentFormValues;
export type LanguageCulturalValues = LanguageAndCultureValues;
export type PreviousQualificationsValues = QualificationsFormValues;
export type SchoolingHistoryValues = SchoolingValues;
export type UsiValues = USIValues;
