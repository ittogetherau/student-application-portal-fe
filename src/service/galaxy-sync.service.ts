import { ApiService } from "@/service/base.service";
import { buildQueryString } from "@/service/service-helpers";
import { handleApiError } from "@/utils/handle-api-error";
import type { ServiceResponse } from "@/types/service";

export interface GalaxySyncResponse {
  application_id?: string;
  current_stage?: string;
  message?: string;
  synced_at?: string;
  [key: string]: unknown;
}

type GalaxySyncStatusResponse = string;

class GalaxySyncService extends ApiService {
  private readonly basePath = "staff/applications";

  private requireApplicationId(applicationId: string) {
    if (!applicationId) throw new Error("Application id is required");
  }

  syncApplication = async (
    applicationId: string,
    background: boolean = true
  ): Promise<ServiceResponse<GalaxySyncResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const query = buildQueryString({ background });
      const data = await this.post<GalaxySyncResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync${query}`,
        {},
        true
      );
      return {
        success: true,
        message: "Galaxy sync completed successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync application with Galaxy");
    }
  };

  syncPersonalDetails = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/personal-details`,
        {},
        true
      );
      return {
        success: true,
        message: "Personal details synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to sync personal details with Galaxy"
      );
    }
  };

  syncDocuments = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/documents`,
        {},
        true
      );
      return {
        success: true,
        message: "Documents synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync documents with Galaxy");
    }
  };

  syncEmergencyContact = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/emergency-contact`,
        {},
        true
      );
      return {
        success: true,
        message: "Emergency contact synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to sync emergency contact with Galaxy"
      );
    }
  };

  syncLanguage = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/language`,
        {},
        true
      );
      return {
        success: true,
        message: "Language and cultural data synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to sync language and cultural data with Galaxy"
      );
    }
  };

  syncDisability = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/disability`,
        {},
        true
      );
      return {
        success: true,
        message: "Disability support synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to sync disability support with Galaxy"
      );
    }
  };

  syncSchooling = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/schooling`,
        {},
        true
      );
      return {
        success: true,
        message: "Schooling synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync schooling with Galaxy");
    }
  };

  syncQualifications = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/qualifications`,
        {},
        true
      );
      return {
        success: true,
        message: "Qualifications synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync qualifications with Galaxy");
    }
  };

  syncEmployment = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/employment`,
        {},
        true
      );
      return {
        success: true,
        message: "Employment synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync employment with Galaxy");
    }
  };

  syncUsi = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/usi`,
        {},
        true
      );
      return {
        success: true,
        message: "USI synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync USI with Galaxy");
    }
  };

  syncDeclaration = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/declaration`,
        {},
        true
      );
      return {
        success: true,
        message: "Declaration synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync declaration with Galaxy");
    }
  };

  syncOshc = async (
    applicationId: string
  ): Promise<ServiceResponse<GalaxySyncStatusResponse>> => {
    this.requireApplicationId(applicationId);
    try {
      const data = await this.post<GalaxySyncStatusResponse>(
        `${this.basePath}/${applicationId}/galaxy-sync/oshc`,
        {},
        true
      );
      return {
        success: true,
        message: "Health cover synced successfully.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to sync health cover with Galaxy");
    }
  };
}

const galaxySyncService = new GalaxySyncService();
export default galaxySyncService;
