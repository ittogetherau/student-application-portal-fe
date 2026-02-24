"use client";

import gsMeetingsService, {
  type GeneratePublicLinkRequest,
  type GsMeetingResponse,
  type GsRecordingMetadata,
  type PublicLinkResponse,
  type ScheduleGsMeetingRequest,
  type UpdateRecordingRequest,
} from "@/service/gs-meetings.service";
import type { ServiceResponse } from "@/shared/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGsMeetingsForApplicationQuery = (applicationId?: string) => {
  return useQuery<ServiceResponse<GsMeetingResponse[]>, Error>({
    queryKey: ["gs-meetings", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Application id is required");
      const response =
        await gsMeetingsService.listMeetingsForApplication(applicationId);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    enabled: !!applicationId,
  });
};

export const useScheduleGsMeetingMutation = (applicationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<GsMeetingResponse>,
    Error,
    ScheduleGsMeetingRequest
  >({
    mutationKey: ["gs-meeting-schedule", applicationId],
    mutationFn: async (payload) => {
      const response = await gsMeetingsService.scheduleMeeting(payload);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gs-meetings", applicationId],
      });
    },
  });
};

export const useGsMeetingQuery = (meetingId?: string) => {
  return useQuery<ServiceResponse<GsMeetingResponse>, Error>({
    queryKey: ["gs-meeting", meetingId],
    queryFn: async () => {
      if (!meetingId) throw new Error("Meeting id is required");
      const response = await gsMeetingsService.getMeeting(meetingId);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    enabled: !!meetingId,
  });
};

export const useUpdateGsMeetingRecordingMutation = (
  meetingId?: string,
  applicationId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<GsMeetingResponse>,
    Error,
    UpdateRecordingRequest
  >({
    mutationKey: ["gs-meeting-update-recording", meetingId],
    mutationFn: async (payload) => {
      if (!meetingId) throw new Error("Meeting id is required");
      const response = await gsMeetingsService.updateRecording(
        meetingId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gs-meeting", meetingId] });
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: ["gs-meetings", applicationId],
        });
      }
    },
  });
};

export const useFetchGsMeetingRecordingsMutation = (
  meetingId?: string,
  applicationId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation<ServiceResponse<GsRecordingMetadata[]>, Error, void>({
    mutationKey: ["gs-meeting-fetch-recordings", meetingId],
    mutationFn: async () => {
      if (!meetingId) throw new Error("Meeting id is required");
      const response = await gsMeetingsService.fetchRecordings(meetingId);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gs-meeting", meetingId] });
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: ["gs-meetings", applicationId],
        });
      }
    },
  });
};

export const useStreamGsMeetingRecordingMutation = (meetingId?: string) => {
  return useMutation<ServiceResponse<Blob>, Error, string>({
    mutationKey: ["gs-meeting-stream-recording", meetingId],
    mutationFn: async (recordingId) => {
      if (!meetingId) throw new Error("Meeting id is required");
      if (!recordingId) throw new Error("Recording id is required");
      const response = await gsMeetingsService.streamRecording(
        meetingId,
        recordingId,
      );
      if (!response.success) throw new Error(response.message);
      return response;
    },
  });
};

export const useGenerateGsMeetingPublicLinkMutation = (
  meetingId?: string,
  applicationId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<PublicLinkResponse>,
    Error,
    GeneratePublicLinkRequest | undefined
  >({
    mutationKey: ["gs-meeting-generate-public-link", meetingId],
    mutationFn: async (payload) => {
      if (!meetingId) throw new Error("Meeting id is required");
      const response = await gsMeetingsService.generatePublicLink(
        meetingId,
        payload ?? {},
      );
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gs-meeting", meetingId] });
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: ["gs-meetings", applicationId],
        });
      }
    },
  });
};
