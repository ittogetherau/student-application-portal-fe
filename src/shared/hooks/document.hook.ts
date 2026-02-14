"use client";

import documentService, { type DocumentType } from "@/service/document.service";
import type { ServiceResponse } from "@/shared/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Types
type UploadDocumentParams = {
  application_id: string;
  document_type_id: string;
  file: File;
  process_ocr?: boolean;
  upload_mode?: "replace" | "new";
};

// type VerifyDocumentParams = Record<string, unknown>;

// type ListApplicationDocumentsParams = Record<string, QueryValue>;

// Query hooks
export const useDocumentTypesQuery = () => {
  return useQuery<ServiceResponse<DocumentType[]>, Error>({
    queryKey: ["document-types"],
    queryFn: async () => {
      const response = await documentService.getDocumentTypes();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch document types");
      }
      return response;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - document types rarely change
  });
};

export const useDocumentQuery = (
  documentId: string | null,
  includeVersions: boolean = false,
) => {
  return useQuery({
    queryKey: ["document", documentId, includeVersions],
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID is required");
      const response = await documentService.getDocument(
        documentId,
        includeVersions,
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch document");
      }
      return response;
    },
    enabled: !!documentId,
  });
};

export const useApplicationDocumentsQuery = (applicationId: string | null) => {
  return useQuery({
    queryKey: ["application-documents", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      const response =
        await documentService.listApplicationDocuments(applicationId);
      if (!response.success) {
        throw new Error(
          response.message || "Failed to fetch application documents",
        );
      }
      return response;
    },
    enabled: !!applicationId,
    staleTime: 1000 * 10, // 10 seconds - documents can change frequently
  });
};

// Mutation hooks
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<{ process_ocr: boolean }>,
    Error,
    UploadDocumentParams
  >({
    mutationFn: async ({
      application_id,
      document_type_id,
      file,
      process_ocr,
      upload_mode,
    }) => {
      const response = await documentService.uploadDocument(
        application_id,
        document_type_id,
        file,
        process_ocr,
        upload_mode,
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to upload document");
      }
      return response;
    },
    onSuccess: async (response, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["application-documents", variables.application_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["document-stats", variables.application_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["autofill-suggestions", variables.application_id],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload document");
    },
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<any>,
    Error,
    {
      documentId: string;
      status: "verified" | "rejected";
      notes?: string;
      applicationId?: string;
    }
  >({
    mutationFn: async ({ documentId, status, notes }) => {
      const response = await documentService.verifyDocument(documentId, {
        status,
        notes,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to verify document");
      }
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["document", variables.documentId],
      });
      if (variables.applicationId) {
        queryClient.invalidateQueries({
          queryKey: ["application-documents", variables.applicationId],
        });
      }
      toast.success("Document status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify document");
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceResponse<unknown>,
    Error,
    { documentId: string; applicationId?: string }
  >({
    mutationFn: async ({ documentId }) => {
      const response = await documentService.deleteDocument(documentId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete document");
      }
      return response;
    },
    onSuccess: async (_response, variables) => {
      if (variables.applicationId) {
        queryClient.invalidateQueries({
          queryKey: ["application-documents", variables.applicationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["document-stats", variables.applicationId],
        });
        queryClient.invalidateQueries({
          queryKey: ["autofill-suggestions", variables.applicationId],
        });
      }
      // toast.success("Document deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });
};

// Main hook that exports all document operations
export const useDocuments = (applicationId: string | null) => {
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  return {
    // Mutations
    uploadDocument,
    deleteDocument,
  };
};

