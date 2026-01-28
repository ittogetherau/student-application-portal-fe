"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Loader2,
  Search,
  Trash2,
  Upload,
  ExternalLink,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent as ShadDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GS_DOCUMENT_CONFIGS,
  transformGSDocuments,
  type GSDocumentBackendStatus,
  type GSDocumentData,
} from "@/constants/gs-assessment";
import {
  useGSDocumentsQuery,
  useGSDocumentUploadMutation,
  useGSDocumentStatusMutation,
  useGSDocumentAutoCompleteMutation,
  useGSDocumentFileDeleteMutation,
} from "@/hooks/useGSAssessment.hook";

const ALLOWED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const isAllowedFileType = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );
  const hasAllowedMime =
    !file.type || ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  return hasAllowedExtension && hasAllowedMime;
};

interface GSDocumentsTabProps {
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

function getStatusBadge(status: GSDocumentBackendStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Approved
        </Badge>
      );
    case "uploaded":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Uploaded
        </Badge>
      );
    case "in_review":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Under Review
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Changes Requested
        </Badge>
      );
    case "not_started":
    default:
      return <Badge variant="secondary">Not Started</Badge>;
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Not uploaded";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function GSDocumentsTab({
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSDocumentsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadingDocNumber, setUploadingDocNumber] = useState<number | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<{
    documentNumber: number;
    fileId: string;
    fileName: string;
  } | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Queries
  const {
    data: documentsResponse,
    isLoading,
    isError,
    refetch: refetchDocuments,
  } = useGSDocumentsQuery(applicationId ?? null);

  // Mutations
  const uploadMutation = useGSDocumentUploadMutation(applicationId ?? null);
  const statusMutation = useGSDocumentStatusMutation(applicationId ?? null);
  const autoCompleteMutation = useGSDocumentAutoCompleteMutation(
    applicationId ?? null,
  );
  const deleteFileMutation = useGSDocumentFileDeleteMutation(
    applicationId ?? null,
  );
  const [isCompletingStage, setIsCompletingStage] = useState(false);

  // Transform API data to frontend format
  const documents: GSDocumentData[] = useMemo(() => {
    const rawDocs = documentsResponse?.data?.documents;
    if (rawDocs && Array.isArray(rawDocs)) {
      return transformGSDocuments(rawDocs as unknown[]);
    }
    // Return default empty documents using transformGSDocuments
    return transformGSDocuments(null);
  }, [documentsResponse?.data?.documents]);

  // Filter documents based on search and status
  const visibleDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  const statusCounts = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      },
      {} as Record<GSDocumentBackendStatus, number>,
    );
  }, [documents]);

  const approvedCount = statusCounts.approved || 0;
  const uploadedCount = statusCounts.uploaded || 0;
  const inReviewCount = statusCounts.in_review || 0;
  const notStartedCount = statusCounts.not_started || 0;
  const rejectedCount = statusCounts.rejected || 0;

  // Check if all documents are approved
  const allDocumentsApproved =
    documents.length === documents.length && approvedCount === documents.length;

  // Handle completing the stage
  const handleCompleteStage = async () => {
    if (isStageCompleted || isCompletingStage) return;

    setIsCompletingStage(true);
    try {
      // Refetch documents to ensure we have the latest data
      const { data: freshData } = await refetchDocuments();
      const freshDocs = freshData?.data?.documents;

      if (!freshDocs || !Array.isArray(freshDocs)) {
        toast.error("Failed to verify document status. Please try again.");
        return;
      }

      // Check if all documents are approved on the server (handle case-insensitive)
      // Cast to unknown[] first since the API returns different shape than GSDocument type
      const approvedDocs = (
        freshDocs as unknown as Array<{ status?: string }>
      ).filter((doc) => doc.status?.toLowerCase() === "approved");

      if (approvedDocs.length !== 10) {
        const remaining = 10 - approvedDocs.length;
        toast.error(
          `Cannot complete stage: ${remaining} document${remaining > 1 ? "s" : ""} still need${remaining === 1 ? "s" : ""} approval.`,
        );
        return;
      }

      // Call parent's stage completion handler
      await onStageComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete stage",
      );
    } finally {
      setIsCompletingStage(false);
    }
  };

  // Handle file upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentNumber: number,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isAllowedFileType(file)) {
      toast.error(
        "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      );
      // Reset the file input
      if (fileInputRefs.current[documentNumber]) {
        fileInputRefs.current[documentNumber]!.value = "";
      }
      return;
    }

    setUploadingDocNumber(documentNumber);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadMutation.mutateAsync({ documentNumber, formData });
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document",
      );
    } finally {
      setUploadingDocNumber(null);
      // Reset the file input
      if (fileInputRefs.current[documentNumber]) {
        fileInputRefs.current[documentNumber]!.value = "";
      }
    }
  };

  // Handle status change (staff only)
  const handleStatusChange = async (
    documentNumber: number,
    status: "approved" | "rejected",
  ) => {
    try {
      await statusMutation.mutateAsync({ documentNumber, status });
      toast.success(
        `Document ${status === "approved" ? "approved" : "change requested"}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  // Handle auto-complete all documents (staff only)
  const handleAutoComplete = async () => {
    try {
      await autoCompleteMutation.mutateAsync();
      toast.success("All documents auto-approved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to auto-complete",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Failed to load documents. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Document Progress</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">{uploadedCount}</p>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">{inReviewCount}</p>
              <p className="text-xs text-muted-foreground">Under Review</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Changes Requested</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">{notStartedCount}</p>
              <p className="text-xs text-muted-foreground">Not Started</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">GS Document Checklist</CardTitle>
            {isStaff && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoComplete}
                disabled={autoCompleteMutation.isPending}
              >
                {autoCompleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Auto-Approve All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog
            open={pendingDelete !== null}
            onOpenChange={(open) => {
              if (!open) setPendingDelete(null);
            }}
          >
            <ShadDialogContent>
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
                        documentNumber: pendingDelete.documentNumber,
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

          {/* Search and Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search documents"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="uploaded">Uploaded</option>
                <option value="in_review">Under Review</option>
                <option value="rejected">Changes Requested</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>
          </div>

          {/* Documents Accordion */}
          <Accordion type="single" collapsible className="space-y-2">
            {visibleDocuments.map((doc) => {
              const config = GS_DOCUMENT_CONFIGS.find(
                (c) => c.number === doc.documentNumber,
              );
              const isUploading = uploadingDocNumber === doc.documentNumber;
              const isUpdatingStatus = statusMutation.isPending;
              const visibleFiles = doc.files.filter((file) => !file.deletedAt);
              const hasFiles = visibleFiles.length > 0;
              const latestFile = hasFiles
                ? visibleFiles[visibleFiles.length - 1]
                : null;

              return (
                <AccordionItem
                  key={doc.id}
                  value={doc.id}
                  className="rounded-lg border border-border px-3"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex w-full items-center justify-between gap-3 pr-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-sm font-semibold text-muted-foreground">
                          {doc.documentNumber}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="truncate text-sm font-medium">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {latestFile
                              ? `${latestFile.fileName} - ${formatDate(latestFile.uploadedAt)}`
                              : (config?.description ?? "No file uploaded")}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    {/* Document description */}
                    {config && (
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    )}

                    {/* Uploaded files */}
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
                                    ? ` • ${formatDate(file.uploadedAt)}`
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

                                  {isStaff && (
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      disabled={deleteFileMutation.isPending}
                                      onClick={() =>
                                        setPendingDelete({
                                          documentNumber: doc.documentNumber,
                                          fileId: file.id,
                                          fileName: file.fileName || "this file",
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Upload area */}
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                      <input
                        ref={(el) => {
                          fileInputRefs.current[doc.documentNumber] = el;
                        }}
                        id={`gs-upload-${doc.documentNumber}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(e, doc.documentNumber)
                        }
                        disabled={isUploading}
                      />
                      <label
                        htmlFor={`gs-upload-${doc.documentNumber}`}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground ${
                          isUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
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
                          Accepted: {config?.acceptedFormats ?? "PDF, JPG, PNG"}
                          . Max 10MB.
                        </span>
                      </label>
                    </div>

                    {/* Review notes if change requested */}
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

                    {/* Staff actions */}
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
                            onClick={() =>
                              handleStatusChange(doc.documentNumber, "approved")
                            }
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() =>
                              handleStatusChange(doc.documentNumber, "rejected")
                            }
                            disabled={isUpdatingStatus}
                          >
                            {isUpdatingStatus ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            Request Change
                          </Button>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {visibleDocuments.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No documents match your search.
            </div>
          )}

          {isStaff && allDocumentsApproved && !isStageCompleted && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleCompleteStage}
                disabled={isCompletingStage}
                className="w-full"
              >
                {isCompletingStage ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Complete Documents Stage
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Stage completed message */}
          {isStageCompleted && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Documents stage completed. Proceed to Declarations.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
