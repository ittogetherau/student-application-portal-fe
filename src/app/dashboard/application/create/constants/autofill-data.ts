import type {
  AdditionalServicesValues,
  DisabilitySupportValues,
  EmergencyContactValues,
  EmploymentHistoryValues,
  EnrollmentValues,
  HealthCoverValues,
  LanguageCulturalValues,
  PersonalDetailsValues,
  PreviousQualificationsValues,
  SchoolingHistoryValues,
  SurveyValues,
  UsiValues,
} from "@/validation/application.validation";

type AutoFillData = {
  enrollmentData: EnrollmentValues;
  personalDetailsData: PersonalDetailsValues;
  emergencyContactData: EmergencyContactValues;
  healthCoverData: HealthCoverValues;
  languageCultureData: LanguageCulturalValues;
  disabilityData: DisabilitySupportValues;
  schoolingData: SchoolingHistoryValues;
  qualificationsData: PreviousQualificationsValues;
  employmentData: EmploymentHistoryValues;
  usiData: UsiValues;
  additionalServicesData: AdditionalServicesValues;
  surveyData: SurveyValues;
  documentsData: {
    uploaded_documents: unknown[];
    required_documents: unknown[];
  };
  reviewData: {
    terms_accepted: boolean;
    declaration_signed: boolean;
  };
};

export const DEFAULT_AUTO_FILL_DATA: AutoFillData = {
  enrollmentData: {
    campus: 1,
    course: 6,
    intake: 53,
  },
  personalDetailsData: {
    student_origin: "Overseas Student (Offshore)",
    title: "Mr",
    given_name: "John",
    middle_name: "Michael",
    family_name: "Smith",
    gender: "Male",
    date_of_birth: "1995-06-15",
    email: "john12.smith@example.com",
    alternate_email: "j.smith.alt@example.com",
    phone: "1234567890",
    home_phone: "0987654321",
    country_of_birth: "United States",
    nationality: "American",
    passport_number: "A12345678",
    passport_expiry: "2030-12-31",
    visa_type: "Student Visa",
    visa_number: "123456789",
    visa_expiry: "2026-12-31",
    search_address: "123 Main Street, Sydney NSW 2000",
    country: "Australia",
    building_name: "Main Building",
    flat_unit: "Unit 5",
    street_number: "123",
    street_name: "Main Street",
    suburb: "Sydney",
    state: "NSW",
    postcode: "2000",
    postal_same_as_residential: "Yes",
    postal_country: "",
    postal_building_name: "",
    postal_flat_unit: "",
    postal_street_number: "",
    postal_street_name: "",
    postal_suburb: "",
    postal_state: "",
    postal_postcode: "",
    overseas_country: "United States",
    overseas_address: "456 Oak Avenue, New York, NY 10001",
  },
  emergencyContactData: {
    contacts: [
      {
        name: "Jane Smith",
        relationship: "friend",
        phone: "0987654321",
        email: "jane.smith@example.com",
        address: "456 Oak Street, Melbourne VIC 3000",
        is_primary: true,
      },
    ],
  },
  healthCoverData: {
    arrange_OSHC: true,
    OSHC_provider: "Medibank",
    OSHC_type: "Single" as const,
    OSHC_start_date: "2025-01-01",
    OSHC_end_date: "2026-12-31",
    OSHC_duration: "12 months",
    OSHC_fee: 650,
  },
  languageCultureData: {
    aboriginal_torres_strait:
      "No, Neither Aboriginal and Torres Strait Islander",
    is_english_main_language: "Yes",
    main_language: "English",
    english_speaking_proficiency: "Very Well",
    english_instruction_previous_studies: "Yes",
    completed_english_test: "Yes",
    english_test_type: "ielts",
    english_test_date: "2024-06-15",
    english_test_listening: "7.5",
    english_test_writing: "7.0",
    english_test_reading: "8.0",
    english_test_speaking: "7.5",
    english_test_overall: "7.5",
    first_language: "English",
    english_proficiency: "Native",
    other_languages: ["Spanish", "French"],
    indigenous_status: "No",
    country_of_birth: "United States",
    citizenship_status: "Non-citizen",
    visa_type: "Student Visa",
    visa_expiry: "2026-12-31",
    english_test_score: "7.5",
  },
  disabilityData: {
    has_disability: "No",
    disability_hearing: false,
    disability_physical: false,
    disability_intellectual: false,
    disability_learning: false,
    disability_mental_illness: false,
    disability_acquired_brain: false,
    disability_vision: false,
    disability_medical_condition: false,
    disability_other: false,
    disability_type: "",
    disability_details: "",
    support_required: "",
    has_documentation: false,
    documentation_status: "",
    adjustments_needed: "",
  },
  schoolingData: {
    highest_school_level: "12 - Completed year 12",
    still_attending: "No",
    secondary_school_type: "Government",
  },
  qualificationsData: {
    has_qualifications: "Yes",
    qualifications: [
      {
        qualification_name: "Bachelor of Arts",
        institution: "University of Sydney",
        completion_date: "2017-12-15",
        certificate_number: "BA2017-12345",
        field_of_study: "English Literature",
        grade: "Distinction",
      },
    ],
  },
  employmentData: {
    employment_status: "01 - Fulltime employee",
    entries: [
      {
        employer: "Tech Solutions Pty Ltd",
        role: "Software Developer",
        start_date: "2018-01-15",
        end_date: "2024-12-31",
        is_current: true,
        responsibilities: "Developing web applications using React and Node.js",
        industry: "Information Technology",
      },
    ],
  },
  usiData: {
    usi: "ABC1234567",
    consent_to_verify: true,
  },
  additionalServicesData: {
    request_additional_services: "Yes",
    services: [
      {
        service_name: "Airport Pickup",
        category_name: "Transport",
        facility_name: "Arrival",
        service_provider: "Churchill",
        student_price_per_service: 50,
        provider_price_per_service: 40,
        service_start_date: "2025-02-01",
        service_end_date: "2025-02-01",
        service_comment: "Transportation from airport to accommodation",
        selected: true,
      },
      {
        service_name: "Accommodation Assistance",
        category_name: "Housing",
        facility_name: "Student Services",
        service_provider: "Churchill",
        student_price_per_service: 100,
        provider_price_per_service: 80,
        service_start_date: "2025-02-01",
        service_end_date: "2025-03-01",
        service_comment: "Help finding suitable accommodation",
        selected: true,
      },
    ],
  },
  surveyData: {
    availability_status: "A",
  },
  documentsData: {
    uploaded_documents: [],
    required_documents: [],
  },
  reviewData: {
    terms_accepted: false,
    declaration_signed: false,
  },
};
