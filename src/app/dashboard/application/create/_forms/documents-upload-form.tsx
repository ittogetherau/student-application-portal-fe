"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useApplicationDocumentsQuery,
  useDocuments,
  useDocumentTypesQuery,
} from "@/hooks/document.hook";
import { useFormPersistence } from "@/hooks/useFormPersistence.hook";
import { cn } from "@/lib/utils";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { CheckCircle2, Eye, Loader2, Upload } from "lucide-react";
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

const STEP_ID = 12;

const ALLOWED_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".gif",
  ".png",
  ".tiff",
  ".tif",
  ".bmp",
  ".pdf",
];

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/gif",
  "image/png",
  "image/tiff",
  "image/bmp",
  "application/pdf",
];

const isAllowedFileType = (file: File) => {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );
  const hasAllowedMime =
    !file.type || ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  return hasAllowedExtension || hasAllowedMime;
};

// Helper Functions
const createInitialState = (
  documentTypes: Array<{ id: string }>,
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

const isAllMandatoryUploaded = (
  documentStates: Record<string, DocumentState>,
  documentTypes: Array<{ id: string; is_mandatory: boolean }>,
  uploadedDocuments: any[] = [],
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

// Main Component
export default function DocumentsUploadForm() {
  const searchParams = useSearchParams();
  const applicationIdFromUrl = searchParams.get("id");
  const storedApplicationId = useApplicationFormDataStore(
    (state) => state.applicationId,
  );
  const applicationId = applicationIdFromUrl || storedApplicationId;

  const { uploadDocument } = useDocuments(applicationId);
  const {
    data: documentTypesResponse,
    isLoading: isLoadingDocumentTypes,
    error: documentTypesError,
  } = useDocumentTypesQuery();

  const { data: documentsResponse, isLoading: isLoadingDocuments } =
    useApplicationDocumentsQuery(applicationId);

  console.log(documentTypesResponse, "response");

  const goToNext = useApplicationStepStore((state) => state.goToNext);
  const markStepCompleted = useApplicationStepStore(
    (state) => state.markStepCompleted,
  );

  const sortedDocumentTypes = useMemo(() => {
    if (!documentTypesResponse?.data) return [];
    return [...documentTypesResponse.data].sort((a, b) => {
      if (a.is_mandatory !== b.is_mandatory) {
        return a.is_mandatory ? -1 : 1;
      }

      return a.display_order - b.display_order;
    });
  }, [documentTypesResponse?.data]);

  const documentTypesKey = useMemo(() => {
    if (!documentTypesResponse?.data) return "";
    return documentTypesResponse.data
      .map((d) => d.id)
      .sort()
      .join(",");
  }, [documentTypesResponse?.data]);

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

  const allMandatoryUploaded = useMemo(
    () =>
      isAllMandatoryUploaded(
        documentStates,
        sortedDocumentTypes,
        documentsResponse?.data || [],
      ),
    [documentStates, sortedDocumentTypes, documentsResponse?.data],
  );

  const isAnyFileUploading = uploadingFiles.size > 0;

  // Set first document as selected when loaded
  useEffect(() => {
    if (sortedDocumentTypes.length > 0 && !selectedDocumentId) {
      setSelectedDocumentId(sortedDocumentTypes[0].id);
    }
  }, [sortedDocumentTypes, selectedDocumentId]);

  console.log(sortedDocumentTypes);

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
        documentsResponse?.data || [],
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
    documentsResponse?.data,
  ]);

  const uploadSingleFile = useCallback(
    async (
      documentTypeId: string,
      file: File,
      fileKey: string,
    ): Promise<void> => {
      console.log("check", applicationId);
      if (!applicationId) return;

      setUploadingFiles((prev) => new Set(prev).add(fileKey));

      try {
        const response: any = await uploadDocument.mutateAsync({
          application_id: applicationId,
          document_type_id: documentTypeId,
          file,
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

  const handleFileSelect = useCallback(
    async (
      documentTypeId: string,
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const files = event.target.files;
      if (!files || !applicationId) return;

      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const validFiles = fileArray.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 5MB limit`);
          return false;
        }

        if (!isAllowedFileType(file)) {
          toast.error(
            `"${file.name}" type not allowed. Allowed types: .jpg, .gif, .png, .tiff, .jpeg, .pdf, .tif, .bmp`,
          );
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) {
        event.target.value = "";
        return;
      }

      const newFileEntries = validFiles.map((file) => ({
        key: `${documentTypeId}-${file.name}-${file.size}`,
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
          await uploadSingleFile(documentTypeId, entry.file, entry.key);
        }
      }

      event.target.value = "";
    },
    [applicationId, documentStates, uploadSingleFile],
  );

  const handleRemovePersistedFile = useCallback(
    (documentTypeId: string, fileName: string, fileSize: number) => {
      setDocumentStates((prev) => {
        const existingUploaded = prev[documentTypeId]?.uploadedFiles || [];
        const nextUploaded = existingUploaded.filter(
          (file) => !(file.fileName === fileName && file.fileSize === fileSize),
        );
        return {
          ...prev,
          [documentTypeId]: {
            ...prev[documentTypeId],
            uploadedFiles: nextUploaded,
            uploaded: nextUploaded.length > 0,
          },
        };
      });
      shouldSaveRef.current = true;
    },
    [],
  );

  const handleContinue = useCallback(() => {
    if (!applicationId) return;

    const uploadedDocs = documentsResponse?.data || [];
    const missingMandatory = sortedDocumentTypes.filter((doc) => {
      const state = documentStates[doc.id];
      const isLocalUploaded = hasUploadedFiles(state);
      const isApiUploaded = uploadedDocs.some(
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
    goToNext();
  }, [
    applicationId,
    sortedDocumentTypes,
    documentStates,
    saveOnSubmit,
    markStepCompleted,
    goToNext,
  ]);

  // Get all uploaded files across all document types
  const allUploadedFiles = useMemo(() => {
    const files: Array<{
      fileName: string;
      documentName: string;
      fileSize: number;
      uploadedAt: string;
    }> = [];

    sortedDocumentTypes.forEach((docType) => {
      const state = documentStates[docType.id];
      if (state?.uploadedFiles) {
        state.uploadedFiles.forEach((file) => {
          files.push({
            ...file,
            documentName: docType.name,
          });
        });
      }
    });

    return files;
  }, [documentStates, sortedDocumentTypes]);

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

  console.log(selectedState, "selected state");

  // Get uploaded documents from API
  const uploadedDocuments = documentsResponse?.data || [];

  return (
    <FormProvider {...methods}>
      <form className="space-y-8">
        {/* Gallery Section - Shown First */}
        {/* Gallery Section - Shown First */}
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
            {uploadedDocuments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No documents uploaded yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedDocuments.map((doc: any, index: number) => (
                  <Card
                    key={index}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          {doc.view_url && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() =>
                                window.open(doc.view_url, "_blank")
                              }
                              title="Preview Document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="mt-3">
                          <p
                            className="font-medium text-sm truncate"
                            title={doc.document_type_name}
                          >
                            {doc.document_type_name || "Unknown Type"}
                          </p>
                          {doc.uploaded_at && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            {(doc.file_size_bytes / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                const isUploaded =
                  hasUploadedFiles(state) ||
                  uploadedDocuments.some(
                    (doc: any) => getDocumentTypeId(doc) === docType.id,
                  );

                const isMandatory = docType.is_mandatory && !isUploaded;

                return (
                  <button
                    key={docType.id}
                    type="button"
                    onClick={() => setSelectedDocumentId(docType.id)}
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
                            <Badge
                              variant="default"
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
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
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-16 text-center transition-all duration-200 cursor-pointer",
                        isAnyFileUploading
                          ? "border-primary/50 bg-primary/10"
                          : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60",
                      )}
                    >
                      <input
                        type="file"
                        id={`file-${selectedDocument.id}`}
                        className="hidden"
                        multiple
                        onChange={(e) =>
                          handleFileSelect(selectedDocument.id, e)
                        }
                        accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                        disabled={isAnyFileUploading || !applicationId}
                      />
                      <label
                        htmlFor={`file-${selectedDocument.id}`}
                        className="cursor-pointer block"
                      >
                        {isAnyFileUploading ? (
                          <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                        ) : (
                          <Upload
                            className="h-16 w-16 mx-auto mb-4 text-muted-foreground"
                            strokeWidth={1.5}
                          />
                        )}
                        <p className="text-base text-foreground font-medium">
                          {isAnyFileUploading
                            ? "Uploading files..."
                            : "Drop files here to upload or click to browse"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Max file size: 5MB. Supports PDF, JPG, PNG, GIF, TIFF,
                          BMP.
                        </p>
                      </label>
                    </div>

                    {/* Files Table */}
                    {((selectedState?.uploadedFiles?.length ?? 0) > 0 ||
                      (selectedState?.files?.length ?? 0) > 0) && (
                      <div className="mt-6">
                        <table className="w-full">
                          <thead className="border-b">
                            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                              <th className="pb-3 font-medium">NAME</th>
                              <th className="pb-3 font-medium">SIZE</th>
                              <th className="pb-3 font-medium">STATUS</th>
                              <th className="pb-3 font-medium text-right">
                                ACTIONS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Show in-progress or failed uploads */}
                            {selectedState?.files
                              ?.filter((f) => f.uploading || f.error)
                              ?.map((f, index) => (
                                <tr
                                  key={`local-${index}`}
                                  className="border-b last:border-0 opacity-70"
                                >
                                  <td className="py-3 text-sm">
                                    {f.file.name}
                                  </td>
                                  <td className="py-3 text-sm">
                                    {(f.file.size / 1024).toFixed(2)} KB
                                  </td>
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
                                </tr>
                              ))}

                            {/* Show uploaded files */}
                            {selectedState?.uploadedFiles?.map(
                              (file, index) => (
                                <tr
                                  key={`uploaded-${index}`}
                                  className="border-b last:border-0"
                                >
                                  <td className="py-3 text-sm">
                                    {file.fileName}
                                  </td>
                                  <td className="py-3 text-sm">
                                    {(file.fileSize / 1024).toFixed(2)} KB
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                      <span className="text-sm text-primary">
                                        Uploaded
                                      </span>
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
                                          onClick={() =>
                                            window.open(
                                              file.previewUrl,
                                              "_blank",
                                            )
                                          }
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
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
