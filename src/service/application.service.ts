/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { Application } from "@/constants/types";
import type { ServiceResponse } from "@/types/service";
import {
  ApplicationCreateValues,
  applicationCreateSchema,
} from "@/validation/application.validation";
import type {
  AdditionalServicesValues,
  DisabilitySupportValues,
  EmergencyContactValues,
  EmploymentHistoryValues,
  HealthCoverValues,
  LanguageCulturalValues,
  PersonalDetailsValues,
  PreviousQualificationsValues,
  SchoolingHistoryValues,
  SurveyValues,
} from "@/validation/application.validation";

export interface ApplicationDetailResponse {
  id: string;
  student_profile_id: string | null;
  agent_profile_id: string | null;
  course_offering_id: string | null;
  assigned_staff_id: string | null;
  current_stage: string;
  submitted_at: string | null;
  decision_at?: string | null;
  usi: string | null;
  usi_verified: boolean;
  usi_verified_at: string | null;
  personal_details?: PersonalDetailsValues | null;
  emergency_contacts?: EmergencyContactValues[] | null;
  health_cover_policy?: HealthCoverValues | null;
  language_cultural_data?: LanguageCulturalValues | null;
  disability_support?: DisabilitySupportValues | null;
  schooling_history?: SchoolingHistoryValues[] | null;
  qualifications?: PreviousQualificationsValues[] | null;
  employment_history?: EmploymentHistoryValues[] | null;
  additional_services?: AdditionalServicesValues | null;
  survey_responses?: SurveyValues[] | null;
  enrollment_data?: unknown | null;
  gs_assessment?: unknown | null;
  signature_data?: unknown | null;
  form_metadata?: {
    version?: string;
    ip_address?: string | null;
    user_agent?: string | null;
    submission_duration_seconds?: number | null;
    last_edited_section?: string | null;
    completed_sections?: string[];
    last_saved_at?: string | null;
    auto_save_count?: number;
  } | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ApplicationListParams {
  stage?: string;
  studentId?: string;
  agentId?: string;
  assignedStaffId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApplicationResponse {
  application: {
    id: string;
    [key: string]: unknown;
  };
}

export interface TimelineResponse {
  id: string;
  entry_type: string;
  message: string;
  actor_email: string;
  actor_role: "student" | "staff" | "admin" | string;
  actor_name: string;
  created_at: string;
  event_payload: Record<string, unknown>;
}

class ApplicationService extends ApiService {
  private readonly basePath = "applications";

  private buildQuery(params: ApplicationListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.stage) searchParams.set("stage", params.stage);
    if (params.studentId) searchParams.set("student_id", params.studentId);
    if (params.agentId) searchParams.set("agent_id", params.agentId);
    if (params.assignedStaffId) {
      searchParams.set("assigned_staff_id", params.assignedStaffId);
    }
    if (params.search) searchParams.set("search", params.search);
    if (params.fromDate) searchParams.set("from_date", params.fromDate);
    if (params.toDate) searchParams.set("to_date", params.toDate);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (typeof params.offset === "number") {
      searchParams.set("offset", params.offset.toString());
    }
    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  listApplications = async (
    params: ApplicationListParams = {}
  ): Promise<ServiceResponse<Application[]>> => {
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
  };

  createApplication = async (
    input: ApplicationCreateValues
  ): Promise<ServiceResponse<ApplicationResponse>> => {
    try {
      const body = applicationCreateSchema.parse(input);
      console.log("[API] createApplication request", body);
      const data = await this.post<ApplicationResponse>(
        this.basePath,
        {},
        true
      );
      console.log("[API] createApplication success", data);
      return {
        success: true,
        message: "Application created successfully.",
        data,
      };
    } catch (error) {
      console.error("[API] createApplication error", error);
      return handleApiError<ApplicationResponse>(
        error,
        "Failed to create application"
      );
    }
  };

  getApplication = async (
    applicationId: string
  ): Promise<ServiceResponse<ApplicationDetailResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<ApplicationDetailResponse>(
        `${this.basePath}/${applicationId}`,
        true
      );
      return {
        success: true,
        message: "Application fetched successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetailResponse>(
        error,
        "Failed to fetch application"
      );
    }
  };

  getApplicationTimeline = async (
    applicationId: string
  ): Promise<ServiceResponse<TimelineResponse[]>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<TimelineResponse[]>(
        `${this.basePath}/${applicationId}/timeline`,
        true
      );
      return {
        success: true,
        message: "Application fetched successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<TimelineResponse[]>(
        error,
        "Failed to fetch application"
      );
    }
  };

  updateApplication = async (
    applicationId: string,
    payload: Record<string, unknown>
  ): Promise<ServiceResponse<ApplicationDetailResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<ApplicationDetailResponse>(
        `${this.basePath}/${applicationId}`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application updated successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetailResponse>(
        error,
        "Failed to update application"
      );
    }
  };

  submitApplication = async (
    applicationId: string
  ): Promise<ServiceResponse<ApplicationDetailResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const payload = {
        application_id: applicationId,
        confirm_accuracy: true,
      };
      const data = await this.post<ApplicationDetailResponse>(
        `${this.basePath}/${applicationId}/submit`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application submitted successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetailResponse>(
        error,
        "Failed to submit application"
      );
    }
  };

  // Staff and Admin - Assign application to staff member
  assignApplication = async (
    applicationId: string,
    staffId: string | null
  ): Promise<ServiceResponse<ApplicationDetailResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const payload = staffId ? { staff_id: staffId } : { staff_id: null };
      const data = await this.post<ApplicationDetailResponse>(
        `/applications/${applicationId}/assign`,
        payload,
        true
      );
      return {
        success: true,
        message: staffId
          ? "Application assigned successfully."
          : "Application unassigned successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetailResponse>(
        error,
        "Failed to assign application"
      );
    }
  };

  //staff and admin
  changeStage = async (
    applicationId: string,
    payload: Record<string, unknown>
  ): Promise<ServiceResponse<unknown>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<unknown>(
        `${this.basePath}/${applicationId}/change-stage`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application stage updated.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update application stage");
    }
  };

  // Staff - Approve application and generate offer
  approveApplication = async (
    applicationId: string,
    payload: {
      offer_details: Record<string, unknown>;
      notes?: string;
    }
  ): Promise<
    ServiceResponse<{
      application_id: string;
      current_stage: string;
      message: string;
      updated_at: string;
    }>
  > => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<{
        application_id: string;
        current_stage: string;
        message: string;
        updated_at: string;
      }>(`staff/applications/${applicationId}/approve`, payload, true);
      return {
        success: true,
        message: "Application approved successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to approve application");
    }
  };

  // Staff - Approve application and generate offer
  startApplicationReview = async (
    applicationId: string,
    payload: any
  ): Promise<ServiceResponse<any>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<any>(
        `staff/applications/${applicationId}/start-review`,
        payload,
        true
      );

      return {
        success: true,
        message: "Application approved successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to approve application");
    }
  };

  // Staff - Reject application
  rejectApplication = async (
    applicationId: string,
    payload: {
      rejection_reason: string;
      is_appealable: boolean;
    }
  ): Promise<
    ServiceResponse<{
      application_id: string;
      current_stage: string;
      message: string;
      updated_at: string;
    }>
  > => {
    if (!applicationId) throw new Error("Application id is required");

    // Validate rejection reason length
    if (
      payload.rejection_reason.length < 10 ||
      payload.rejection_reason.length > 1000
    ) {
      return {
        success: false,
        message: "Rejection reason must be between 10 and 1000 characters",
        data: null,
      };
    }

    try {
      const data = await this.post<{
        application_id: string;
        current_stage: string;
        message: string;
        updated_at: string;
      }>(`staff/applications/${applicationId}/reject`, payload, true);
      return {
        success: true,
        message: "Application rejected successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to reject application");
    }
  };

  // Staff - Generate offer letter PDF
  generateOfferLetter = async (
    applicationId: string,
    payload: {
      course_start_date: string;
      tuition_fee: number;
      material_fee: number;
      conditions: string[];
      template?: string;
    }
  ): Promise<
    ServiceResponse<{
      pdf_url: string;
      application_id: string;
      generated_at: string;
      message: string;
    }>
  > => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<{
        pdf_url: string;
        application_id: string;
        generated_at: string;
        message: string;
      }>(
        `staff/applications/${applicationId}/generate-offer-letter`,
        payload,
        true
      );
      return {
        success: true,
        message: "Offer letter generated successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to generate offer letter");
    }
  };
}

const applicationService = new ApplicationService();
export default applicationService;
