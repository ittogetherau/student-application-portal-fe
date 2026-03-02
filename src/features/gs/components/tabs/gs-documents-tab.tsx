"use client";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import GSDocumentAccordionItem from "./gs-document-accordion-item";
import {
  useGSDocumentAutoCompleteMutation,
  useGSDocumentsQuery,
} from "@/hooks/useGSAssessment.hook";
import {
  transformGSDocuments,
  type GSDocumentBackendStatus,
  type GSDocumentData,
} from "@/shared/constants/gs-assessment";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface GSDocumentsTabProps {
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

const REQUIRED_DOCUMENT_NUMBERS = [1, 2, 3, 4, 5] as const;

export default function GSDocumentsTab({
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSDocumentsTabProps) {
  const isDev = process.env.NODE_ENV === "development";
  //
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Queries
  const {
    data: documentsResponse,
    isLoading,
    isError,
    refetch: refetchDocuments,
  } = useGSDocumentsQuery(applicationId ?? null);

  // Mutations
  const autoCompleteMutation = useGSDocumentAutoCompleteMutation(
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

  const requiredDocumentsUploaded = REQUIRED_DOCUMENT_NUMBERS.every(
    (documentNumber) => {
      const requiredDoc = documents.find(
        (doc) => doc.documentNumber === documentNumber,
      );
      if (!requiredDoc) return false;

      const hasNonDeletedFile = requiredDoc.files.some(
        (file) => !file.deletedAt,
      );
      return hasNonDeletedFile || Boolean(requiredDoc.fileUrl);
    },
  );

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

      // Only docs 1-5 are mandatory for stage completion
      const transformedFreshDocs = transformGSDocuments(freshDocs as unknown[]);
      const approvedRequiredDocs = REQUIRED_DOCUMENT_NUMBERS.filter(
        (documentNumber) =>
          transformedFreshDocs.find(
            (doc) => doc.documentNumber === documentNumber,
          )?.status === "approved",
      ).length;

      if (approvedRequiredDocs !== REQUIRED_DOCUMENT_NUMBERS.length) {
        const remaining =
          REQUIRED_DOCUMENT_NUMBERS.length - approvedRequiredDocs;
        toast.error(
          `Cannot complete stage: ${remaining} required document${remaining > 1 ? "s" : ""} still need${remaining === 1 ? "s" : ""} approval.`,
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
            {isStaff && isDev && (
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
                <option value="rejected">Changes Requested</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>
          </div>

          {/* Documents Accordion */}
          {(() => {
            const splitIndex = Math.ceil(visibleDocuments.length / 2);
            const leftColumn = visibleDocuments.slice(0, splitIndex);
            const rightColumn = visibleDocuments.slice(splitIndex);

            return (
              <div className="grid grid-cols-2 gap-4">
                <Accordion
                  type="single"
                  collapsible
                  className="space-y-2 flex flex-col"
                >
                  {leftColumn.map((doc) => (
                    <GSDocumentAccordionItem
                      key={doc.id}
                      applicationId={applicationId}
                      doc={doc}
                      isStaff={isStaff}
                    />
                  ))}
                </Accordion>

                <Accordion
                  type="single"
                  collapsible
                  className="space-y-2 flex flex-col"
                >
                  {rightColumn.map((doc) => (
                    <GSDocumentAccordionItem
                      key={doc.id}
                      applicationId={applicationId}
                      doc={doc}
                      isStaff={isStaff}
                    />
                  ))}
                </Accordion>
              </div>
            );
          })()}

          {visibleDocuments.length > 0 && (
            <p className="text-xs text-muted-foreground">
              You can add multiple files by dropping or selecting them one at a
              time.
            </p>
          )}

          {visibleDocuments.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No documents match your search.
            </div>
          )}
        </CardContent>

        {(isStageCompleted || isStaff || requiredDocumentsUploaded) && (
          <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4">
            {isStageCompleted ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Documents stage completed. Proceed to Declarations.
                </span>
              </div>
            ) : isStaff ? (
              <Button
                onClick={handleCompleteStage}
                disabled={!requiredDocumentsUploaded || isCompletingStage}
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
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                <Clock className="h-5 w-5 mt-0.5" />
                <span className="text-sm font-medium">
                  Awaiting staff review. You’ll be notified if changes are
                  needed.
                </span>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
