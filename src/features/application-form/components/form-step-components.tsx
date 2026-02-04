/* eslint-disable @typescript-eslint/no-explicit-any */
import HealthCoverForm from "./forms/health-cover-form";
import LanguageCulturalForm from "./forms/language-cultural-form";
import QualificationsForm from "./forms/qualifications-form";
import SchoolingForm from "./forms/schooling-form";
import EnrollmentForm from "./forms/enrollment-form";
import PersonalDetailsForm from "./forms/personal-details-form";
import EmergencyContactForm from "./forms/emergency-contact-form";
import UsiForm from "./forms/usi-form";
import SurveyForm from "./forms/survey-form";
import AdditionalServicesForm from "./forms/additional-services-form";
import DocumentsUploadForm from "./forms/documents-upload-form";
import EmploymentForm from "./forms/employment-form";
import DisabilityForm from "./forms/disability-form";
import ReviewForm from "./forms/review-form";

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
