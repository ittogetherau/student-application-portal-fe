"use client";

import { usePublicStudentApplicationStore } from "@/features/student-application/store/use-public-student-application.store";
import documentService, {
  type ApplicationDocumentListItem,
  type DocumentType,
} from "@/service/document.service";
import publicStudentApplicationService from "@/service/public-student-application.service";
import type { ServiceResponse } from "@/shared/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Types
type UploadDocumentParams = {
  application_id?: string;
  document_type_id: string;
  file: File;
  process_ocr?: boolean;
  upload_mode?: "replace" | "new";
  document_name?: string;
};

type UploadDocumentResponse = {
  process_ocr?: boolean;
  preview_url?: string;
};

// type VerifyDocumentParams = Record<string, unknown>;

// type ListApplicationDocumentsParams = Record<string, QueryValue>;

// Query hooks
export const useDocumentTypesQuery = (options?: {
  initialOnly?: boolean;
}) => {
  const initialOnly = options?.initialOnly ?? false;
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const token = usePublicStudentApplicationStore((state) => state.token);

  return useQuery<ServiceResponse<DocumentType[]>, Error>({
    queryKey: ["document-types", isPublicMode ? `public:${token}` : "private", initialOnly],
    queryFn: async () => {
      const response =
        isPublicMode && token
          ? await publicStudentApplicationService.getDocumentTypes(
              token,
              initialOnly,
            )
          : await documentService.getDocumentTypes(initialOnly);

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

export const useApplicationDocumentsQuery = (
  applicationId: string | null,
  options?: { merged?: boolean },
) => {
  const merged = options?.merged;
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const token = usePublicStudentApplicationStore((state) => state.token);

  return useQuery<ServiceResponse<ApplicationDocumentListItem[]>, Error>({
    queryKey: [
      "application-documents",
      isPublicMode ? `public:${token}` : applicationId,
      { merged },
    ],
    queryFn: async () => {
      const response =
        isPublicMode && token
          ? await publicStudentApplicationService.getDocuments(token)
          : applicationId
            ? await documentService.listApplicationDocuments(applicationId, merged)
            : null;

      if (!response) throw new Error("Application ID is required");
      if (!response.success) {
        throw new Error(
          response.message || "Failed to fetch application documents",
        );
      }

      const normalizedData = Array.isArray(response.data)
        ? response.data
        : response.data &&
            typeof response.data === "object" &&
            Array.isArray(
              (response.data as { documents?: ApplicationDocumentListItem[] })
                .documents,
            )
          ? ((response.data as { documents?: ApplicationDocumentListItem[] })
              .documents ?? [])
          : response.data &&
              typeof response.data === "object" &&
              Array.isArray(
                (response.data as { items?: ApplicationDocumentListItem[] })
                  .items,
              )
          ? ((response.data as { items?: ApplicationDocumentListItem[] })
              .items ?? [])
          : [];

      return {
        ...response,
        data: normalizedData,
      };
    },
    enabled: !!applicationId || !!(isPublicMode && token),
    staleTime: 1000 * 10, // 10 seconds - documents can change frequently
  });
};

// Mutation hooks
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const isPublicMode = usePublicStudentApplicationStore(
    (state) => state.enabled && !!state.token,
  );
  const token = usePublicStudentApplicationStore((state) => state.token);

  return useMutation<
    ServiceResponse<UploadDocumentResponse>,
    Error,
    UploadDocumentParams
  >({
    mutationFn: async ({
      application_id,
      document_type_id,
      file,
      process_ocr,
      upload_mode,
      document_name,
    }) => {
      const response =
        isPublicMode && token
          ? await publicStudentApplicationService.uploadDocument(
              token,
              document_type_id,
              file,
              process_ocr,
              upload_mode,
              document_name,
            )
          : application_id
            ? await documentService.uploadDocument(
                application_id,
                document_type_id,
                file,
                process_ocr,
                upload_mode,
              )
            : null;

      if (!response) {
        throw new Error("Application ID is required");
      }
      if (!response.success) {
        throw new Error(response.message || "Failed to upload document");
      }
      return response as ServiceResponse<UploadDocumentResponse>;
    },
    onSuccess: async (response, variables) => {
      // Invalidate related queries
      if (isPublicMode && token) {
        queryClient.invalidateQueries({
          queryKey: ["application-documents", `public:${token}`],
        });
        return;
      }

      if (!variables.application_id) return;
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
    ServiceResponse<unknown>,
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
export const useDocuments = (_applicationId: string | null) => {
  void _applicationId;
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  return {
    // Mutations
    uploadDocument,
    deleteDocument,
  };
};

