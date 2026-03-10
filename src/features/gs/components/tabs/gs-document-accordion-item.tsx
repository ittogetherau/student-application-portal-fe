"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogContent as ShadDialogContent,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
} from "@/components/ui/dialog";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import CreateThreadButton from "@/features/threads/components/buttons/create-thread-button";
import {
  useGSDocumentFileDeleteMutation,
  useGSDocumentStatusMutation,
  useGSDocumentUploadMutation,
} from "@/hooks/useGSAssessment.hook";
import {
  GS_DOCUMENT_CONFIGS,
  type GSDocumentBackendStatus,
  type GSDocumentData,
} from "@/shared/constants/gs-assessment";
import {
  DROPZONE_ACCEPT,
  getDropzoneHelperText,
  isAllowedFileType,
  MAX_FILE_SIZE_BYTES,
} from "@/shared/lib/document-file-helpers";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

function getStatusBadge(status: GSDocumentBackendStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Approved
        </Badge>
      );
    case "uploaded":
      return (
        <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Uploaded
        </Badge>
      );
    case "in_review":
      return (
        <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Under Review
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Changes Requested
        </Badge>
      );
    case "not_started":
    default:
      return (
        <Badge className="text-[10px]" variant="secondary">
          Not Started
        </Badge>
      );
  }
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

interface GSDocumentAccordionItemProps {
  applicationId?: string;
  doc: GSDocumentData;
  isStaff: boolean;
}

export default function GSDocumentAccordionItem({
  applicationId,
  doc,
  isStaff,
}: GSDocumentAccordionItemProps) {
  const uploadMutation = useGSDocumentUploadMutation(applicationId ?? null);
  const statusMutation = useGSDocumentStatusMutation(applicationId ?? null);
  const deleteFileMutation = useGSDocumentFileDeleteMutation(
    applicationId ?? null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    fileId: string;
    fileName: string;
  } | null>(null);

  const config = useMemo(
    () => GS_DOCUMENT_CONFIGS.find((c) => c.number === doc.documentNumber),
    [doc.documentNumber],
  );

  const visibleFiles = useMemo(
    () => doc.files.filter((file) => !file.deletedAt),
    [doc.files],
  );
  const hasFiles = visibleFiles.length > 0;
  const latestFile = hasFiles ? visibleFiles[visibleFiles.length - 1] : null;
  const isUpdatingStatus = statusMutation.isPending;
  const isMandatory = doc.documentNumber >= 1 && doc.documentNumber <= 5;

  const handleFiles = async (files: File[] | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!isAllowedFileType(file)) {
      toast.error(
        "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      );
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadMutation.mutateAsync({
        documentNumber: doc.documentNumber,
        formData,
      });
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = async (status: "approved" | "rejected") => {
    try {
      await statusMutation.mutateAsync({
        documentNumber: doc.documentNumber,
        status,
      });
      toast.success(
        `Document ${status === "approved" ? "approved" : "change requested"}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  return (
    <AccordionItem
      value={doc.id}
      className="rounded-lg border border-border px-3 data-[state=open]:border-primary h-fit"
    >
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <ShadDialogContent className="sm:max-w-md">
          <ShadDialogHeader>
            <ShadDialogTitle>Delete file?</ShadDialogTitle>
            <DialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.fileName ?? "this file"}
              </span>
              . This action can’t be undone.
            </DialogDescription>
          </ShadDialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteFileMutation.isPending || pendingDelete === null}
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteFileMutation.mutateAsync({
                    documentNumber: doc.documentNumber,
                    fileId: pendingDelete.fileId,
                  });
                  toast.success("File deleted");
                  setPendingDelete(null);
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to delete file",
                  );
                }
              }}
            >
              {deleteFileMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </ShadDialogContent>
      </Dialog>

      <AccordionTrigger className="py-3 hover:no-underline">
        <div className="flex w-full items-center justify-between gap-3 pr-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-sm font-semibold text-muted-foreground">
              {doc.documentNumber}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-muted-foreground">
                {latestFile
                  ? `${latestFile.fileName} - ${formatUtcToFriendlyLocal(latestFile.uploadedAt)}`
                  : (config?.description ?? "No file uploaded")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isMandatory && !hasFiles && (
              <Badge variant="default" className="text-[10px]">
                Mandatory
              </Badge>
            )}
            {getStatusBadge(doc.status)}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-4 space-y-4">
        {hasFiles && (
          <div className="space-y-2">
            {visibleFiles.map((file) => {
              const href = file.signedUrl ?? file.fileUrl;
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">
                      {file.fileName || "Uploaded file"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {formatFileSize(file.fileSize)}
                      {file.uploadedAt
                        ? ` • ${formatUtcToFriendlyLocal(file.uploadedAt)}`
                        : ""}
                    </p>
                  </div>

                  {href ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={deleteFileMutation.isPending}
                        onClick={() =>
                          setPendingDelete({
                            fileId: file.id,
                            fileName: file.fileName || "this file",
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <Dropzone
            onDrop={handleFiles}
            onError={(error) => {
              if (error?.message) toast.error(error.message);
            }}
            accept={DROPZONE_ACCEPT}
            maxFiles={1}
            maxSize={MAX_FILE_SIZE_BYTES}
            disabled={isUploading}
            className={`px-4 py-6 text-center text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <DropzoneEmptyState>
              <div className="flex flex-col items-center justify-center gap-2">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {isUploading
                    ? "Uploading..."
                    : hasFiles
                      ? "Add file"
                      : "Drop file here or click to upload"}
                </span>
                <span>
                  {config?.acceptedFormats ??
                    getDropzoneHelperText(MAX_FILE_SIZE_BYTES)}
                </span>
              </div>
            </DropzoneEmptyState>
          </Dropzone>
        </div>

        {doc.status === "rejected" && doc.reviewNotes && (
          <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Requested changes:
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
              {doc.reviewNotes}
            </p>
          </div>
        )}

        {isStaff && doc.status !== "not_started" && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              Staff Actions:
            </span>
            {doc.status !== "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => handleStatusChange("approved")}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                Approve
              </Button>
            )}
            {doc.status !== "rejected" && (
              <CreateThreadButton
                size="sm"
                variant="outline"
                className="w-auto h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                applicationId={applicationId ?? ""}
                disabled={!applicationId || isUpdatingStatus}
                icon={RefreshCw}
                iconClassName="h-3 w-3 mr-1"
                label="Request Change"
                dialogTitle="Request change"
                defaultTitle={
                  doc.title
                    ? `Changes requested for - ${doc.title}`
                    : "Changes requested"
                }
                showAllFields={false}
                onSuccess={() => {
                  if (!applicationId) return;
                  void (async () => {
                    try {
                      await statusMutation.mutateAsync({
                        documentNumber: doc.documentNumber,
                        status: "rejected",
                      });
                      toast.success("Change requested");
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Failed to update status",
                      );
                    }
                  })();
                }}
              />
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
