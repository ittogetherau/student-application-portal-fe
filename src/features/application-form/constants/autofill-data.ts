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
} from "@/shared/validation/application.validation";

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

const FIRST_NAMES = [
  "Ava",
  "Liam",
  "Mia",
  "Noah",
  "Sophia",
  "Ethan",
  "Isabella",
  "Lucas",
  "Amelia",
  "Mason",
  "Olivia",
  "Logan",
];

const LAST_NAMES = [
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Hernandez",
];

const pickOne = <T>(values: T[]): T =>
  values[Math.floor(Math.random() * values.length)];

const randomDigits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

const buildEmail = (first: string, last: string) => {
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${first}.${last}${suffix}@example.com`.toLowerCase();
};

const studentFirstName = pickOne(FIRST_NAMES);
const studentLastName = pickOne(LAST_NAMES);
const studentEmail = buildEmail(studentFirstName, studentLastName);
const studentPhone = `04${randomDigits(8)}`;
const studentHomePhone = `0${randomDigits(9)}`;

const emergencyFirstName = pickOne(FIRST_NAMES);
const emergencyLastName = pickOne(LAST_NAMES);
const emergencyEmail = buildEmail(emergencyFirstName, emergencyLastName);
const emergencyPhone = `04${randomDigits(8)}`;

export const DEFAULT_AUTO_FILL_DATA: AutoFillData = {
  enrollmentData: {
    course: 8,
    course_name: "Bachelor Of Business- Major In Information System",
    intake: 50,
    intake_name: "CIHE2023 SEM 2",
    campus: 1,
    campus_name: "CIHE Parramatta Campus",
    advanced_standing_credit: "No",
    offer_issued_date: "2026-02-10",
    study_reason: "01",
    course_actual_fee: 10000,
    course_upfront_fee: 5000,
    enrollment_fee: 250,
    material_fee: 100,
    include_material_fee_in_initial_payment: "Yes",
    receiving_scholarship_bursary: "No",
    wil_requirements: "N/A",
    third_party_providers_application_request: "N/A",
  },
  personalDetailsData: {
    student_origin: "Overseas Student (Offshore)",
    title: "Mr",
    given_name: studentFirstName,
    middle_name: "Michael",
    family_name: studentLastName,
    gender: "Male",
    date_of_birth: "1995-06-15",
    email: studentEmail,
    phone: studentPhone,
    home_phone: studentHomePhone,
    country_of_birth: "australia",
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
  },
  emergencyContactData: {
    contacts: [
      {
        name: `${emergencyFirstName} ${emergencyLastName}`,
        relationship: "friend",
        phone: emergencyPhone,
        email: emergencyEmail,
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
    is_aus_aboriginal_or_islander: "4",
    is_english_main_language: "Yes",
    main_language: "English",
    english_speaking_proficiency: "Very Well",
    english_instruction_previous_studies: "Yes",
    completed_english_test: "Yes",
    english_test_type: "ielts",
    english_test_date: "2024-06-15",
    english_test_listening: 7.5,
    english_test_writing: 7.0,
    english_test_reading: 8.0,
    english_test_speaking: 7.5,
    english_test_overall: 7.5,
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
    entries: [
      {
        country: "Australia",

        institution: "St. Mary's High School",
        start_year: 2012,
        qualification_level: "12 - Completed year 12",
        currently_attending: false,
      },
    ],
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
