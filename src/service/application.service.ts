import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/utils/handle-api-error";
import type { Application } from "@/constants/types";
import type { ServiceResponse } from "@/types/service";
import {
  ApplicationCreateValues,
  applicationCreateSchema,
} from "@/validation/application.validation";

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
  private readonly basePath = "applications";

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
  ): Promise<ServiceResponse<ApplicationDetail>> => {
    try {
      const body = applicationCreateSchema.parse(input);
      console.log("[API] createApplication request", body);
      const data = await this.post<ApplicationDetail>(
        this.basePath,
        body,
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
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to create application"
      );
    }
  };

  getApplication = async (
    applicationId: string
  ): Promise<ServiceResponse<ApplicationDetail>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<ApplicationDetail>(
        `${this.basePath}/${applicationId}`,
        true
      );
      return {
        success: true,
        message: "Application fetched successfully.",
        data,
      };
    } catch (error) {
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to fetch application"
      );
    }
  };

  updateApplication = async (
    applicationId: string,
    payload: Record<string, unknown>
  ): Promise<ServiceResponse<ApplicationDetail>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.patch<ApplicationDetail>(
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
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to update application"
      );
    }
  };

  submitApplication = async (
    applicationId: string,
    payload: Record<string, unknown> = {}
  ): Promise<ServiceResponse<ApplicationDetail>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<ApplicationDetail>(
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
      return handleApiError<ApplicationDetail>(
        error,
        "Failed to submit application"
      );
    }
  };

  assignApplication = async (
    applicationId: string,
    payload: Record<string, unknown>
  ): Promise<ServiceResponse<unknown>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.post<unknown>(
        `${this.basePath}/${applicationId}/assign`,
        payload,
        true
      );
      return {
        success: true,
        message: "Application assigned successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to assign application");
    }
  };

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
}

const applicationService = new ApplicationService();
export default applicationService;
