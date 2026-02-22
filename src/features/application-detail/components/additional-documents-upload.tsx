import { Button } from "@/components/ui/button";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import type {
  ApplicationDocumentListItem,
  DocumentType,
} from "@/service/document.service";
import {
  useApplicationDocumentsQuery,
  useDocumentTypesQuery,
  useDocuments,
} from "@/shared/hooks/document.hook";
import {
  ALLOWED_FILE_EXTENSIONS,
  DROPZONE_ACCEPT,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_SIZE_BYTES,
  getDropzoneHelperText,
  getFileKey,
  humanFileSize,
  isAllowedFileType,
} from "@/shared/lib/document-file-helpers";
import { cn } from "@/shared/lib/utils";
import { Eye, Loader2, Trash2, Upload } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export const AdditionalDocumentsUpload = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  type ApplicationDocument = ApplicationDocumentListItem;

  const [isOpen, setIsOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(
    () => new Set(),
  );

  const { uploadDocument, deleteDocument } = useDocuments(applicationId);
  const {
    data: documentTypesResponse,
    isLoading: isLoadingDocumentTypes,
    error: documentTypesError,
  } = useDocumentTypesQuery();

  const otherDocumentType = useMemo((): DocumentType | null => {
    const types = documentTypesResponse?.data ?? [];
    return types.find((t) => t.code === "OTHER") ?? null;
  }, [documentTypesResponse?.data]);

  const {
    data: unmergedDocsResponse,
    isLoading: isLoadingUnmergedDocs,
    isFetching: isFetchingUnmergedDocs,
  } = useApplicationDocumentsQuery(applicationId, { merged: false });

  const unmergedOtherDocuments = useMemo((): ApplicationDocument[] => {
    const docs = (unmergedDocsResponse?.data ?? []) as ApplicationDocument[];
    return docs.filter((d) => d.document_type_code === "OTHER");
  }, [unmergedDocsResponse?.data]);

  const isAnyFileUploading =
    uploadingFiles.size > 0 || uploadDocument.isPending;
  const isDeleting = deleteDocument.isPending;
  const isLoadingUnmerged = isLoadingUnmergedDocs || isFetchingUnmergedDocs;

  const uploadFiles = useCallback(
    async (files: File[] | null) => {
      if (!files || files.length === 0) return;
      if (!applicationId) return;

      if (isLoadingDocumentTypes) {
        toast.error("Document types are still loading. Please try again.");
        return;
      }

      if (documentTypesError || !documentTypesResponse?.success) {
        toast.error(
          documentTypesError?.message ||
            documentTypesResponse?.message ||
            "Failed to load document types",
        );
        return;
      }

      if (!otherDocumentType) {
        toast.error('Document type with code "OTHER" is not configured.');
        return;
      }

      // Backend behavior:
      // - "replace" (default): creates a new version if doc type already exists
      // - "new": always creates a new document entry (multi-doc)
      const uploadMode = "new";

      const validFiles = files.filter((file) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(
            `"${file.name}" exceeds ${humanFileSize(MAX_FILE_SIZE_BYTES)} limit`,
          );
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

      for (const file of validFiles) {
        const fileKey = getFileKey(otherDocumentType.id, file);
        if (uploadingFiles.has(fileKey)) continue;

        setUploadingFiles((prev) => {
          const next = new Set(prev);
          next.add(fileKey);
          return next;
        });

        try {
          await uploadDocument.mutateAsync({
            application_id: applicationId,
            document_type_id: otherDocumentType.id,
            file,
            process_ocr: false,
            upload_mode: uploadMode,
          });
        } catch (error) {
          void error;
          // `useUploadDocument` already shows a toast; keep going for the rest.
        } finally {
          setUploadingFiles((prev) => {
            const next = new Set(prev);
            next.delete(fileKey);
            return next;
          });
        }
      }
    },
    [
      applicationId,
      documentTypesError,
      documentTypesResponse?.message,
      documentTypesResponse?.success,
      isLoadingDocumentTypes,
      otherDocumentType,
      uploadDocument,
      uploadingFiles,
    ],
  );

  const handleDelete = useCallback(
    async (doc: ApplicationDocument) => {
      if (!doc?.id) return;

      const toastId = `delete-document-${doc.id}`;
      toast.loading("Deleting document...", { id: toastId });

      try {
        await deleteDocument.mutateAsync({ documentId: doc.id, applicationId });
        toast.success("Document deleted", { id: toastId });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete document",
          { id: toastId },
        );
      }
    },
    [applicationId, deleteDocument],
  );

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Additional documents</p>
          <p className="text-xs text-muted-foreground">
            Upload documents under the{" "}
            <span className="font-medium">Other</span> type. These show here
            while unmerged.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Hide uploader" : "Upload additional documents"}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-3 space-y-4">
          <Dropzone
            onDrop={(acceptedFiles) => uploadFiles(acceptedFiles)}
            onError={(error) => {
              if (error?.message) toast.error(error.message);
            }}
            accept={DROPZONE_ACCEPT}
            maxFiles={MAX_FILES_PER_UPLOAD}
            maxSize={MAX_FILE_SIZE_BYTES}
            disabled={isAnyFileUploading || !applicationId}
            className={cn(
              "border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 cursor-pointer",
              isAnyFileUploading
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60",
            )}
          >
            {isAnyFileUploading ? (
              <>
                <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary animate-spin" />
                <p className="text-sm text-foreground font-medium">
                  Uploading files...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getDropzoneHelperText(MAX_FILE_SIZE_BYTES)}
                </p>
              </>
            ) : (
              <DropzoneEmptyState>
                <div className="flex flex-col items-center justify-center">
                  <Upload
                    className="h-10 w-10 mx-auto mb-3 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm text-foreground font-medium">
                    Drop files here to upload or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getDropzoneHelperText(MAX_FILE_SIZE_BYTES)}
                  </p>
                </div>
              </DropzoneEmptyState>
            )}
          </Dropzone>

          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Unmerged uploads (Other)
              </p>
              {isLoadingUnmerged ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Refreshing…</span>
                </div>
              ) : null}
            </div>

            {unmergedOtherDocuments.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No additional documents uploaded yet.
              </p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                      <th className="pb-2 font-medium">NAME</th>
                      <th className="pb-2 font-medium">SIZE</th>
                      <th className="pb-2 font-medium text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unmergedOtherDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b last:border-0">
                        <td className="py-2 text-xs">
                          {doc.document_type_name || "Uploaded document"}
                        </td>
                        <td className="py-2 text-xs">
                          {humanFileSize(doc.file_size_bytes)}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {doc.view_url ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                onClick={() =>
                                  window.open(doc.view_url, "_blank")
                                }
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
                              onClick={() => handleDelete(doc)}
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
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
