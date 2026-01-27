import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { GSDocument } from "@/constants/types";
import type { ServiceResponse } from "@/types/service";


export interface GsAssessmentSummary {
  application_id: string;
  current_stage?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  stage_1_completed_at?: string | null;
  stage_2_completed_at?: string | null;
  stage_3_completed_at?: string | null;
  stage_4_completed_at?: string | null;
  stage_5_completed_at?: string | null;
  [key: string]: unknown;
}

export interface GsAssessmentDetail extends GsAssessmentSummary {
  documents?: GSDocument[];
  declarations?: Record<string, unknown>;
  staff_assessment?: StaffAssessmentResponse;
  [key: string]: unknown;
}

export interface StageUpdateRequest {
  stage_to_complete: number;
  notes?: string;
  [key: string]: unknown;
}

export interface StageUpdateResponse {
  application_id: string;
  current_stage?: number;
  next_stage?: number;
  message?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface GsDocumentsResponse {
  application_id: string;
  documents: GSDocument[];
  missing_documents?: string[];
  [key: string]: unknown;
}

export interface GsDocumentStatusUpdateRequest {
  status: "approved" | "rejected";
  notes?: string;
  [key: string]: unknown;
}

export interface GsDocumentAutoCompleteRequest {
  document_ids?: string[];
  [key: string]: unknown;
}

export interface GsDeclarationResponse {
  id: string;
  status?: "draft" | "submitted" | "approved" | "rejected" | string;
  data?: Record<string, unknown>;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  filled_by?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface GsDeclarationSaveRequest {
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GsDeclarationSubmitRequest {
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GsDeclarationReviewRequest {
  status: "draft" | "approved" | "rejected" | string;
  review_notes?: string;
  [key: string]: unknown;
}

export type GsDeclarationActor = "student" | "agent";

export interface GsResendDeclarationRequest {
  rotate_token?: boolean;
}

export interface GsResendDeclarationResponse {
  public_url: string;
  token: string;
  expires_at: string;
  sent_to: string;
  send_count: number;
}

export interface GsStageTwoStatus {
  application_id: string;
  ready_for_staff_review?: boolean;
  missing_declarations?: string[];
  [key: string]: unknown;
}

export interface StaffAssessmentResponse {
  id: string;
  status?: "draft" | "submitted" | "completed" | string;
  applicant_details?: Record<string, unknown>;
  stage1_questions?: Record<string, unknown>[];
  stage2_questions?: Record<string, unknown>[];
  additional_comments?: string;
  recommendation?: "approved" | "rejected" | string;
  conditions?: string;
  risk_level?: "low" | "medium" | "high" | string;
  final_decision?: "approved" | "rejected" | string;
  decision_rationale?: string;
  decision_made_by?: string;
  decision_made_at?: string;
  completed_by?: string;
  completed_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface StaffAssessmentSaveRequest {
  applicant_details?: Record<string, unknown>;
  stage1_questions?: Record<string, unknown>[];
  stage2_questions?: Record<string, unknown>[];
  additional_comments?: string;
  recommendation?: "approved" | "rejected" | string;
  conditions?: string;
  risk_level?: "low" | "medium" | "high" | string;
  [key: string]: unknown;
}

export interface StaffAssessmentSubmitRequest extends StaffAssessmentSaveRequest {}

export interface StaffAssessmentDecisionRequest {
  final_decision: "approved" | "rejected" | string;
  decision_rationale?: string;
  [key: string]: unknown;
}

export interface GsAssessmentListItem {
  application_id: string;
  reference_number?: string;
  current_stage?: number;
  assigned_staff_id?: string;
  submitted_at?: string;
  [key: string]: unknown;
}

export interface GsAssessmentListParams {
  skip?: number;
  limit?: number;
}

export interface GsProgressSummary {
  application_id: string;
  stage?: number;
  steps?: Record<string, boolean | string>;
  [key: string]: unknown;
}

class GsAssessmentService extends ApiService {
  private readonly basePath = "gs-assessment";

  private getTokenAuthConfig(token: string) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  initializeAssessment = async (
    applicationId: string
  ): Promise<ServiceResponse<GsAssessmentSummary>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const query = new URLSearchParams({ application_id: applicationId }).toString();
      const path = `${this.basePath}/initialize?${query}`;
      const data = await this.post<GsAssessmentSummary>(path, {}, true);
      return {
        success: true,
        message: "GS assessment initialized.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to initialize GS assessment");
    }
  };

  getAssessment = async (
    applicationId: string
  ): Promise<ServiceResponse<GsAssessmentDetail>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<GsAssessmentDetail>(
        `${this.basePath}/${applicationId}`,
        true
      );
      return {
        success: true,
        message: "GS assessment fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch GS assessment details"
      );
    }
  };

  updateStage = async (
    applicationId: string,
    payload: StageUpdateRequest
  ): Promise<ServiceResponse<StageUpdateResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<StageUpdateResponse>(
        `${this.basePath}/${applicationId}/stage`,
        payload,
        true
      );
      return {
        success: true,
        message: "GS stage advanced.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to advance GS stage");
    }
  };

  listDocuments = async (
    applicationId: string
  ): Promise<ServiceResponse<GsDocumentsResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<GsDocumentsResponse>(
        `${this.basePath}/${applicationId}/documents`,
        true
      );
      return {
        success: true,
        message: "GS documents listed.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch GS documents"
      );
    }
  };

  uploadDocument = async (
    applicationId: string,
    documentNumber: number,
    formData: FormData
  ): Promise<ServiceResponse<GsDocumentsResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<GsDocumentsResponse>(
        `${this.basePath}/${applicationId}/documents/${documentNumber}/upload`,
        formData,
        true
      );
      return {
        success: true,
        message: "GS document uploaded.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to upload GS document"
      );
    }
  };

  updateDocumentStatus = async (
    applicationId: string,
    documentNumber: number,
    payload: GsDocumentStatusUpdateRequest
  ): Promise<ServiceResponse<GsAssessmentDetail>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<GsAssessmentDetail>(
        `${this.basePath}/${applicationId}/documents/${documentNumber}/status`,
        payload,
        true
      );
      return {
        success: true,
        message: "GS document status updated.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to update GS document status"
      );
    }
  };

  autoCompleteDocuments = async (
    applicationId: string,
    payload: GsDocumentAutoCompleteRequest = {}
  ): Promise<ServiceResponse<GsDocumentsResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<GsDocumentsResponse>(
        `${this.basePath}/${applicationId}/documents/auto-complete`,
        payload,
        true
      );
      return {
        success: true,
        message: "GS documents auto-completed.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to auto-complete GS documents"
      );
    }
  };

  deleteDocumentFile = async (
    applicationId: string,
    documentNumber: number,
    fileId: string
  ): Promise<ServiceResponse<GsDocumentsResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    if (!fileId) throw new Error("File id is required");

    try {
      const data = await this.delete<GsDocumentsResponse>(
        `${this.basePath}/${applicationId}/documents/${documentNumber}/files/${fileId}`,
        true
      );
      return {
        success: true,
        message: "GS document file deleted.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete GS document file");
    }
  };

  getStudentDeclaration = async (
    applicationId: string
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/student-declaration`,
        true
      );
      return {
        success: true,
        message: "Student declaration fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch student declaration"
      );
    }
  };

  saveStudentDeclaration = async (
    applicationId: string,
    payload: GsDeclarationSaveRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/student-declaration/save`,
        payload,
        true
      );
      return {
        success: true,
        message: "Student declaration saved.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to save student declaration"
      );
    }
  };

  submitStudentDeclaration = async (
    applicationId: string,
    payload: GsDeclarationSubmitRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/student-declaration/submit`,
        payload,
        true
      );
      return {
        success: true,
        message: "Student declaration submitted.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to submit student declaration"
      );
    }
  };

  resendStudentDeclaration = async (
    applicationId: string,
    payload: GsResendDeclarationRequest = { rotate_token: false }
  ): Promise<ServiceResponse<GsResendDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<GsResendDeclarationResponse>(
        `${this.basePath}/${applicationId}/student-declaration/resend`,
        payload,
        true
      );
      return {
        success: true,
        message: "Student declaration form resent.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to resend student declaration"
      );
    }
  };

  getAgentDeclaration = async (
    applicationId: string
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/agent-declaration`,
        true
      );
      return {
        success: true,
        message: "Agent declaration fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch agent declaration"
      );
    }
  };

  saveAgentDeclaration = async (
    applicationId: string,
    payload: GsDeclarationSaveRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/agent-declaration/save`,
        payload,
        true
      );
      return {
        success: true,
        message: "Agent declaration saved.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to save agent declaration"
      );
    }
  };

  submitAgentDeclaration = async (
    applicationId: string,
    payload: GsDeclarationSubmitRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/agent-declaration/submit`,
        payload,
        true
      );
      return {
        success: true,
        message: "Agent declaration submitted.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to submit agent declaration"
      );
    }
  };

  getStageTwoStatus = async (
    applicationId: string
  ): Promise<ServiceResponse<GsStageTwoStatus>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<GsStageTwoStatus>(
        `${this.basePath}/${applicationId}/stage-2/status`,
        true
      );
      return {
        success: true,
        message: "GS stage 2 status fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch stage 2 status"
      );
    }
  };

  reviewDeclaration = async (
    applicationId: string,
    actor: GsDeclarationActor,
    payload: GsDeclarationReviewRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    if (!actor) throw new Error("Declaration actor is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/declarations/${actor}/review`,
        payload,
        true
      );
      return {
        success: true,
        message: "Declaration reviewed.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to review declaration"
      );
    }
  };

  getStaffAssessment = async (
    applicationId: string
  ): Promise<ServiceResponse<StaffAssessmentResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<StaffAssessmentResponse>(
        `${this.basePath}/${applicationId}/staff-assessment`,
        true
      );
      return {
        success: true,
        message: "Staff assessment fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch staff assessment"
      );
    }
  };

  saveStaffAssessment = async (
    applicationId: string,
    payload: StaffAssessmentSaveRequest
  ): Promise<ServiceResponse<StaffAssessmentResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<StaffAssessmentResponse>(
        `${this.basePath}/${applicationId}/staff-assessment/save`,
        payload,
        true
      );
      return {
        success: true,
        message: "Staff assessment saved.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to save staff assessment"
      );
    }
  };

  submitStaffAssessment = async (
    applicationId: string,
    payload: StaffAssessmentSubmitRequest
  ): Promise<ServiceResponse<StaffAssessmentResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<StaffAssessmentResponse>(
        `${this.basePath}/${applicationId}/staff-assessment/submit`,
        payload,
        true
      );
      return {
        success: true,
        message: "Staff assessment submitted.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to submit staff assessment"
      );
    }
  };

  finalizeDecision = async (
    applicationId: string,
    payload: StaffAssessmentDecisionRequest
  ): Promise<ServiceResponse<GsAssessmentDetail>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<GsAssessmentDetail>(
        `${this.basePath}/${applicationId}/staff-assessment/decision`,
        payload,
        true
      );
      return {
        success: true,
        message: "GS decision finalized.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to finalize GS decision"
      );
    }
  };

  listAssessments = async (
    params: GsAssessmentListParams = {}
  ): Promise<ServiceResponse<GsAssessmentListItem[]>> => {
    try {
      const searchParams = new URLSearchParams();
      if (typeof params.skip === "number") searchParams.set("skip", params.skip.toString());
      if (typeof params.limit === "number") searchParams.set("limit", params.limit.toString());
      const query = searchParams.toString();
      const path = `${this.basePath}/list${query ? `?${query}` : ""}`;
      const data = await this.get<GsAssessmentListItem[]>(path, true);
      return {
        success: true,
        message: "GS assessments listed.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to list GS assessments",
        []
      );
    }
  };

  getProgress = async (
    applicationId: string
  ): Promise<ServiceResponse<GsProgressSummary>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<GsProgressSummary>(
        `${this.basePath}/${applicationId}/progress`,
        true
      );
      return {
        success: true,
        message: "GS progress fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch GS progress"
      );
    }
  };

  saveStudentDeclarationWithToken = async (
    applicationId: string,
    token: string,
    payload: GsDeclarationSaveRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    if (!token) throw new Error("Token is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/student-declaration/save`,
        payload,
        false,
        this.getTokenAuthConfig(token)
      );
      return {
        success: true,
        message: "Student declaration saved.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to save student declaration");
    }
  };

  submitStudentDeclarationWithToken = async (
    applicationId: string,
    token: string,
    payload: GsDeclarationSubmitRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!applicationId) throw new Error("Application id is required");
    if (!token) throw new Error("Token is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `${this.basePath}/${applicationId}/student-declaration/submit`,
        payload,
        false,
        this.getTokenAuthConfig(token)
      );
      return {
        success: true,
        message: "Student declaration submitted.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to submit student declaration");
    }
  };

  // Public GS Declarations (token in path – for student via email link)
  // GET /api/v1/public/gs-declarations/{token}
  getStudentDeclarationByToken = async (
    token: string
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!token) throw new Error("Token is required");
    try {
      const data = await this.get<GsDeclarationResponse>(
        `public/gs-declarations/${encodeURIComponent(token)}`,
        false
      );
      return {
        success: true,
        message: "Student declaration fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch student declaration"
      );
    }
  };

  // POST /api/v1/public/gs-declarations/{token}/save
  saveStudentDeclarationByToken = async (
    token: string,
    payload: GsDeclarationSaveRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!token) throw new Error("Token is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `public/gs-declarations/${encodeURIComponent(token)}/save`,
        payload,
        false
      );
      return {
        success: true,
        message: "Student declaration saved.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to save student declaration");
    }
  };

  // POST /api/v1/public/gs-declarations/{token}/submit
  submitStudentDeclarationByToken = async (
    token: string,
    payload: GsDeclarationSubmitRequest
  ): Promise<ServiceResponse<GsDeclarationResponse>> => {
    if (!token) throw new Error("Token is required");
    try {
      const data = await this.post<GsDeclarationResponse>(
        `public/gs-declarations/${encodeURIComponent(token)}/submit`,
        payload,
        false
      );
      return {
        success: true,
        message: "Student declaration submitted.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to submit student declaration");
    }
  };
}

const gsAssessmentService = new GsAssessmentService();
export default gsAssessmentService;
