"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import {
  useApplicationDocumentsQuery,
  useDocumentTypesQuery,
  useDocuments,
} from "@/hooks/document.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import {
  ALLOWED_FILE_EXTENSIONS,
  DROPZONE_ACCEPT,
  IGNORED_DOCUMENT_TYPES,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_SIZE_BYTES,
  getDropzoneHelperText,
  getFileKey,
  humanFileSize,
  isAllowedFileType,
} from "@/lib/document-file-helpers";
import { cn } from "@/lib/utils";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { CheckCircle2, Eye, Loader2, Trash2, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ApplicationStepHeader from "../_components/application-step-header";

// Types
type FileUploadState = {
  key: string;
  file: File;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
};

type UploadedFileMetadata = {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  previewUrl?: string;
};

type DocumentState = {
  documentTypeId: string;
  files: FileUploadState[];
  uploadedFiles: UploadedFileMetadata[];
  uploaded: boolean;
};

type DocumentsFormData = {
  documents: Record<
    string,
    {
      documentTypeId: string;
      uploadedFiles: UploadedFileMetadata[];
      uploaded: boolean;
    }
  >;
};

type DocumentType = {
  id: string;
  name: string;
  code?: string;
  is_mandatory: boolean;
  display_order: number;
  accepts_ocr?: boolean;
};

type ApiDocument = {
  id?: string;
  document_type_id?: string;
  document_type_code?: string;
  document_type?: { id?: string; code?: string };
  document_type_name?: string;
  file_size_bytes: number;
  uploaded_at?: string;
  view_url?: string;
  download_url?: string;
  latest_version_id?: string;
};

const STEP_ID = 12;

// Helper Functions
const createInitialState = (
  documentTypes: DocumentType[],
): Record<string, DocumentState> => {
  const state: Record<string, DocumentState> = {};
  documentTypes.forEach((docType) => {
    state[docType.id] = {
      documentTypeId: docType.id,
      files: [],
      uploadedFiles: [],
      uploaded: false,
    };
  });
  return state;
};

const hasUploadedFiles = (state: DocumentState | undefined): boolean => {
  if (!state) return false;
  return (
    state.files?.some((f) => f.uploaded) ||
    (state.uploadedFiles?.length ?? 0) > 0
  );
};

const normalizeDocTypeId = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const getDocumentTypeId = (doc: any) =>
  normalizeDocTypeId(doc?.document_type_id ?? doc?.document_type?.id);

const getDocumentTypeCode = (doc: ApiDocument) =>
  doc.document_type_code ?? doc.document_type?.code ?? "";

const isAllMandatoryUploaded = (
  documentStates: Record<string, DocumentState>,
  documentTypes: DocumentType[],
  uploadedDocuments: ApiDocument[] = [],
): boolean => {
  if (!documentTypes || documentTypes.length === 0) return true;
  const mandatoryDocs = documentTypes.filter((doc) => doc.is_mandatory);
  if (mandatoryDocs.length === 0) return true;
  return mandatoryDocs.every((doc) => {
    const isLocalUploaded = hasUploadedFiles(documentStates[doc.id]);
    const isApiUploaded = uploadedDocuments.some(
      (apiDoc: any) => getDocumentTypeId(apiDoc) === doc.id,
    );
    return isLocalUploaded || isApiUploaded;
  });
};

const convertToFormData = (
  documentStates: Record<string, DocumentState>,
): DocumentsFormData => {
  const documents: DocumentsFormData["documents"] = {};
  Object.keys(documentStates).forEach((key) => {
    const state = documentStates[key];
    const newUploaded = state.files
      .filter((f) => f.uploaded && !f.error)
      .map((f) => ({
        fileName: f.file.name,
        fileSize: f.file.size,
        uploadedAt: new Date().toISOString(),
        previewUrl: state.uploadedFiles.find(
          (uf) => uf.fileName === f.file.name && uf.fileSize === f.file.size,
        )?.previewUrl,
      }));

    const existingUploaded = state.uploadedFiles || [];
    const allUploaded = [
      ...existingUploaded,
      ...newUploaded.filter(
        (newFile) =>
          !existingUploaded.some(
            (existing) =>
              existing.fileName === newFile.fileName &&
              existing.fileSize === newFile.fileSize,
          ),
      ),
    ];

    documents[key] = {
      documentTypeId: state.documentTypeId,
      uploadedFiles: allUploaded,
      uploaded: allUploaded.length > 0,
    };
  });
  return { documents };
};

const isDocUploaded = (
  state: DocumentState | undefined,
  uploadedDocuments: ApiDocument[],
  docTypeId: string,
) =>
  hasUploadedFiles(state) ||
  uploadedDocuments.some((doc) => getDocumentTypeId(doc) === docTypeId);

type DocumentTypeOptionProps = {
  docType: DocumentType;
  isSelected: boolean;
  isUploaded: boolean;
  isMandatory: boolean;
  onClick: () => void;
};

const DocumentTypeOption = ({
  docType,
  isSelected,
  isUploaded,
  isMandatory,
  onClick,
}: DocumentTypeOptionProps) => (
  <button
    key={docType.id}
    type="button"
    onClick={onClick}
    className={cn(
      "w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200",
      isSelected && "bg-accent border-primary/50 shadow-sm",
      !isSelected &&
        "border-border hover:bg-muted/50 hover:border-muted-foreground/40",
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {docType.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge
            variant={isMandatory ? "default" : "secondary"}
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {isMandatory ? "Compulsory" : "Optional"}
          </Badge>
          {isUploaded && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
              Uploaded
            </Badge>
          )}
        </div>
      </div>
      {isUploaded && (
        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
      )}
    </div>
  </button>
);

type UploadFilesTableProps = {
  state: DocumentState | null;
  uploadedDocuments: ApiDocument[];
  onRemoveLocalFile: (documentTypeId: string, fileKey: string) => void;
  onDeleteApiDocument: (doc: ApiDocument) => void;
  isDeleting: boolean;
};

const UploadFilesTable = ({
  state,
  uploadedDocuments,
  onRemoveLocalFile,
  onDeleteApiDocument,
  isDeleting,
}: UploadFilesTableProps) => {
  if (!state) return null;

  const knownPreviewUrls = new Set(
    (state.uploadedFiles ?? [])
      .map((file) => file.previewUrl)
      .filter(Boolean) as string[],
  );

  const apiUploaded = uploadedDocuments
    .filter((doc) => getDocumentTypeId(doc) === state.documentTypeId)
    .filter((doc) => {
      // Avoid duplicate rows when we already have a locally-tracked preview url.
      if (!doc.view_url) return true;
      return !knownPreviewUrls.has(doc.view_url);
    });

  const hasRows =
    (state.uploadedFiles?.length ?? 0) > 0 || (state.files?.length ?? 0) > 0;
  const hasApiRows = apiUploaded.length > 0;

  if (!hasRows && !hasApiRows) return null;

  const pendingFiles = state.files?.filter((f) => f.uploading || f.error) ?? [];

  return (
    <div className="mt-6">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
            <th className="pb-3 font-medium">NAME</th>
            <th className="pb-3 font-medium">SIZE</th>
            <th className="pb-3 font-medium">STATUS</th>
            <th className="pb-3 font-medium text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {pendingFiles.map((f, index) => (
            <tr
              key={`local-${index}`}
              className="border-b last:border-0 opacity-70"
            >
              <td className="py-3 text-sm">{f.file.name}</td>
              <td className="py-3 text-sm">{humanFileSize(f.file.size)}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  {f.uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-primary font-medium">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-destructive font-medium">
                      {f.error}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveLocalFile(state.documentTypeId, f.key)}
                    disabled={f.uploading}
                    title={f.uploading ? "Can't remove while uploading" : "Remove"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}

          {state.uploadedFiles?.map((file, index) => (
            <tr key={`uploaded-${index}`} className="border-b last:border-0">
              <td className="py-3 text-sm">{file.fileName}</td>
              <td className="py-3 text-sm">{humanFileSize(file.fileSize)}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary">Uploaded</span>
                </div>
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  {file.previewUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => window.open(file.previewUrl, "_blank")}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      const match = file.previewUrl
                        ? uploadedDocuments.find(
                            (doc) =>
                              getDocumentTypeId(doc) === state.documentTypeId &&
                              doc.view_url === file.previewUrl,
                          )
                        : undefined;

                      if (!match) {
                        toast.error(
                          "Couldn't identify this document on the server. Refresh and try again.",
                        );
                        return;
                      }

                      onDeleteApiDocument(match);
                    }}
                    disabled={isDeleting}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}

          {apiUploaded.map((doc, index) => (
            <tr
              key={`api-uploaded-${index}`}
              className="border-b last:border-0"
            >
              <td className="py-3 text-sm">
                {doc.document_type_name || "Uploaded document"}
              </td>
              <td className="py-3 text-sm">
                {humanFileSize(doc.file_size_bytes)}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary">Uploaded</span>
                </div>
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  {doc.view_url ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => window.open(doc.view_url, "_blank")}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteApiDocument(doc)}
                    disabled={isDeleting}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Component
export default function DocumentsUploadForm() {
  const searchParams = useSearchParams();
  const applicationIdFromUrl = searchParams.get("id");
  const storedApplicationId = useApplicationFormDataStore(
    (state) => state.applicationId,
  );
  const applicationId = applicationIdFromUrl || storedApplicationId;

  const { uploadDocument, deleteDocument } = useDocuments(applicationId);
  const {
    data: documentTypesResponse,
    isLoading: isLoadingDocumentTypes,
    error: documentTypesError,
  } = useDocumentTypesQuery();

  const { data: documentsResponse } =
    useApplicationDocumentsQuery(applicationId);

  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const markStepCompleted = useApplicationStepStore(
    (state) => state.markStepCompleted,
  );
  const setStepDirty = useApplicationStepStore((state) => state.setStepDirty);
  const clearStepDirty = useApplicationStepStore(
    (state) => state.clearStepDirty,
  );

  const filteredDocumentTypes = useMemo((): DocumentType[] => {
    if (!documentTypesResponse?.data) return [];
    return documentTypesResponse.data.filter(
      (doc: DocumentType) => !IGNORED_DOCUMENT_TYPES.has(doc.code ?? ""),
    );
  }, [documentTypesResponse?.data]);

  const sortedDocumentTypes = useMemo((): DocumentType[] => {
    if (filteredDocumentTypes.length === 0) return [];
    return [...filteredDocumentTypes].sort((a, b) => {
      if (a.is_mandatory !== b.is_mandatory) {
        return a.is_mandatory ? -1 : 1;
      }

      return a.display_order - b.display_order;
    });
  }, [filteredDocumentTypes]);

  const documentTypesKey = useMemo(() => {
    if (filteredDocumentTypes.length === 0) return "";
    return filteredDocumentTypes
      .map((d) => d.id)
      .sort()
      .join(",");
  }, [filteredDocumentTypes]);

  const [documentStates, setDocumentStates] = useState<
    Record<string, DocumentState>
  >({});
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const shouldSaveRef = useRef(false);

  const methods = useForm<DocumentsFormData>({
    defaultValues: { documents: {} },
  });

  const getStepData = useApplicationFormDataStore((state) => state.getStepData);

  const { saveOnSubmit } = useFormPersistence<DocumentsFormData>({
    applicationId,
    stepId: STEP_ID,
    form: methods,
    onDataLoaded: (data) => {
      if (data?.documents) {
        setDocumentStates((prev) => {
          const updated = { ...prev };
          Object.keys(data.documents).forEach((key) => {
            const persisted = data.documents[key];
            if (updated[key]) {
              updated[key] = {
                ...updated[key],
                uploadedFiles: persisted.uploadedFiles || [],
                uploaded: persisted.uploaded || false,
              };
            } else {
              updated[key] = {
                documentTypeId: key,
                files: [],
                uploadedFiles: persisted.uploadedFiles || [],
                uploaded: persisted.uploaded || false,
              };
            }
          });
          return updated;
        });
      }
    },
  });

  const uploadedDocuments: ApiDocument[] = useMemo(
    () =>
      (documentsResponse?.data || []).filter(
        (doc: ApiDocument) =>
          !IGNORED_DOCUMENT_TYPES.has(getDocumentTypeCode(doc)),
      ),
    [documentsResponse?.data],
  );

  const allMandatoryUploaded = useMemo(
    () =>
      isAllMandatoryUploaded(
        documentStates,
        sortedDocumentTypes,
        uploadedDocuments,
      ),
    [documentStates, sortedDocumentTypes, uploadedDocuments],
  );

  const isAnyFileUploading = uploadingFiles.size > 0;
  const isDeleting = deleteDocument.isPending;

  const handleRemoveLocalFile = useCallback(
    (documentTypeId: string, fileKey: string) => {
      setStepDirty(STEP_ID, true);
      setDocumentStates((prev) => {
        const current = prev[documentTypeId];
        if (!current) return prev;
        return {
          ...prev,
          [documentTypeId]: {
            ...current,
            files: (current.files ?? []).filter((f) => f.key !== fileKey),
          },
        };
      });
    },
    [setStepDirty],
  );

  const handleDeleteApiDocument = useCallback(
    async (doc: ApiDocument) => {
      if (!applicationId || !doc?.id) return;

      setStepDirty(STEP_ID, true);
      const toastId = `delete-document-${doc.id}`;
      toast.loading("Deleting document...", { id: toastId });

      try {
        await deleteDocument.mutateAsync({ documentId: doc.id, applicationId });

        // Best-effort: remove any locally tracked uploaded row that matches the deleted view_url.
        if (doc.view_url) {
          setDocumentStates((prev) => {
            const docTypeId = getDocumentTypeId(doc);
            const current = prev[docTypeId];
            if (!current) return prev;

            return {
              ...prev,
              [docTypeId]: {
                ...current,
                uploadedFiles: (current.uploadedFiles ?? []).filter(
                  (f) => f.previewUrl !== doc.view_url,
                ),
              },
            };
          });
        }

        toast.success("Document deleted", { id: toastId });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete document",
          { id: toastId },
        );
      }
    },
    [applicationId, deleteDocument, setStepDirty],
  );

  // Set first document as selected when loaded
  useEffect(() => {
    if (sortedDocumentTypes.length > 0 && !selectedDocumentId) {
      setSelectedDocumentId(sortedDocumentTypes[0].id);
    }
  }, [sortedDocumentTypes, selectedDocumentId]);

  // Initialize document states
  useEffect(() => {
    if (sortedDocumentTypes.length > 0 && applicationId) {
      setDocumentStates((prev) => {
        if (Object.keys(prev).length === 0) {
          const initialState = createInitialState(sortedDocumentTypes);
          const persistedData = getStepData<DocumentsFormData>(STEP_ID);
          if (persistedData?.documents) {
            Object.keys(persistedData.documents).forEach((key) => {
              const persisted = persistedData.documents[key];
              if (initialState[key]) {
                initialState[key] = {
                  ...initialState[key],
                  uploadedFiles: persisted.uploadedFiles || [],
                  uploaded: persisted.uploaded || false,
                };
              }
            });
          }
          return initialState;
        }
        return prev;
      });
    }
  }, [documentTypesKey, applicationId, getStepData]);

  // Auto-save
  useEffect(() => {
    if (!applicationId || sortedDocumentTypes.length === 0) return;

    const formData = convertToFormData(documentStates);
    methods.setValue("documents", formData.documents);

    if (shouldSaveRef.current) {
      saveOnSubmit(formData);
      shouldSaveRef.current = false;
    }

    if (
      isAllMandatoryUploaded(
        documentStates,
        sortedDocumentTypes,
        uploadedDocuments,
      )
    ) {
      markStepCompleted(STEP_ID);
    }
  }, [
    documentStates,
    applicationId,
    methods,
    markStepCompleted,
    sortedDocumentTypes,
    saveOnSubmit,
    uploadedDocuments,
  ]);

  // Mark this step dirty only on explicit user actions (upload/remove/delete),
  // not on initial load/hydration.

  const uploadSingleFile = useCallback(
    async (
      documentTypeId: string,
      file: File,
      fileKey: string,
      process_ocr?: boolean,
      upload_mode?: "replace" | "new",
    ): Promise<void> => {
      if (!applicationId) return;

      setUploadingFiles((prev) => new Set(prev).add(fileKey));

      try {
        const response: any = await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: documentTypeId,
          file,
          process_ocr,
          upload_mode,
        });

        console.log("Upload response", response);

        const previewUrl = response?.data?.preview_url || response?.preview_url;

        setDocumentStates((prev) => {
          const current = prev[documentTypeId];
          const files = current?.files ?? [];
          const hasFile = files.some((item) => item.key === fileKey);
          const nextFiles = hasFile
            ? files.map((item) =>
                item.key === fileKey
                  ? {
                      ...item,
                      uploading: false,
                      uploaded: true,
                      error: undefined,
                    }
                  : item,
              )
            : [
                ...files,
                {
                  key: fileKey,
                  file,
                  uploading: false,
                  uploaded: true,
                },
              ];

          const newUploadedFile: UploadedFileMetadata = {
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            previewUrl: previewUrl,
          };

          const uploadedFiles = current?.uploadedFiles ?? [];
          const hasExisting = uploadedFiles.some(
            (existing) =>
              existing.fileName === newUploadedFile.fileName &&
              existing.fileSize === newUploadedFile.fileSize,
          );
          const nextUploadedFiles = hasExisting
            ? uploadedFiles
            : [...uploadedFiles, newUploadedFile];

          return {
            ...prev,
            [documentTypeId]: {
              ...current,
              files: nextFiles,
              uploadedFiles: nextUploadedFiles,
              uploaded: nextUploadedFiles.length > 0,
            },
          };
        });

        shouldSaveRef.current = true;
      } catch (error) {
        console.error("Upload failed:", error);
        setDocumentStates((prev) => {
          const current = prev[documentTypeId];
          const files = current?.files ?? [];
          const hasFile = files.some((item) => item.key === fileKey);
          const nextFiles = hasFile
            ? files.map((item) =>
                item.key === fileKey
                  ? {
                      ...item,
                      uploading: false,
                      uploaded: false,
                      error: "Upload failed",
                    }
                  : item,
              )
            : [
                ...files,
                {
                  key: fileKey,
                  file,
                  uploading: false,
                  uploaded: false,
                  error: "Upload failed",
                },
              ];

          return {
            ...prev,
            [documentTypeId]: {
              ...current,
              files: nextFiles,
            },
          };
        });
      } finally {
        setUploadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(fileKey);
          return next;
        });
      }
    },
    [applicationId, uploadDocument],
  );

  const handleFiles = useCallback(
    async (
      documentTypeId: string,
      files: File[] | null,
      accepts_ocr?: boolean,
    ) => {
      if (!files || files.length === 0 || !applicationId) return;

      // Backend behavior:
      // - "replace" (default): creates a new version if doc type already exists
      // - "new": always creates a new document entry (multi-doc)
      const uploadMode: "replace" | "new" =
        files.length > 1 ? "new" : "replace";

      const validFiles = files.filter((file) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`"${file.name}" exceeds 5MB limit`);
          return false;
        }

        if (!isAllowedFileType(file)) {
          toast.error(
            `"${file.name}" type not allowed. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(",")}`,
          );
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) return;

      const newFileEntries = validFiles.map((file) => ({
        key: getFileKey(documentTypeId, file),
        file,
        uploading: true,
        uploaded: false,
      }));

      const existingKeys = new Set(
        (documentStates[documentTypeId]?.files ?? []).map((item) => item.key),
      );
      const uniqueNewEntries = newFileEntries.filter(
        (entry) => !existingKeys.has(entry.key),
      );

      if (uniqueNewEntries.length > 0) {
        setStepDirty(STEP_ID, true);
      }

      setDocumentStates((prev) => {
        const current = prev[documentTypeId];
        const existingFiles = current?.files ?? [];

        return {
          ...prev,
          [documentTypeId]: {
            ...current,
            files: [...existingFiles, ...uniqueNewEntries],
          },
        };
      });

      for (const entry of uniqueNewEntries) {
        if (entry.uploading) {
          await uploadSingleFile(
            documentTypeId,
            entry.file,
            entry.key,
            accepts_ocr ?? false,
            uploadMode,
          );
        }
      }
    },
    [applicationId, documentStates, uploadSingleFile, setStepDirty],
  );

  const handleContinue = useCallback(() => {
    if (!applicationId) return;

    const missingMandatory = sortedDocumentTypes.filter((doc) => {
      const state = documentStates[doc.id];
      const isLocalUploaded = hasUploadedFiles(state);
      const isApiUploaded = uploadedDocuments.some(
        (apiDoc: any) => getDocumentTypeId(apiDoc) === doc.id,
      );
      return doc.is_mandatory && !isLocalUploaded && !isApiUploaded;
    });

    if (missingMandatory.length > 0) {
      const missingNames = missingMandatory.map((doc) => doc.name).join(", ");
      toast.error(`Please upload all required documents: ${missingNames}`, {
        duration: 5000,
      });
      return;
    }

    const formData = convertToFormData(documentStates);
    saveOnSubmit(formData);
    markStepCompleted(STEP_ID);
    clearStepDirty(STEP_ID);
    goToNext();
  }, [
    applicationId,
    sortedDocumentTypes,
    documentStates,
    saveOnSubmit,
    markStepCompleted,
    goToNext,
    uploadedDocuments,
    clearStepDirty,
  ]);

  if (isLoadingDocumentTypes) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading document types...
        </span>
      </div>
    );
  }

  if (documentTypesError || !documentTypesResponse?.success) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
        <p className="text-sm text-destructive">
          {documentTypesError?.message ||
            documentTypesResponse?.message ||
            "Failed to load document types"}
        </p>
      </div>
    );
  }

  if (sortedDocumentTypes.length === 0) {
    return (
      <div className="rounded-md border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          No document types available
        </p>
      </div>
    );
  }

  const selectedDocument = sortedDocumentTypes.find(
    (d) => d.id === selectedDocumentId,
  );
  const selectedState = selectedDocumentId
    ? documentStates[selectedDocumentId]
    : null;

  // Get uploaded documents from API

  return (
    <FormProvider {...methods}>
      <form className="space-y-8">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Document Types Grid - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">
              Select Document Type to Upload
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
              {sortedDocumentTypes.map((docType) => {
                const state = documentStates[docType.id];
                const isSelected = selectedDocumentId === docType.id;
                const isUploaded = isDocUploaded(
                  state,
                  uploadedDocuments,
                  docType.id,
                );

                const isMandatory = docType.is_mandatory && !isUploaded;

                return (
                  <DocumentTypeOption
                    key={docType.id}
                    docType={docType}
                    isSelected={isSelected}
                    isUploaded={isUploaded}
                    isMandatory={isMandatory}
                    onClick={() => setSelectedDocumentId(docType.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedDocument && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedDocument.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedDocument.name}
                      </p>
                    </div>

                    {/* Upload Area */}
                    <Dropzone
                      onDrop={(acceptedFiles) =>
                        handleFiles(
                          selectedDocument.id,
                          acceptedFiles,
                          selectedDocument.accepts_ocr,
                        )
                      }
                      onError={(error) => {
                        if (error?.message) {
                          toast.error(error.message);
                        }
                      }}
                      accept={DROPZONE_ACCEPT}
                      maxFiles={MAX_FILES_PER_UPLOAD}
                      maxSize={MAX_FILE_SIZE_BYTES}
                      disabled={isAnyFileUploading || !applicationId}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-16 text-center transition-all duration-200 cursor-pointer",
                        isAnyFileUploading
                          ? "border-primary/50 bg-primary/10"
                          : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60",
                      )}
                    >
                      {isAnyFileUploading ? (
                        <>
                          <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                          <p className="text-base text-foreground font-medium">
                            Uploading files...
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {getDropzoneHelperText(MAX_FILE_SIZE_BYTES)}
                          </p>
                        </>
                      ) : (
                        <DropzoneEmptyState>
                          <div className="flex flex-col items-center justify-center">
                            <Upload
                              className="h-16 w-16 mx-auto mb-4 text-muted-foreground"
                              strokeWidth={1.5}
                            />
                            <p className="text-base text-foreground font-medium">
                              Drop files here to upload or click to browse
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              {getDropzoneHelperText(MAX_FILE_SIZE_BYTES)}
                            </p>
                          </div>
                        </DropzoneEmptyState>
                      )}
                    </Dropzone>

                    {/* Files Table */}
                    <UploadFilesTable
                      state={selectedState}
                      uploadedDocuments={uploadedDocuments}
                      onRemoveLocalFile={handleRemoveLocalFile}
                      onDeleteApiDocument={handleDeleteApiDocument}
                      isDeleting={isDeleting}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <ApplicationStepHeader className="mt-4">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={
              isAnyFileUploading || !applicationId || !allMandatoryUploaded
            }
          >
            {isAnyFileUploading
              ? "Uploading..."
              : allMandatoryUploaded
                ? "Save & Continue"
                : "Save & Continue"}
          </Button>
        </ApplicationStepHeader>
      </form>
    </FormProvider>
  );
}
