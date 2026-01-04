/* eslint-disable @typescript-eslint/no-explicit-any */
import DisabilityForm from "../_forms/disability-form";
import DocumentsUploadForm from "@/components/forms/application-forms/documents-upload-form";
import EmploymentForm from "../_forms/employment-form";
import HealthCoverForm from "../_forms/health-cover-form";
import LanguageCulturalForm from "../_forms/language-cultural-form";
import QualificationsForm from "../_forms/qualifications-form";
import SchoolingForm from "../_forms/schooling-form";
import EnrollmentForm from "../_forms/enrollment-form";
import PersonalDetailsForm from "../_forms/personal-details-form";
import EmergencyContactForm from "../_forms/emergency-contact-form";
import UsiForm from "../_forms/usi-form";
import SurveyForm from "../_forms/survey-form";
import ReviewForm from "@/app/dashboard/application/create/_forms/review-form";
import AdditionalServicesForm from "../_forms/additional-services-form";

interface IFormComponent {
  id: number;
  component: any;
}

export const FORM_COMPONENTS: IFormComponent[] = [
  { id: 0, component: EnrollmentForm },
  { id: 1, component: PersonalDetailsForm },
  { id: 2, component: EmergencyContactForm },
  { id: 3, component: HealthCoverForm },
  { id: 4, component: LanguageCulturalForm },
  { id: 5, component: DisabilityForm },
  { id: 6, component: SchoolingForm },
  { id: 7, component: QualificationsForm },
  { id: 8, component: EmploymentForm },
  { id: 9, component: UsiForm },
  { id: 10, component: AdditionalServicesForm },
  { id: 11, component: SurveyForm },
  { id: 12, component: DocumentsUploadForm },
  { id: 13, component: ReviewForm },
];
