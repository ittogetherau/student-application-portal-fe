"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "react-hot-toast";

import {
  deriveAllStepsProgress,
  transformGSAssessmentData,
  type GSAssessmentData,
  type GSStepProgress,
} from "@/constants/gs-assessment";
import gsAssessmentService, {
  type GsAssessmentDetail,
  type GsDeclarationActor,
  type GsDeclarationResponse,
  type GsDeclarationReviewRequest,
  type GsDeclarationSaveRequest,
  type GsDeclarationSubmitRequest,
  type GsDocumentsResponse,
  type GsProgressSummary,
  type GsResendDeclarationRequest,
  type GsResendDeclarationResponse,
  type GsStageTwoStatus,
  type StaffAssessmentDecisionRequest,
  type StaffAssessmentResponse,
  type StaffAssessmentSaveRequest,
  type StaffAssessmentSubmitRequest,
} from "@/service/gs-assessment.service";
import type { ServiceResponse } from "@/shared/types/service";

// ============================================================================
// Query Keys
// ============================================================================

export const gsAssessmentKeys = {
  all: ["gs-assessment"] as const,
  detail: (applicationId: string) =>
    [...gsAssessmentKeys.all, "detail", applicationId] as const,
  documents: (applicationId: string) =>
    [...gsAssessmentKeys.all, "documents", applicationId] as const,
  progress: (applicationId: string) =>
    [...gsAssessmentKeys.all, "progress", applicationId] as const,
  studentDeclaration: (applicationId: string) =>
    [...gsAssessmentKeys.all, "student-declaration", applicationId] as const,
  studentDeclarationByToken: (token: string) =>
    [...gsAssessmentKeys.all, "student-declaration-by-token", token] as const,
  agentDeclaration: (applicationId: string) =>
    [...gsAssessmentKeys.all, "agent-declaration", applicationId] as const,
  stageTwoStatus: (applicationId: string) =>
    [...gsAssessmentKeys.all, "stage-2-status", applicationId] as const,
  staffAssessment: (applicationId: string) =>
    [...gsAssessmentKeys.all, "staff-assessment", applicationId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Query to fetch GS Assessment details for an application
 */
export function useGSAssessmentQuery(applicationId: string | null) {
  return useQuery<ServiceResponse<GsAssessmentDetail>, Error>({
    queryKey: gsAssessmentKeys.detail(applicationId ?? ""),
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.getAssessment(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
}

/**
 * Query to fetch GS documents for an application
 */
export function useGSDocumentsQuery(applicationId: string | null) {
  return useQuery<ServiceResponse<GsDocumentsResponse>, Error>({
    queryKey: gsAssessmentKeys.documents(applicationId ?? ""),
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.listDocuments(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
}

/**
 * Query to fetch GS progress summary
 */
export function useGSProgressQuery(applicationId: string | null) {
  return useQuery<ServiceResponse<GsProgressSummary>, Error>({
    queryKey: gsAssessmentKeys.progress(applicationId ?? ""),
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.getProgress(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
}

/**
 * Query to fetch student declaration (authenticated – use applicationId).
 */
export function useGSStudentDeclarationQuery(applicationId: string | null) {
  return useQuery<ServiceResponse<GsDeclarationResponse>, Error>({
    queryKey: gsAssessmentKeys.studentDeclaration(applicationId ?? ""),
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response =
        await gsAssessmentService.getStudentDeclaration(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
}

/**
 * Query to fetch student declaration by public token (public link – GET /api/v1/public/gs-declarations/{token}).
 */
export function useGSStudentDeclarationByTokenQuery(
  token: string | null | undefined,
) {
  return useQuery<ServiceResponse<GsDeclarationResponse>, Error>({
    queryKey: gsAssessmentKeys.studentDeclarationByToken(token ?? ""),
    queryFn: async () => {
      if (!token) throw new Error("Token is required");
      const response =
        await gsAssessmentService.getStudentDeclarationByToken(token);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!token,
  });
}

/**
 * Query to fetch agent declaration
 */
export function useGSAgentDeclarationQuery(applicationId: string | null) {
  return useQuery<ServiceResponse<GsDeclarationResponse>, Error>({
    queryKey: gsAssessmentKeys.agentDeclaration(applicationId ?? ""),
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response =
        await gsAssessmentService.getAgentDeclaration(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
}

/**
 * Query to fetch stage 2 (declarations) status
 */
export function useGSStageTwoStatusQuery(applicationId: string | null) {
  return useQuery<ServiceResponse<GsStageTwoStatus>, Error>({
    queryKey: gsAssessmentKeys.stageTwoStatus(applicationId ?? ""),
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response =
        await gsAssessmentService.getStageTwoStatus(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
}

/**
 * Query to fetch staff assessment
 */
export function useGSStaffAssessmentQuery(applicationId: string | null) {
  return useQuery<ServiceResponse<StaffAssessmentResponse>, Error>({
    queryKey: gsAssessmentKeys.staffAssessment(applicationId ?? ""),
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response =
        await gsAssessmentService.getStaffAssessment(applicationId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!applicationId,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Mutation to upload a GS document
 */
export function useGSDocumentUploadMutation(applicationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    GsDocumentsResponse,
    Error,
    { documentNumber: number; formData: FormData }
  >({
    mutationKey: ["gs-document-upload", applicationId],
    mutationFn: async ({ documentNumber, formData }) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.uploadDocument(
        applicationId,
        documentNumber,
        formData,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.documents(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to upload GS document:", error);
      toast.error(error.message || "Failed to upload document");
    },
  });
}

/**
 * Mutation to delete a specific uploaded file for a GS document
 */
export function useGSDocumentFileDeleteMutation(applicationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    GsDocumentsResponse,
    Error,
    { documentNumber: number; fileId: string }
  >({
    mutationKey: ["gs-document-file-delete", applicationId],
    mutationFn: async ({ documentNumber, fileId }) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.deleteDocumentFile(
        applicationId,
        documentNumber,
        fileId,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.documents(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to delete GS document file:", error);
      toast.error(error.message || "Failed to delete file");
    },
  });
}

/**
 * Mutation to update document status (approve/reject)
 */
export function useGSDocumentStatusMutation(applicationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    GsAssessmentDetail,
    Error,
    { documentNumber: number; status: "approved" | "rejected"; notes?: string }
  >({
    mutationKey: ["gs-document-status", applicationId],
    mutationFn: async ({ documentNumber, status, notes }) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.updateDocumentStatus(
        applicationId,
        documentNumber,
        { status, notes },
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.documents(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to update document status:", error);
      toast.error(error.message || "Failed to update document status");
    },
  });
}

/**
 * Mutation to auto-complete all documents
 */
export function useGSDocumentAutoCompleteMutation(
  applicationId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<GsDocumentsResponse, Error, void>({
    mutationKey: ["gs-document-auto-complete", applicationId],
    mutationFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response =
        await gsAssessmentService.autoCompleteDocuments(applicationId);
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.documents(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to auto-complete documents:", error);
      toast.error(error.message || "Failed to auto-complete documents");
    },
  });
}

/**
 * Mutation to complete a GS stage
 * @param stageToComplete - Stage number (1-5) to mark as complete
 *   1=Documents, 2=Declarations, 3=Schedule, 4=Interview, 5=Assessment
 */
export function useGSStageCompleteMutation(applicationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { stageToComplete: number }>({
    mutationKey: ["gs-stage-complete", applicationId],
    mutationFn: async ({ stageToComplete }) => {
      if (!applicationId) throw new Error("Application ID is required");
      // API expects 1-indexed stage number (1=Documents, 2=Declarations, etc.)
      const response = await gsAssessmentService.updateStage(applicationId, {
        stage_to_complete: stageToComplete,
      });
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.progress(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.documents(applicationId),
        });
        // Also invalidate application query as stage may have changed
        queryClient.invalidateQueries({
          queryKey: ["application-get", applicationId],
        });
      }
    },
    onError: (error) => {
      console.error("Failed to complete GS stage:", error);
      toast.error(error.message || "Failed to complete stage");
    },
  });
}

type StudentDeclarationSavePayload = GsDeclarationSaveRequest & {
  files?: Record<string, File>;
};

/**
 * Mutation to save student declaration.
 * When payload.files has any entries, sends multipart FormData with "data" (JSON) and each file part.
 */
export function useGSStudentDeclarationSaveMutation(
  applicationId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<
    GsDeclarationResponse,
    Error,
    StudentDeclarationSavePayload
  >({
    mutationKey: ["gs-student-declaration-save", applicationId],
    mutationFn: async (arg) => {
      if (!applicationId) throw new Error("Application ID is required");
      const { files, ...payload } = arg;
      // if (files && Object.keys(files).length > 0) {
      //   const formData = new FormData();
      //   formData.append("data", JSON.stringify(payload));
      //   for (const [key, file] of Object.entries(files)) {
      //     formData.append(key, file);
      //   }

      // }
      const response = await gsAssessmentService.saveStudentDeclaration(
        applicationId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.studentDeclaration(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to save student declaration:", error);
      toast.error(error.message || "Failed to save student declaration");
    },
  });
}

type StudentDeclarationSubmitPayload = GsDeclarationSubmitRequest & {
  files?: Record<string, File>;
};

/**
 * Mutation to submit student declaration.
 * When payload.files has any entries, sends multipart FormData with "data" (JSON) and each file part.
 */
export function useGSStudentDeclarationSubmitMutation(
  applicationId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<
    GsDeclarationResponse,
    Error,
    StudentDeclarationSubmitPayload
  >({
    mutationKey: ["gs-student-declaration-submit", applicationId],
    mutationFn: async (arg) => {
      if (!applicationId) throw new Error("Application ID is required");
      const { files, ...payload } = arg;
      // if (files && Object.keys(files).length > 0) {
      //   const formData = new FormData();
      //   formData.append("data", JSON.stringify(payload));
      //   for (const [key, file] of Object.entries(files)) {
      //     formData.append(key, file);
      //   }

      // }
      const response = await gsAssessmentService.submitStudentDeclaration(
        applicationId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.studentDeclaration(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.stageTwoStatus(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to submit student declaration:", error);
      toast.error(error.message || "Failed to submit student declaration");
    },
  });
}

/**
 * Mutation to resend student declaration form
 */
export function useGSStudentDeclarationResendMutation(
  applicationId: string | null,
) {
  return useMutation<
    GsResendDeclarationResponse,
    Error,
    GsResendDeclarationRequest | undefined
  >({
    mutationKey: ["gs-student-declaration-resend", applicationId],
    mutationFn: async (payload = { rotate_token: false }) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.resendStudentDeclaration(
        applicationId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Declaration form sent to ${data.sent_to}`);
    },
    onError: (error) => {
      console.error("Failed to resend student declaration:", error);
      toast.error(error.message || "Failed to resend student declaration");
    },
  });
}

/**
 * Mutation to save agent declaration
 */
export function useGSAgentDeclarationSaveMutation(
  applicationId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<GsDeclarationResponse, Error, GsDeclarationSaveRequest>({
    mutationKey: ["gs-agent-declaration-save", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.saveAgentDeclaration(
        applicationId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.agentDeclaration(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.progress(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: ["application-get", applicationId],
        });
      }
    },
    onError: (error) => {
      console.error("Failed to save agent declaration:", error);
      toast.error(error.message || "Failed to save agent declaration");
    },
  });
}

/**
 * Mutation to submit agent declaration
 */
export function useGSAgentDeclarationSubmitMutation(
  applicationId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<GsDeclarationResponse, Error, GsDeclarationSubmitRequest>({
    mutationKey: ["gs-agent-declaration-submit", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.submitAgentDeclaration(
        applicationId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.agentDeclaration(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.stageTwoStatus(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.progress(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: ["application-get", applicationId],
        });
      }
      toast.success("Agent declaration submitted successfully");
    },
    onError: (error) => {
      console.error("Failed to submit agent declaration:", error);
      toast.error(error.message || "Failed to submit agent declaration");
    },
  });
}

/**
 * Mutation to review a declaration (staff only)
 */
export function useGSDeclarationReviewMutation(applicationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    GsDeclarationResponse,
    Error,
    { actor: GsDeclarationActor; payload: GsDeclarationReviewRequest }
  >({
    mutationKey: ["gs-declaration-review", applicationId],
    mutationFn: async ({ actor, payload }) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.reviewDeclaration(
        applicationId,
        actor,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: (_data, variables) => {
      if (applicationId) {
        if (variables.actor === "student") {
          queryClient.invalidateQueries({
            queryKey: gsAssessmentKeys.studentDeclaration(applicationId),
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: gsAssessmentKeys.agentDeclaration(applicationId),
          });
        }
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.stageTwoStatus(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to review declaration:", error);
      toast.error(error.message || "Failed to review declaration");
    },
  });
}

/**
 * Mutation to save staff assessment
 */
export function useGSStaffAssessmentSaveMutation(applicationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    StaffAssessmentResponse,
    Error,
    StaffAssessmentSaveRequest
  >({
    mutationKey: ["gs-staff-assessment-save", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.saveStaffAssessment(
        applicationId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.staffAssessment(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to save staff assessment:", error);
      toast.error(error.message || "Failed to save staff assessment");
    },
  });
}

/**
 * Mutation to submit staff assessment
 */
export function useGSStaffAssessmentSubmitMutation(
  applicationId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation<
    StaffAssessmentResponse,
    Error,
    StaffAssessmentSubmitRequest
  >({
    mutationKey: ["gs-staff-assessment-submit", applicationId],
    mutationFn: async (payload) => {
      if (!applicationId) throw new Error("Application ID is required");
      const response = await gsAssessmentService.submitStaffAssessment(
        applicationId,
        payload,
      );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      if (applicationId) {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.staffAssessment(applicationId),
        });
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.detail(applicationId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to submit staff assessment:", error);
      toast.error(error.message || "Failed to submit staff assessment");
    },
  });
}

/**
 * Mutation to finalize GS decision
 */
export function useGSFinalizeDecisionMutation(applicationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<GsAssessmentDetail, Error, StaffAssessmentDecisionRequest>(
    {
      mutationKey: ["gs-finalize-decision", applicationId],
      mutationFn: async (payload) => {
        if (!applicationId) throw new Error("Application ID is required");
        const response = await gsAssessmentService.finalizeDecision(
          applicationId,
          payload,
        );
        if (!response.success) throw new Error(response.message);
        if (!response.data) throw new Error("Response data is missing");
        return response.data;
      },
      onSuccess: () => {
        if (applicationId) {
          queryClient.invalidateQueries({
            queryKey: gsAssessmentKeys.detail(applicationId),
          });
          queryClient.invalidateQueries({
            queryKey: gsAssessmentKeys.staffAssessment(applicationId),
          });
          // Also invalidate application as overall stage may change
          queryClient.invalidateQueries({
            queryKey: ["application-get", applicationId],
          });
        }
      },
      onError: (error) => {
        console.error("Failed to finalize GS decision:", error);
        toast.error(error.message || "Failed to finalize decision");
      },
    },
  );
}

// ============================================================================
// Token-Based Mutations (for public tracking pages)
// ============================================================================

interface TokenDeclarationMutationParams {
  applicationId: string;
  token: string;
  payload: GsDeclarationSaveRequest | GsDeclarationSubmitRequest;
}

/**
 * Mutation to save student declaration with token auth (for public tracking page)
 */
export function useGSStudentDeclarationSaveWithTokenMutation() {
  return useMutation<
    GsDeclarationResponse,
    Error,
    TokenDeclarationMutationParams
  >({
    mutationFn: async ({ applicationId, token, payload }) => {
      const response =
        await gsAssessmentService.saveStudentDeclarationWithToken(
          applicationId,
          token,
          payload as GsDeclarationSaveRequest,
        );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onError: (error) => {
      console.error("Failed to save student declaration:", error);
      toast.error(error.message || "Failed to save declaration");
    },
  });
}

/**
 * Mutation to submit student declaration with token auth (for public tracking page)
 */
export function useGSStudentDeclarationSubmitWithTokenMutation() {
  return useMutation<
    GsDeclarationResponse,
    Error,
    TokenDeclarationMutationParams
  >({
    mutationFn: async ({ applicationId, token, payload }) => {
      const response =
        await gsAssessmentService.submitStudentDeclarationWithToken(
          applicationId,
          token,
          payload as GsDeclarationSubmitRequest,
        );
      if (!response.success) throw new Error(response.message);
      if (!response.data) throw new Error("Response data is missing");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Declaration submitted successfully");
    },
    onError: (error) => {
      console.error("Failed to submit student declaration:", error);
      toast.error(error.message || "Failed to submit declaration");
    },
  });
}

// ============================================================================
// Public GS Declarations by token (GET/POST /api/v1/public/gs-declarations/{token})
// ============================================================================

interface PublicByTokenMutationParams {
  token: string;
  payload: GsDeclarationSaveRequest | GsDeclarationSubmitRequest;
  files?: Record<string, File>;
}

/**
 * Save student declaration via public link (POST public/gs-declarations/{token}/save).
 * When files has any entries, sends multipart FormData with "data" (JSON) and each file part.
 */
export function useGSStudentDeclarationSaveByTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation<GsDeclarationResponse, Error, PublicByTokenMutationParams>(
    {
      mutationFn: async ({ token, payload, files }) => {
        // if (files && Object.keys(files).length > 0) {
        //   const formData = new FormData();
        //   formData.append("data", JSON.stringify(payload));
        //   for (const [key, file] of Object.entries(files)) {
        //     formData.append(key, file);
        //   }

        // }
        const response =
          await gsAssessmentService.saveStudentDeclarationByToken(
            token,
            payload as GsDeclarationSaveRequest,
          );
        if (!response.success) throw new Error(response.message);
        if (!response.data) throw new Error("Response data is missing");
        return response.data;
      },
      onSuccess: (_, { token }) => {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.studentDeclarationByToken(token),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save declaration");
      },
    },
  );
}

/**
 * Submit student declaration via public link (POST public/gs-declarations/{token}/submit).
 * When files has any entries, sends multipart FormData with "data" (JSON) and each file part.
 */
export function useGSStudentDeclarationSubmitByTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation<GsDeclarationResponse, Error, PublicByTokenMutationParams>(
    {
      mutationFn: async ({ token, payload, files }) => {
        // if (files && Object.keys(files).length > 0) {
        //   const formData = new FormData();
        //   formData.append("data", JSON.stringify(payload));
        //   for (const [key, file] of Object.entries(files)) {
        //     formData.append(key, file);
        //   }

        // }
        const response =
          await gsAssessmentService.submitStudentDeclarationByToken(
            token,
            payload as GsDeclarationSubmitRequest,
          );
        if (!response.success) throw new Error(response.message);
        if (!response.data) throw new Error("Response data is missing");
        return response.data;
      },
      onSuccess: (_, { token }) => {
        queryClient.invalidateQueries({
          queryKey: gsAssessmentKeys.studentDeclarationByToken(token),
        });
        toast.success("Declaration submitted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to submit declaration");
      },
    },
  );
}

// ============================================================================
// Derived Hooks
// ============================================================================

/**
 * Hook to derive GS assessment progress from API data.
 *
 * This hook takes the raw gs_assessment object from the application response
 * and derives step progress for UI display.
 *
 * @param data - Transformed GSAssessmentData or raw API response
 * @returns Object with stepsProgress array
 */
export function useGSAssessmentProgress(
  data: GSAssessmentData | null | undefined,
): { stepsProgress: GSStepProgress[] } {
  const stepsProgress = useMemo(() => {
    return deriveAllStepsProgress(data);
  }, [data]);

  return { stepsProgress };
}

/**
 * Convenience function to transform raw API gs_assessment data.
 * Re-exported for use in components.
 */
export { transformGSAssessmentData };
