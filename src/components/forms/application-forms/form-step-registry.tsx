/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import {
//   APPLICATION_STEP_IDS,
//   REVIEW_STEP_ID,
//   TOTAL_APPLICATION_STEPS,
// } from "@/constants/application-steps";
import AdditionalServicesForm from "../../../app/dashboard/application/create/_forms/additional-services-form";
import DisabilityForm from "../../../app/dashboard/application/create/_forms/disability-form";
import DocumentsUploadForm from "./documents-upload-form";
import EmergencyContactForm from "../../../app/dashboard/application/create/_forms/emergency-contact-form";
import EmploymentForm from "../../../app/dashboard/application/create/_forms/employment-form";
import EnrollmentManagementView from "../../../app/dashboard/application/create/_forms/enrollment-form";
import HealthCoverForm from "../../../app/dashboard/application/create/_forms/health-cover-form";
import LanguageCulturalForm from "../../../app/dashboard/application/create/_forms/language-cultural-form";
import PersonalDetailsForm from "../../../app/dashboard/application/create/_forms/personal-details-form";
import QualificationsForm from "../../../app/dashboard/application/create/_forms/qualifications-form";
import ReviewForm from "../../../app/dashboard/application/create/_forms/review-form";
import SchoolingForm from "../../../app/dashboard/application/create/_forms/schooling-form";
import SurveyForm from "../../../app/dashboard/application/create/_forms/survey-form";
import USIForm from "../../../app/dashboard/application/create/_forms/usi-form";

export type ApplicationFormStep = {
  id: number;
  title: string;
  component: any;
};

export const APPLICATION_FORM_STEPS: ApplicationFormStep[] = [
  { id: 0, title: "Enrollment", component: EnrollmentManagementView },
  { id: 1, title: "Personal Details", component: PersonalDetailsForm },
  { id: 2, title: "Emergency Contact", component: EmergencyContactForm },
  { id: 3, title: "Health Cover", component: HealthCoverForm },
  { id: 4, title: "Language & Culture", component: LanguageCulturalForm },
  { id: 5, title: "Disability", component: DisabilityForm },
  { id: 6, title: "Schooling", component: SchoolingForm },
  { id: 7, title: "Qualifications", component: QualificationsForm },
  { id: 8, title: "Employment", component: EmploymentForm },
  { id: 9, title: "USI", component: USIForm },
  { id: 10, title: "Additional Services", component: AdditionalServicesForm },
  { id: 11, title: "Survey", component: SurveyForm },
  { id: 12, title: "Documents", component: DocumentsUploadForm },
  { id: 13, title: "Review", component: ReviewForm },
];

// export { APPLICATION_STEP_IDS, REVIEW_STEP_ID, TOTAL_APPLICATION_STEPS };
