"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import { siteRoutes } from "@/constants/site-routes";
import CreateThreadForm from "@/features/threads/components/forms/create-thread-form";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  useApplicationDocumentsQuery,
  useDocumentTypesQuery,
  useUploadDocument,
  useVerifyDocument,
} from "@/shared/hooks/document.hook";
import {
  useApplicationChangeStageMutation,
  useApplicationGetQuery,
} from "@/shared/hooks/use-applications";
import {
  DROPZONE_ACCEPT,
  MAX_FILE_SIZE_BYTES,
  isAllowedFileType,
} from "@/shared/lib/document-file-helpers";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "react-hot-toast";

function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
//

const isAllowedFileSize = (file: File): boolean =>
  file.size <= MAX_FILE_SIZE_BYTES;

type CoeDocument = {
  id: string;
  status?: string;
  document_type_code?: string;
  file_size_bytes?: number;
  uploaded_at?: string;
  view_url?: string;
};

function getStatusBadge(status?: string) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Pending
        </Badge>
      );
    case "verified":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Verified
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Changes Requested
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
          Expired
        </Badge>
      );
    case "deleted":
      return (
        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
          Deleted
        </Badge>
      );
    default:
      return <Badge variant="secondary">Not Verified</Badge>;
  }
}

type UploadDropzoneProps = {
  onDrop: (files: File[] | null) => void | Promise<void>;
  isUploading: boolean;
};

const UploadDropzone = ({ onDrop, isUploading }: UploadDropzoneProps) => (
  <Dropzone
    onDrop={(acceptedFiles) => onDrop(acceptedFiles)}
    onError={(error) => {
      if (error?.message) {
        toast.error(error.message);
      }
    }}
    accept={DROPZONE_ACCEPT}
    maxFiles={1}
    maxSize={MAX_FILE_SIZE_BYTES}
    disabled={isUploading}
    className={isUploading ? "opacity-60" : undefined}
  >
    <DropzoneEmptyState />
  </Dropzone>
);

type DocumentSummaryProps = {
  doc: CoeDocument;
};

const DocumentSummary = ({ doc }: DocumentSummaryProps) => (
  <section className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border">
    <FileText className="h-8 w-8 text-primary/40" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">
        {doc.document_type_code ?? "Document"}
      </p>
      <p className="text-xs text-muted-foreground">
        {formatFileSize(doc.file_size_bytes)} -{" "}
        {formatUtcToFriendlyLocal(doc.uploaded_at)}
      </p>
    </div>
    <div className="flex items-center gap-2">
      {doc.view_url && (
        <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
          <a href={doc.view_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </a>
        </Button>
      )}
    </div>
  </section>
);

type StaffVerifyActionsProps = {
  docId: string;
  applicationId?: string;
  defaultTitle: string;
  isPending: boolean;
  isPendingForDoc: boolean;
  onVerify: (
    docId: string,
    status: "verified" | "rejected",
    notes?: string,
  ) => void;
};

const StaffVerifyActions = ({
  docId,
  applicationId,
  defaultTitle,
  isPending,
  isPendingForDoc,
  onVerify,
}: StaffVerifyActionsProps) => {
  const [requestOpen, setRequestOpen] = useState(false);
  const isBusy = isPending && isPendingForDoc;

  return (
    <div className="flex items-center gap-2 pt-3 border-t">
      <span className="text-xs font-semibold text-muted-foreground mr-2">
        Admin Only:
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          onClick={() => onVerify(docId, "verified")}
          disabled={isBusy}
        >
          <CheckCircle2 className="h-3 w-3 mr-1.5" />
          approve
        </Button>

        <Dialog
          open={requestOpen}
          onOpenChange={(open) => {
            setRequestOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              disabled={isBusy}
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Request Change
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request changes</DialogTitle>
              <DialogDescription>
                Create a thread to request changes before the agent re-uploads.
              </DialogDescription>
            </DialogHeader>

            {applicationId ? (
              <CreateThreadForm
                applicationId={applicationId}
                currentRole="agent"
                defaultTitle={defaultTitle}
                onSuccess={() => {
                  onVerify(docId, "rejected");
                  setRequestOpen(false);
                }}
              />
            ) : (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                Missing application id. Unable to create a thread.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

type UploadCardProps = {
  title: string;
  description?: string;
  badge?: ReactNode;
  onDrop: (files: File[] | null) => void | Promise<void>;
  isUploading: boolean;
};

const UploadCard = ({
  title,
  description,
  badge,
  onDrop,
  isUploading,
}: UploadCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {title}
          </CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {badge}
      </div>
    </CardHeader>
    <CardContent>
      <UploadDropzone onDrop={onDrop} isUploading={isUploading} />
    </CardContent>
  </Card>
);

type ReuploadDialogProps = {
  doc: CoeDocument;
  title?: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrop: (files: File[] | null) => Promise<boolean>;
  isUploading: boolean;
};

const ReuploadDialog = ({
  open,
  onOpenChange,
  onDrop,
  isUploading,
  title = "Re-upload COE Payment Proof",
  description = "Review the current document status and upload a new version.",
}: ReuploadDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button size="sm" variant="outline" className="h-7 text-xs">
        Upload Again
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl w-[95vw] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <UploadDropzone
        onDrop={async (files) => {
          const didUpload = await onDrop(files);
          if (didUpload) onOpenChange(false);
        }}
        isUploading={isUploading}
      />
    </DialogContent>
  </Dialog>
);

const CoeTab = ({ applicationId }: { applicationId?: string }) => {
  const router = useRouter();
  // get user role
  const { data: session } = useSession();
  const ROLE = session?.user.role;
  const isStaff =
    ROLE === USER_ROLE.STAFF || Boolean(session?.user.staff_admin);

  // mutations
  const uploadMutation = useUploadDocument();
  const verifyMutation = useVerifyDocument();
  const changeStage = useApplicationChangeStageMutation(applicationId ?? "");

  const handleStageChange = (str: APPLICATION_STAGE) => {
    changeStage.mutateAsync({ to_stage: str });
  };

  // get all documents
  const {
    data: appDocsResponse,
    isLoading: isDocsLoading,
    isError: isDocsError,
    error: docsError,
    refetch: refetchDocs,
  } = useApplicationDocumentsQuery(applicationId || null);
  const agentCoeItem = appDocsResponse?.data?.find(
    (e) => e.document_type_code === "COE_PAYMENT_PROOF",
  );
  const staffCoeItem = appDocsResponse?.data?.find(
    (e) => e.document_type_code === "COE_DOCUMENTS",
  );

  const { data: applicationResponse } = useApplicationGetQuery(
    applicationId || null,
  );
  const isCoeStage =
    applicationResponse?.data?.current_stage === APPLICATION_STAGE.COE_ISSUED;

  // get doc types
  const {
    data: docTypesResponse,
    isLoading: isDocTypesLoading,
    isError: isDocTypesError,
    error: docTypesError,
    refetch: refetchDocTypes,
  } = useDocumentTypesQuery();
  const coeDocTypes = useMemo(() => {
    if (!docTypesResponse?.data) return [];
    return docTypesResponse.data.filter((dt) => dt.stage === "coe");
  }, [docTypesResponse]);

  // docs for agent and staff
  const agentUploadRequiredDoc = coeDocTypes.find(
    (e) => e.code === "COE_PAYMENT_PROOF",
  );
  const staffUploadRequiredDoc = coeDocTypes.find(
    (e) => e.code === "COE_DOCUMENTS",
  );

  const [reuploadOpen, setReuploadOpen] = useState(false);
  const [staffReuploadOpen, setStaffReuploadOpen] = useState(false);

  const isUploading = uploadMutation.isPending;

  const handleAgentUploadFIle = async (files: File[] | null) => {
    if (!files?.length || !applicationId || !agentUploadRequiredDoc)
      return false;
    const file = files[0];

    if (!isAllowedFileType(file)) {
      toast.error(
        "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      );
      return false;
    }

    if (!isAllowedFileSize(file)) {
      toast.error("File size must be 10MB or less.");
      return false;
    }

    try {
      await uploadMutation.mutateAsync({
        application_id: applicationId,
        document_type_id: agentUploadRequiredDoc.id,
        file: file,
      });
      toast.success("Document uploaded successfully");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleStaffUploadFIle = async (files: File[] | null) => {
    if (!files?.length || !applicationId || !staffUploadRequiredDoc)
      return false;

    const file = files[0];

    if (!isAllowedFileType(file)) {
      toast.error(
        "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      );
      return false;
    }

    if (!isAllowedFileSize(file)) {
      toast.error("File size must be 10MB or less.");
      return false;
    }

    try {
      await uploadMutation.mutateAsync({
        application_id: applicationId,
        document_type_id: staffUploadRequiredDoc.id,
        file: file,
      });
      toast.success("Document uploaded successfully");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // COE document verification
  const handleVerifyClick = async (
    docId: string,
    status: "verified" | "rejected",
    notes?: string,
  ) => {
    try {
      await verifyMutation.mutateAsync({
        documentId: docId,
        status,
        notes,
        applicationId: applicationId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isStageCompleted = !!agentCoeItem && !!staffCoeItem;
  const isAgentDocVerified = agentCoeItem?.status === "verified";
  const shouldShowReupload = agentCoeItem?.status === "rejected";

  const isLoading = isDocsLoading || isDocTypesLoading;
  const isError = isDocsError || isDocTypesError;
  const errorMessage =
    (docsError instanceof Error ? docsError.message : "") ||
    (docTypesError instanceof Error ? docTypesError.message : "") ||
    "Failed to load COE documents. Please try again.";

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
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm">{errorMessage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                await Promise.all([refetchDocs(), refetchDocTypes()]);
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const showAgentUploadCard = !agentCoeItem && agentUploadRequiredDoc;

  return (
    <div className="space-y-4">
      {isStageCompleted && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">COE documents uploaded.</p>
                <p className="text-xs text-muted-foreground">
                  This COE stage is completed.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isCoeStage ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleStageChange(APPLICATION_STAGE.ACCEPTED)
                    }
                  >
                    Accept
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!applicationId) return;
                    router.push(
                      siteRoutes.dashboard.application.id.documents(
                        applicationId,
                      ),
                    );
                  }}
                >
                  Open Documents Tab
                </Button>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Completed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent payment proof */}
      {agentCoeItem ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  COE Payment Proof
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {agentCoeItem.status === "verified"
                    ? "Payment proof verified."
                    : agentCoeItem.status === "rejected"
                      ? "Changes requested. Please upload a corrected document."
                      : "Uploaded. Awaiting verification."}
                </p>
              </div>
              {getStatusBadge(agentCoeItem.status)}
            </div>
          </CardHeader>
          <CardContent>
            <DocumentSummary doc={agentCoeItem} />

            {/* Admin actions (pending only) */}
            {isStaff && agentCoeItem.status !== "verified" && (
              <StaffVerifyActions
                docId={agentCoeItem.id}
                applicationId={applicationId}
                defaultTitle="Changes requested for - COE Payment Proof"
                isPending={verifyMutation.isPending}
                isPendingForDoc={
                  verifyMutation.variables?.documentId === agentCoeItem.id
                }
                onVerify={handleVerifyClick}
              />
            )}

            {/* Agent re-upload on changes requested */}
            {!isStaff && shouldShowReupload && (
              <div className="flex items-center justify-between gap-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Changes requested. Please re-upload your payment proof.
                </p>
                <ReuploadDialog
                  doc={agentCoeItem}
                  open={reuploadOpen}
                  onOpenChange={setReuploadOpen}
                  onDrop={handleAgentUploadFIle}
                  isUploading={isUploading}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : showAgentUploadCard ? (
        <UploadCard
          title="Upload COE Payment Proof"
          description="Upload the COE payment confirmation file to proceed with COE issuance."
          onDrop={async (files) => {
            await handleAgentUploadFIle(files);
          }}
          isUploading={isUploading}
        />
      ) : (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">COE Issuance Process</h2>
              <p className="text-sm text-muted-foreground">
                Waiting for the agent to upload the COE payment proof.
              </p>
            </div>

            <Badge
              variant="outline"
              className="text-sm py-1 px-3 bg-background"
            >
              <Clock className="h-3.5 w-3.5 mr-2 text-amber-500" />
              Waiting
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* COE document uploaded by staff/admin */}
      {staffCoeItem ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  COE Document
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {staffCoeItem.status === "verified"
                    ? "COE document verified."
                    : staffCoeItem.status === "rejected"
                      ? "Changes requested."
                      : "COE document uploaded."}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DocumentSummary doc={staffCoeItem} />

            {isStaff && (
              <div className="flex items-center justify-between gap-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Upload a new version of the COE document if needed.
                </p>
                <ReuploadDialog
                  doc={staffCoeItem}
                  title="Re-upload COE Document"
                  description="Upload a new version of the COE document."
                  open={staffReuploadOpen}
                  onOpenChange={setStaffReuploadOpen}
                  onDrop={handleStaffUploadFIle}
                  isUploading={isUploading}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : isAgentDocVerified ? (
        isStaff ? (
          <UploadCard
            title="Upload COE Document"
            description="Upload the COE document for the agent."
            onDrop={async (files) => {
              await handleStaffUploadFIle(files);
            }}
            isUploading={isUploading}
          />
        ) : (
          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">COE Document</h2>
                <p className="text-sm text-muted-foreground">
                  Waiting for a Churchill representative to upload the COE
                  document.
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-sm py-1 px-3 bg-background"
              >
                <Clock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                Waiting
              </Badge>
            </CardContent>
          </Card>
        )
      ) : null}
    </div>
  );
};

export default CoeTab;
