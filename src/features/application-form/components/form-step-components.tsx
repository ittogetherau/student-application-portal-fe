import type { ComponentType } from "react";
import { APPLICATION_FORM_STEPS } from "../constants/form-step-config";
import AdditionalServicesForm from "./forms/additional-services-form";
import DisabilityForm from "./forms/disability-form";
import DocumentsUploadForm from "./forms/documents-upload-form";
import EmergencyContactForm from "./forms/emergency-contact-form";
import EmploymentForm from "./forms/employment-form";
import EnrollmentForm from "./forms/enrollment-form";
import HealthCoverForm from "./forms/health-cover-form";
import LanguageCulturalForm from "./forms/language-cultural-form";
import PersonalDetailsForm from "./forms/personal-details-form";
import QualificationsForm from "./forms/qualifications-form";
import ReviewForm from "./forms/review-form";
import SchoolingForm from "./forms/schooling-form";
import SurveyForm from "./forms/survey-form";
import UsiForm from "./forms/usi-form";

type FormStepComponent = {
  id: number;
  component: ComponentType<FormStepProps>;
};

type FormStepProps = {
  applicationId?: string;
  showDetails?: boolean;
};

const COMPONENT_BY_STEP_ID: Record<number, ComponentType<FormStepProps>> = {
  0: EnrollmentForm as ComponentType<FormStepProps>,
  1: PersonalDetailsForm as ComponentType<FormStepProps>,
  2: EmergencyContactForm as ComponentType<FormStepProps>,
  3: HealthCoverForm as ComponentType<FormStepProps>,
  4: LanguageCulturalForm as ComponentType<FormStepProps>,
  5: DisabilityForm as ComponentType<FormStepProps>,
  6: SchoolingForm as ComponentType<FormStepProps>,
  7: QualificationsForm as ComponentType<FormStepProps>,
  8: EmploymentForm as ComponentType<FormStepProps>,
  9: UsiForm as ComponentType<FormStepProps>,
  10: AdditionalServicesForm as ComponentType<FormStepProps>,
  11: SurveyForm as ComponentType<FormStepProps>,
  12: DocumentsUploadForm as ComponentType<FormStepProps>,
  13: ReviewForm as ComponentType<FormStepProps>,
};

export const FORM_COMPONENTS: FormStepComponent[] = APPLICATION_FORM_STEPS.map(
  (step) => ({
    id: step.id,
    component: COMPONENT_BY_STEP_ID[step.id],
  }),
);
