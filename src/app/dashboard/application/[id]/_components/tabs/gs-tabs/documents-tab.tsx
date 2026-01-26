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
  Upload,
  XCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useGSStageCompleteMutation,
} from "@/hooks/useGSAssessment.hook";

interface GSDocumentsTabProps {
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => void;
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
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Rejected
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

export default function GSDocumentsTab({
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSDocumentsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadingDocNumber, setUploadingDocNumber] = useState<number | null>(null);
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
  const autoCompleteMutation = useGSDocumentAutoCompleteMutation(applicationId ?? null);
  const stageCompleteMutation = useGSStageCompleteMutation(applicationId ?? null);

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
      {} as Record<GSDocumentBackendStatus, number>
    );
  }, [documents]);

  const approvedCount = statusCounts.approved || 0;
  const uploadedCount = statusCounts.uploaded || 0;
  const inReviewCount = statusCounts.in_review || 0;
  const notStartedCount = statusCounts.not_started || 0;
  const rejectedCount = statusCounts.rejected || 0;

  // Check if all documents are approved
  const allDocumentsApproved = documents.length === 9 && approvedCount === 9;

  // Handle completing the stage
  const handleCompleteStage = async () => {
    if (isStageCompleted) return;

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
      const approvedDocs = (freshDocs as unknown as Array<{ status?: string }>).filter(
        (doc) => doc.status?.toLowerCase() === "approved"
      );

      if (approvedDocs.length !== 9) {
        const remaining = 9 - approvedDocs.length;
        toast.error(
          `Cannot complete stage: ${remaining} document${remaining > 1 ? "s" : ""} still need${remaining === 1 ? "s" : ""} approval.`
        );
        return;
      }

      await stageCompleteMutation.mutateAsync({ stageToComplete: 1 });
      toast.success("Documents stage completed! Moving to Declarations.");
      onStageComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete stage"
      );
    }
  };

  // Handle file upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentNumber: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDocNumber(documentNumber);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadMutation.mutateAsync({ documentNumber, formData });
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document"
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
    status: "approved" | "rejected"
  ) => {
    try {
      await statusMutation.mutateAsync({ documentNumber, status });
      toast.success(`Document ${status === "approved" ? "approved" : "rejected"}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
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
        error instanceof Error ? error.message : "Failed to auto-complete"
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
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-semibold">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
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
                <option value="rejected">Rejected</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>
          </div>

          {/* Documents Accordion */}
          <Accordion type="single" collapsible className="space-y-2">
            {visibleDocuments.map((doc) => {
              const config = GS_DOCUMENT_CONFIGS.find(
                (c) => c.number === doc.documentNumber
              );
              const isUploading = uploadingDocNumber === doc.documentNumber;
              const isUpdatingStatus = statusMutation.isPending;

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
                            {doc.fileName
                              ? `${doc.fileName} - ${formatDate(doc.uploadedAt)}`
                              : config?.description ?? "No file uploaded"}
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

                    {/* File preview if uploaded */}
                    {doc.fileUrl && (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate flex-1">
                          {doc.fileName ?? "Uploaded file"}
                        </span>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
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
                        onChange={(e) => handleFileChange(e, doc.documentNumber)}
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
                            : doc.fileUrl
                              ? "Replace file"
                              : "Drop file here or click to upload"}
                        </span>
                        <span>
                          Accepted: {config?.acceptedFormats ?? "PDF, JPG, PNG"}.
                          Max 10MB.
                        </span>
                      </label>
                    </div>

                    {/* Review notes if rejected */}
                    {doc.status === "rejected" && doc.reviewNotes && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400">
                          Rejection reason:
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
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
                            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              handleStatusChange(doc.documentNumber, "rejected")
                            }
                            disabled={isUpdatingStatus}
                          >
                            {isUpdatingStatus ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            Reject
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
                disabled={stageCompleteMutation.isPending}
                className="w-full"
              >
                {stageCompleteMutation.isPending ? (
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
