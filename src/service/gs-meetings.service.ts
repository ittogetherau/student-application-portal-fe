import { ApiService } from "@/service/base.service";
import { handleApiError } from "@/shared/utils/handle-api-error";
import type { ServiceResponse } from "@/shared/types/service";

// --- Meeting-related contracts derived from the GS meeting OpenAPI paths ---

export interface GsMeetingParticipant {
  email: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
}

export interface GsMeetingResponse {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  timezone?: string;
  status?: string;
  meeting_link?: string;
  recording_url?: string;
  notes?: string;
  participants?: GsMeetingParticipant[];
  [key: string]: unknown;
}

export interface ScheduleGsMeetingRequest {
  application_id: string;
  scheduled_start: string;
  scheduled_end: string;
  timezone?: string;
  participants?: GsMeetingParticipant[];
  notes?: string;
  [key: string]: unknown;
}

export interface UpdateRecordingRequest {
  recording_url?: string;
  [key: string]: unknown;
}

export interface UpdateNotesRequest {
  notes: string;
  [key: string]: unknown;
}

export interface GeneratePublicLinkRequest {
  expires_in_days?: number;
  [key: string]: unknown;
}

export interface PublicLinkResponse {
  url: string;
  expires_at: string;
  token?: string;
  [key: string]: unknown;
}

export interface GsRecordingMetadata {
  id: string;
  file_url: string;
  created_at?: string;
  duration_seconds?: number;
  [key: string]: unknown;
}

class GsMeetingsService extends ApiService {
  private readonly basePath = "gs-meetings";

  scheduleMeeting = async (
    payload: ScheduleGsMeetingRequest,
  ): Promise<ServiceResponse<GsMeetingResponse>> => {
    try {
      const data = await this.post<GsMeetingResponse>(
        this.basePath,
        payload,
        true,
      );
      return {
        success: true,
        message: "GS meeting scheduled.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to schedule GS meeting");
    }
  };

  getMeeting = async (
    meetingId: string,
  ): Promise<ServiceResponse<GsMeetingResponse>> => {
    if (!meetingId) throw new Error("Meeting id is required");
    try {
      const data = await this.get<GsMeetingResponse>(
        `${this.basePath}/${meetingId}`,
        true,
      );
      return {
        success: true,
        message: "GS meeting fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch GS meeting");
    }
  };

  cancelMeeting = async (meetingId: string): Promise<ServiceResponse<null>> => {
    if (!meetingId) throw new Error("Meeting id is required");
    try {
      await this.delete<void>(`${this.basePath}/${meetingId}`, true);
      return {
        success: true,
        message: "GS meeting cancelled.",
        data: null,
      };
    } catch (error) {
      return handleApiError(error, "Failed to cancel GS meeting");
    }
  };

  listMeetingsForApplication = async (
    applicationId: string,
  ): Promise<ServiceResponse<GsMeetingResponse[]>> => {
    if (!applicationId) throw new Error("Application id is required");
    try {
      const data = await this.get<GsMeetingResponse[]>(
        `${this.basePath}/application/${applicationId}`,
        true,
      );
      return {
        success: true,
        message: "GS meetings listed.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to list GS meetings", []);
    }
  };

  updateRecording = async (
    meetingId: string,
    payload: UpdateRecordingRequest,
  ): Promise<ServiceResponse<GsMeetingResponse>> => {
    if (!meetingId) throw new Error("Meeting id is required");
    try {
      const data = await this.patch<GsMeetingResponse>(
        `${this.basePath}/${meetingId}/recording`,
        payload,
        true,
      );
      return {
        success: true,
        message: "Meeting recording updated.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update meeting recording");
    }
  };

  fetchRecordings = async (
    meetingId: string,
  ): Promise<ServiceResponse<GsRecordingMetadata[]>> => {
    if (!meetingId) throw new Error("Meeting id is required");
    try {
      const data = await this.get<GsRecordingMetadata[]>(
        `${this.basePath}/${meetingId}/recordings/fetch`,
        true,
      );
      return {
        success: true,
        message: "Meeting recordings fetched.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch meeting recordings", []);
    }
  };

  streamRecording = async (
    meetingId: string,
    recordingId: string,
  ): Promise<ServiceResponse<Blob>> => {
    if (!meetingId || !recordingId) {
      throw new Error("Meeting id and recording id are required");
    }
    try {
      const data = await this.get<Blob>(
        `${this.basePath}/${meetingId}/recordings/${recordingId}/stream`,
        true,
        { responseType: "blob" },
      );
      return {
        success: true,
        message: "Meeting recording streamed.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to stream meeting recording");
    }
  };

  updateMeetingNotes = async (
    meetingId: string,
    payload: UpdateNotesRequest,
  ): Promise<ServiceResponse<GsMeetingResponse>> => {
    if (!meetingId) throw new Error("Meeting id is required");
    try {
      const data = await this.patch<GsMeetingResponse>(
        `${this.basePath}/${meetingId}/notes`,
        payload,
        true,
      );
      return {
        success: true,
        message: "Meeting notes updated.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update meeting notes");
    }
  };

  generatePublicLink = async (
    meetingId: string,
    payload: GeneratePublicLinkRequest = {},
  ): Promise<ServiceResponse<PublicLinkResponse>> => {
    if (!meetingId) throw new Error("Meeting id is required");
    try {
      const data = await this.post<PublicLinkResponse>(
        `${this.basePath}/${meetingId}/public-link`,
        payload,
        true,
      );
      return {
        success: true,
        message: "Public recording link generated.",
        data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to generate public link");
    }
  };

  revokePublicLink = async (
    meetingId: string,
  ): Promise<ServiceResponse<null>> => {
    if (!meetingId) throw new Error("Meeting id is required");
    try {
      await this.delete<void>(
        `${this.basePath}/${meetingId}/public-link`,
        true,
      );
      return {
        success: true,
        message: "Public recording link revoked.",
        data: null,
      };
    } catch (error) {
      return handleApiError(error, "Failed to revoke public link");
    }
  };
}

const gsMeetingsService = new GsMeetingsService();
export default gsMeetingsService;
