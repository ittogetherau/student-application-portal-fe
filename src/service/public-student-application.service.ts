import { ApiService } from "@/service/base.service";
import type { ApplicationDetailResponse } from "@/service/application.service";
import type { StepUpdateResponse } from "@/service/application-steps.service";
import type {
  ApplicationDocumentListItem,
  DocumentType,
} from "@/service/document.service";
import {
  buildQueryString,
  resolveServiceCall,
  type QueryValue,
} from "@/service/service-helpers";
import type { ServiceResponse } from "@/shared/types/service";
import { handleApiError } from "@/shared/utils/handle-api-error";
import {
  type AdditionalServicesValues,
  type DisabilitySupportValues,
  type EmergencyContactValues,
  type EmploymentHistoryValues,
  type EnrollmentValues,
  type HealthCoverValues,
  type LanguageCulturalValues,
  type PersonalDetailsValues,
  type PreviousQualificationsValues,
  type SchoolingHistoryValues,
  type SurveyValues,
  type UsiValues,
  additionalServicesSchema,
  disabilitySupportSchema,
  emergencyContactSchema,
  employmentHistorySchema,
  enrollmentSchema,
  healthCoverSchema,
  languageCulturalSchema,
  personalDetailsSchema,
  previousQualificationsSchema,
  schoolingHistorySchema,
  surveySchema,
  usiSchema,
} from "@/shared/validation/application.validation";
import { z } from "zod";

const requestAccessSchema = z.object({
  email: z.email(),
});

const studentEmailSchema = z.object({
  student_email: z.email(),
});

export interface RequestAccessPayload {
  email: string;
}

export interface RequestAccessResponse {
  redirect_url: string;
  expires_at: string;
  token_reused: boolean;
}

export interface PublicStudentApplicationOpenResponse {
  valid?: boolean;
  application_id?: string | null;
  tracking_code?: string | null;
  current_stage?: string | null;
  expires_at?: string | null;
  student_email?: string | null;
  submitted_by_student?: boolean | null;
  [key: string]: unknown;
}

export interface PublicStudentApplicationDetailResponse
  extends ApplicationDetailResponse {
  student_email?: string | null;
  submitted_by_student?: boolean | null;
}

export interface PublicStudentApplicationSubmitResponse {
  application_id?: string;
  submitted_at?: string;
  current_stage?: string;
  message?: string;
  [key: string]: unknown;
}

export interface PublicStudentDocumentUploadResponse {
  process_ocr?: boolean;
  preview_url?: string;
  [key: string]: unknown;
}

export interface PublicStudentRequiredDocument {
  document_type_code: string;
  document_type_name: string;
  is_mandatory: boolean;
  uploaded: boolean;
  uploaded_at?: string | null;
  status?: string | null;
  ocr_status?: string | null;
}

export interface PublicStudentDocumentsResponse {
  required_documents?: PublicStudentRequiredDocument[];
  total_required?: number;
  total_uploaded?: number;
  all_mandatory_uploaded?: boolean;
  documents?: ApplicationDocumentListItem[];
  coe_workflow?: unknown;
}

export type PublicStudentApplicationStepName =
  | "enrollment"
  | "personal_details"
  | "emergency_contact"
  | "health_cover"
  | "language_cultural"
  | "disability"
  | "schooling"
  | "previous_qualifications"
  | "employment"
  | "usi"
  | "additional_services"
  | "survey";

class PublicStudentApplicationService extends ApiService {
  private readonly basePath = "public/student-applications";

  private readonly stepNameMap: Record<number, PublicStudentApplicationStepName> =
    {
      0: "enrollment",
      1: "personal_details",
      2: "emergency_contact",
      3: "health_cover",
      4: "language_cultural",
      5: "disability",
      6: "schooling",
      7: "previous_qualifications",
      8: "employment",
      9: "usi",
      10: "additional_services",
      11: "survey",
    };

  private readonly stepSlugMap: Record<number, string> = {
    0: "enrollment",
    1: "personal-details",
    2: "emergency-contact",
    3: "health-cover",
    4: "language-cultural",
    5: "disability-support",
    6: "schooling-history",
    7: "qualifications",
    8: "employment-history",
    9: "usi",
    10: "additional-services",
    11: "survey",
    12: "documents",
  };

  private buildTokenPath(
    path: string,
    token: string,
    params: Record<string, QueryValue> = {},
  ) {
    const normalizedToken = token.trim();
    if (!normalizedToken) throw new Error("Token is required");
    return `${this.basePath}/${path}${buildQueryString({
      token: normalizedToken,
      ...params,
    })}`;
  }

  private resolveStepName(step: number | string): string {
    if (typeof step === "number") {
      const stepName = this.stepNameMap[step];
      if (!stepName) throw new Error(`Invalid step ID: ${step}`);
      return stepName;
    }

    const normalizedStep = step.trim();
    if (!normalizedStep) throw new Error("Step name is required");
    return normalizedStep;
  }

  private resolveStepSlug(stepId: number): string {
    const stepSlug = this.stepSlugMap[stepId];
    if (!stepSlug) throw new Error(`Invalid step ID: ${stepId}`);
    return stepSlug;
  }

  private buildStepUpdatePath(stepId: number, token: string) {
    return this.buildTokenPath(
      `steps/${stepId}/${this.resolveStepSlug(stepId)}`,
      token,
    );
  }

  requestAccess = async (
    input: RequestAccessPayload | string,
  ): Promise<ServiceResponse<RequestAccessResponse>> => {
    try {
      const payload = requestAccessSchema.parse(
        typeof input === "string" ? { email: input } : input,
      );

      return await resolveServiceCall<RequestAccessResponse>(
        () =>
          this.post<RequestAccessResponse>(
            `${this.basePath}/request-access`,
            payload,
            false,
          ),
        "Access link requested successfully.",
        "Failed to request access link",
      );
    } catch (error) {
      return handleApiError<RequestAccessResponse>(
        error,
        "Failed to request access link",
      );
    }
  };

  openApplication = async (
    token: string,
  ): Promise<ServiceResponse<PublicStudentApplicationOpenResponse>> =>
    resolveServiceCall<PublicStudentApplicationOpenResponse>(
      () =>
        this.get<PublicStudentApplicationOpenResponse>(
          this.buildTokenPath("open", token),
          false,
        ),
      "Application access validated.",
      "Failed to open application",
    );

  getApplication = async (
    token: string,
  ): Promise<ServiceResponse<PublicStudentApplicationDetailResponse>> =>
    resolveServiceCall<PublicStudentApplicationDetailResponse>(
      () =>
        this.get<PublicStudentApplicationDetailResponse>(
          this.buildTokenPath("application", token),
          false,
        ),
      "Application fetched successfully.",
      "Failed to fetch application",
    );

  patchApplication = async (
    token: string,
    payload: Record<string, unknown>,
  ): Promise<ServiceResponse<PublicStudentApplicationDetailResponse>> =>
    resolveServiceCall<PublicStudentApplicationDetailResponse>(
      () =>
        this.patch<PublicStudentApplicationDetailResponse>(
          this.buildTokenPath("application", token),
          payload,
          false,
        ),
      "Application updated successfully.",
      "Failed to update application",
    );

  getDocumentTypes = async (
    token: string,
    initialOnly?: boolean,
  ): Promise<ServiceResponse<DocumentType[]>> =>
    resolveServiceCall<DocumentType[]>(
      () =>
        this.get<DocumentType[]>(
          this.buildTokenPath("document-types", token, {
            initial_only: initialOnly,
          }),
          false,
        ),
      "Document types fetched successfully.",
      "Failed to fetch document types",
    );

  getEnrollmentDetails = async (
    token: string,
  ): Promise<ServiceResponse<{ data?: unknown }>> =>
    resolveServiceCall<{ data?: unknown }>(
      () =>
        this.get<{ data?: unknown }>(
          this.buildTokenPath("steps/enrollments", token),
          false,
        ),
      "Enrollment details fetched.",
      "Failed to fetch enrollment details",
    );

  getStepData = async (
    token: string,
    step: number | PublicStudentApplicationStepName | string,
  ): Promise<ServiceResponse<{ data?: unknown }>> =>
    resolveServiceCall<{ data?: unknown }>(
      () =>
        this.get<{ data?: unknown }>(
          this.buildTokenPath(`steps/${this.resolveStepName(step)}`, token),
          false,
        ),
      "Step data fetched.",
      "Failed to fetch step data",
    );

  getDocuments = async (
    token: string,
    stepId: number = 12,
  ): Promise<ServiceResponse<PublicStudentDocumentsResponse>> =>
    resolveServiceCall<PublicStudentDocumentsResponse>(
      () =>
        this.get<PublicStudentDocumentsResponse>(
          this.buildTokenPath(`steps/${stepId}/documents`, token),
          false,
        ),
      "Documents fetched.",
      "Failed to fetch documents",
    );

  uploadDocument = async (
    token: string,
    documentTypeId: string,
    file: File,
    processOcr: boolean = false,
    uploadMode?: "replace" | "new",
    documentName?: string,
  ): Promise<ServiceResponse<PublicStudentDocumentUploadResponse>> => {
    try {
      if (!documentTypeId) throw new Error("Document type id is required");
      if (!file) throw new Error("File is required");

      const formData = new FormData();
      formData.append("document_type_id", documentTypeId);
      formData.append("file", file);
      formData.append("process_ocr", processOcr ? "true" : "false");
      if (uploadMode) formData.append("upload_mode", uploadMode);
      if (documentName) formData.append("document_name", documentName);

      return await resolveServiceCall<PublicStudentDocumentUploadResponse>(
        () =>
          this.post<PublicStudentDocumentUploadResponse>(
            this.buildTokenPath("steps/12/documents/upload", token),
            formData,
            false,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          ),
        "Document uploaded successfully.",
        "Failed to upload document",
      );
    } catch (error) {
      return handleApiError<PublicStudentDocumentUploadResponse>(
        error,
        "Failed to upload document",
      );
    }
  };

  updateStep = async <TPayload>(
    token: string,
    stepId: number,
    payload: TPayload,
  ): Promise<ServiceResponse<StepUpdateResponse>> =>
    resolveServiceCall<StepUpdateResponse>(
      () =>
        this.patch<StepUpdateResponse>(
          this.buildStepUpdatePath(stepId, token),
          payload,
          false,
        ),
      "Step saved.",
      `Failed to save step ${stepId}`,
    );

  updateEnrollment = async (
    token: string,
    input: EnrollmentValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = enrollmentSchema.parse(input);
      return await this.updateStep(token, 0, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save enrollment details",
      );
    }
  };

  updatePersonalDetails = async (
    token: string,
    input: PersonalDetailsValues & { student_email?: string | null },
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const { student_email, ...rest } = input;
      const body = personalDetailsSchema.parse(rest);
      const normalizedStudentEmail = student_email
        ? studentEmailSchema.parse({ student_email }).student_email
        : body.email;

      return await this.updateStep(token, 1, {
        ...body,
        email: normalizedStudentEmail,
        student_email: normalizedStudentEmail,
        street_address: "",
      });
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save personal details",
      );
    }
  };

  updateEmergencyContact = async (
    token: string,
    input: EmergencyContactValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = emergencyContactSchema.parse(input);
      return await this.updateStep(token, 2, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save emergency contact",
      );
    }
  };

  updateHealthCover = async (
    token: string,
    input: HealthCoverValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = healthCoverSchema.parse(input);
      return await this.updateStep(token, 3, {
        ...body,
        has_oshc: body.arrange_OSHC ? "true" : "false",
      });
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save health cover details",
      );
    }
  };

  updateLanguageCultural = async (
    token: string,
    input: LanguageCulturalValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = languageCulturalSchema.parse(input);
      return await this.updateStep(token, 4, {
        ...body,
        visa_expiry: body.visa_expiry
          ? new Date(body.visa_expiry).toISOString()
          : null,
      });
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save language & cultural information",
      );
    }
  };

  updateDisabilitySupport = async (
    token: string,
    input: DisabilitySupportValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = disabilitySupportSchema.parse(input);
      return await this.updateStep(token, 5, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save disability details",
      );
    }
  };

  updateSchoolingHistory = async (
    token: string,
    input: SchoolingHistoryValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = schoolingHistorySchema.parse(input);
      return await this.updateStep(token, 6, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save schooling history",
      );
    }
  };

  updatePreviousQualifications = async (
    token: string,
    input: PreviousQualificationsValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = previousQualificationsSchema.parse(input);
      return await this.updateStep(token, 7, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save qualification details",
      );
    }
  };

  updateEmploymentHistory = async (
    token: string,
    input: EmploymentHistoryValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = employmentHistorySchema.parse(input);
      return await this.updateStep(token, 8, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save employment history",
      );
    }
  };

  updateUsi = async (
    token: string,
    input: UsiValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = usiSchema.parse(input);
      return await this.updateStep(token, 9, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save USI details",
      );
    }
  };

  updateAdditionalServices = async (
    token: string,
    input: AdditionalServicesValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = additionalServicesSchema.parse(input);
      return await this.updateStep(token, 10, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save additional services",
      );
    }
  };

  updateSurvey = async (
    token: string,
    input: SurveyValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> => {
    try {
      const body = surveySchema.parse(input);
      return await this.updateStep(token, 11, body);
    } catch (error) {
      return handleApiError<StepUpdateResponse>(error, "Failed to save survey");
    }
  };

  submitApplication = async (
    token: string,
    confirmAccuracy: boolean = true,
  ): Promise<ServiceResponse<PublicStudentApplicationSubmitResponse>> =>
    resolveServiceCall<PublicStudentApplicationSubmitResponse>(
      () =>
        this.post<PublicStudentApplicationSubmitResponse>(
          this.buildTokenPath("submit", token),
          { confirm_accuracy: confirmAccuracy },
          false,
        ),
      "Application submitted successfully.",
      "Failed to submit application",
    );
}

const publicStudentApplicationService = new PublicStudentApplicationService();

export default publicStudentApplicationService;
