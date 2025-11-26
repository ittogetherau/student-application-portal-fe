import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { Application } from "@/constants/types";
import type { ServiceResponse } from "@/types/service";
import {
  ApplicationCreateValues,
  applicationCreateSchema,
  PersonalDetailsValues,
  personalDetailsSchema,
  EmergencyContactValues,
  emergencyContactSchema,
  HealthCoverValues,
  healthCoverSchema,
  LanguageCulturalValues,
  languageCulturalSchema,
  DisabilitySupportValues,
  disabilitySupportSchema,
  SchoolingHistoryValues,
  schoolingHistorySchema,
  PreviousQualificationsValues,
  previousQualificationsSchema,
  EmploymentHistoryValues,
  employmentHistorySchema,
  UsiValues,
  usiSchema,
  AdditionalServicesValues,
  additionalServicesSchema,
  SurveyValues,
  surveySchema,
} from "@/validation/application.validation";

export interface StepUpdateResponse {
  applicationId?: string;
  step?: number;
  completed?: boolean;
  updatedAt?: string;
  message?: string;
}

export interface ApplicationDetail extends Application {
  formData?: Partial<ApplicationCreateValues>;
}

export interface ApplicationListParams {
  stage?: string;
  studentId?: string;
  agentId?: string;
  assignedStaffId?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

class ApplicationService extends ApiService {
  private readonly basePath = "/api/v1/applications";

  private buildQuery(params: ApplicationListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.stage) searchParams.set("stage", params.stage);
    if (params.studentId) searchParams.set("student_id", params.studentId);
    if (params.agentId) searchParams.set("agent_id", params.agentId);
    if (params.assignedStaffId) {
      searchParams.set("assigned_staff_id", params.assignedStaffId);
    }
    if (params.fromDate) searchParams.set("from_date", params.fromDate);
    if (params.toDate) searchParams.set("to_date", params.toDate);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (typeof params.offset === "number") {
      searchParams.set("offset", params.offset.toString());
    }
    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  private stepPath(applicationId: string, step: number, slug: string) {
    if (!applicationId) throw new Error("Application id is required");
    return `${this.basePath}/${applicationId}/steps/${step}/${slug}`;
  }

  async listApplications(
    params: ApplicationListParams = {},
  ): Promise<ServiceResponse<Application[]>> {
    try {
      const path = `${this.basePath}${this.buildQuery(params)}`;
      const data = await this.get<Application[]>(path, true);
      return {
        success: true,
        message: "Applications fetched successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch applications", []);
    }
  }

  async createApplication(
    input: ApplicationCreateValues,
  ): Promise<ServiceResponse<ApplicationDetail>> {
    try {
      const body = applicationCreateSchema.parse(input);
      const data = await this.post<ApplicationDetail>(
        this.basePath,
        body,
        true,
      );
      return {
        success: true,
        message: "Application created successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to create application",
      );
    }
  }

  async getApplication(
    applicationId: string,
  ): Promise<ServiceResponse<ApplicationDetail>> {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<ApplicationDetail>(
        `${this.basePath}/${applicationId}`,
        true,
      );
      return {
        success: true,
        message: "Application fetched successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to fetch application",
      );
    }
  }

  async updateApplication(
    applicationId: string,
    payload: Record<string, unknown>,
  ): Promise<ServiceResponse<ApplicationDetail>> {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<ApplicationDetail>(
        `${this.basePath}/${applicationId}`,
        payload,
        true,
      );
      return {
        success: true,
        message: "Application updated successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to update application",
      );
    }
  }

  async updatePersonalDetails(
    applicationId: string,
    input: PersonalDetailsValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = personalDetailsSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 1, "personal-details"),
        body,
        true,
      );
      return {
        success: true,
        message: "Personal details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save personal details",
      );
    }
  }

  async updateEmergencyContact(
    applicationId: string,
    input: EmergencyContactValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = emergencyContactSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 2, "emergency-contact"),
        body,
        true,
      );
      return {
        success: true,
        message: "Emergency contact saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save emergency contact",
      );
    }
  }

  async updateHealthCover(
    applicationId: string,
    input: HealthCoverValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = healthCoverSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 3, "health-cover"),
        body,
        true,
      );
      return {
        success: true,
        message: "Health cover saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save health cover details",
      );
    }
  }

  async updateLanguageCultural(
    applicationId: string,
    input: LanguageCulturalValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = languageCulturalSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 4, "language-cultural"),
        body,
        true,
      );
      return {
        success: true,
        message: "Language & cultural information saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save language & cultural information",
      );
    }
  }

  async updateDisabilitySupport(
    applicationId: string,
    input: DisabilitySupportValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = disabilitySupportSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 5, "disability-support"),
        body,
        true,
      );
      return {
        success: true,
        message: "Disability details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save disability details",
      );
    }
  }

  async updateSchoolingHistory(
    applicationId: string,
    input: SchoolingHistoryValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = schoolingHistorySchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 6, "schooling-history"),
        body,
        true,
      );
      return {
        success: true,
        message: "Schooling history saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save schooling history",
      );
    }
  }

  async updatePreviousQualifications(
    applicationId: string,
    input: PreviousQualificationsValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = previousQualificationsSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 7, "qualifications"),
        body,
        true,
      );
      return {
        success: true,
        message: "Qualification details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save qualification details",
      );
    }
  }

  async updateEmploymentHistory(
    applicationId: string,
    input: EmploymentHistoryValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = employmentHistorySchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 8, "employment-history"),
        body,
        true,
      );
      return {
        success: true,
        message: "Employment history saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save employment history",
      );
    }
  }

  async updateUsi(
    applicationId: string,
    input: UsiValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = usiSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 9, "usi"),
        body,
        true,
      );
      return {
        success: true,
        message: "USI details saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save USI details",
      );
    }
  }

  async updateAdditionalServices(
    applicationId: string,
    input: AdditionalServicesValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = additionalServicesSchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 10, "additional-services"),
        body,
        true,
      );
      return {
        success: true,
        message: "Additional services saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save additional services",
      );
    }
  }

  async updateSurvey(
    applicationId: string,
    input: SurveyValues,
  ): Promise<ServiceResponse<StepUpdateResponse>> {
    try {
      const body = surveySchema.parse(input);
      const data = await this.patch<StepUpdateResponse>(
        this.stepPath(applicationId, 11, "survey"),
        body,
        true,
      );
      return {
        success: true,
        message: "Survey saved.",
        data,
      };
    } catch (error) {
      return handleApiError<StepUpdateResponse>(
        error,
        "Failed to save survey",
      );
    }
  }

  async submitApplication(
    applicationId: string,
    payload: Record<string, unknown> = {},
  ): Promise<ServiceResponse<ApplicationDetail>> {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<ApplicationDetail>(
        `${this.basePath}/${applicationId}/submit`,
        payload,
        true,
      );
      return {
        success: true,
        message: "Application submitted successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to submit application",
      );
    }
  }

  async assignApplication(
    applicationId: string,
    payload: Record<string, unknown>,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<unknown>(
        `${this.basePath}/${applicationId}/assign`,
        payload,
        true,
      );
      return {
        success: true,
        message: "Application assigned successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to assign application",
      );
    }
  }

  async changeStage(
    applicationId: string,
    payload: Record<string, unknown>,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<unknown>(
        `${this.basePath}/${applicationId}/change-stage`,
        payload,
        true,
      );
      return {
        success: true,
        message: "Application stage updated.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to update application stage",
      );
    }
  }

  async getDocumentStatus(
    applicationId: string,
  ): Promise<ServiceResponse<unknown>> {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<unknown>(
        this.stepPath(applicationId, 12, "documents"),
        true,
      );
      return {
        success: true,
        message: "Document status fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch document status");
    }
  }
}

const applicationService = new ApplicationService();
export default applicationService;
