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
import { USER_ROLE } from "@/constants/types";
import {
  useApplicationDocumentsQuery,
  useDocumentTypesQuery,
  useUploadDocument,
  useVerifyDocument,
} from "@/hooks/document.hook";
import {
  DROPZONE_ACCEPT,
  MAX_FILE_SIZE_BYTES,
  isAllowedFileType,
} from "@/lib/document-file-helpers";
import { formatUtcToFriendlyLocal } from "@/lib/format-utc-to-local";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryState } from "nuqs";
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
  onDrop: (files: File[] | null) => void;
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
  isPending: boolean;
  isPendingForDoc: boolean;
  onVerify: (docId: string, status: "verified" | "rejected") => void;
};

const StaffVerifyActions = ({
  docId,
  isPending,
  isPendingForDoc,
  onVerify,
}: StaffVerifyActionsProps) => (
  <div className="flex items-center gap-2 pt-3 border-t">
    <span className="text-xs font-semibold text-muted-foreground mr-2">
      Staff Only:
    </span>
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        onClick={() => onVerify(docId, "verified")}
        disabled={isPending && isPendingForDoc}
      >
        <CheckCircle2 className="h-3 w-3 mr-1.5" />
        approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
        onClick={() => onVerify(docId, "rejected")}
        disabled={isPending && isPendingForDoc}
      >
        <RefreshCw className="h-3 w-3 mr-1.5" />
        Request Change
      </Button>
    </div>
  </div>
);

type UploadCardProps = {
  title: string;
  description?: string;
  badge?: ReactNode;
  onDrop: (files: File[] | null) => void;
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrop: (files: File[] | null) => void;
  isUploading: boolean;
};

const ReuploadDialog = ({
  open,
  onOpenChange,
  onDrop,
  isUploading,
}: ReuploadDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button size="sm" variant="outline" className="h-7 text-xs">
        Upload Again
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl w-[95vw] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Re-upload COE Payment Proof</DialogTitle>
        <DialogDescription>
          Review the current document status and upload a new version.
        </DialogDescription>
      </DialogHeader>
      <div className="grid items-stretch gap-4 grid-cols-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Upload New Document</CardTitle>
              <Badge variant="secondary">Upload Again</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <UploadDropzone onDrop={onDrop} isUploading={isUploading} />
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  </Dialog>
);

const CoeTab = ({
  applicationId,
}: {
  applicationId?: string;
  isStaff?: boolean;
}) => {
  const [_, setTabNavigation] = useQueryState("application_tab");
  // get user role
  const { data: session } = useSession();
  const ROLE = session?.user.role;

  // mutations
  const uploadMutation = useUploadDocument();
  const verifyMutation = useVerifyDocument();

  // get all documents
  const { data: appDocsResponse } = useApplicationDocumentsQuery(
    applicationId || null,
  );
  const agentCoeItem = appDocsResponse?.data?.find(
    (e) => e.document_type_code === "COE_PAYMENT_PROOF",
  );
  const staffCoeItem = appDocsResponse?.data?.find(
    (e) => e.document_type_code === "COE_DOCUMENTS",
  );

  // get doc types
  const { data: docTypesResponse } = useDocumentTypesQuery();
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

  const isUploading = uploadMutation.isPending;

  const handleAgentUploadFIle = async (files: File[] | null) => {
    if (!files?.length || !applicationId || !agentUploadRequiredDoc) return;
    const file = files[0];

    if (!isAllowedFileType(file)) {
      toast.error(
        "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      );
      return;
    }

    if (!isAllowedFileSize(file)) {
      toast.error("File size must be 10MB or less.");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        application_id: applicationId,
        document_type_id: agentUploadRequiredDoc.id,
        file: file,
      });
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const handleStaffUploadFIle = async (files: File[] | null) => {
    if (!files?.length || !applicationId || !staffUploadRequiredDoc) return;

    const file = files[0];

    if (!isAllowedFileType(file)) {
      toast.error(
        "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      );
      return;
    }

    if (!isAllowedFileSize(file)) {
      toast.error("File size must be 10MB or less.");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        application_id: applicationId,
        document_type_id: staffUploadRequiredDoc.id,
        file: file,
      });
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error(error);
    }
  };

  // COE document verification
  const handleVerifyClick = async (
    docId: string,
    status: "verified" | "rejected",
  ) => {
    try {
      await verifyMutation.mutateAsync({
        documentId: docId,
        status,
        applicationId: applicationId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isStageCompleted = !!agentCoeItem && !!staffCoeItem;
  const isAgentDocVerified = agentCoeItem?.status === "verified";
  const shouldShowReupload =
    !!agentCoeItem && agentCoeItem.status !== "verified";

  if (isStageCompleted) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Both documents uploaded.</p>
              <p className="text-xs text-muted-foreground">
                This COE stage is completed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTabNavigation("documents")}
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
    );
  }

  if (agentCoeItem)
    return (
      <>
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    COE Payment Proof
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAgentDocVerified
                      ? "Document verified. Proceed to staff upload."
                      : "Document uploaded. Awaiting verification."}
                  </p>
                </div>
                {getStatusBadge(agentCoeItem.status)}
              </div>
            </CardHeader>
            <CardContent>
              <DocumentSummary doc={agentCoeItem} />

              {ROLE === USER_ROLE.STAFF && !isAgentDocVerified && (
                <StaffVerifyActions
                  docId={agentCoeItem.id}
                  isPending={verifyMutation.isPending}
                  isPendingForDoc={
                    verifyMutation.variables?.documentId === agentCoeItem.id
                  }
                  onVerify={handleVerifyClick}
                />
              )}

              {ROLE !== USER_ROLE.STAFF && shouldShowReupload && (
                <div className="flex items-center justify-between gap-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Document not verified. Please re-upload your document.
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
        </div>
        {isAgentDocVerified && ROLE === USER_ROLE.STAFF && (
          <UploadCard
            title="Upload COE Document"
            description="Please upload the COE documnet for agent"
            onDrop={handleStaffUploadFIle}
            isUploading={isUploading}
          />
        )}
      </>
    );

  // if agent hasnt submmitted pdf
  return (
    <>
      {ROLE === USER_ROLE.STAFF ? (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">COE Issuance Process</h2>
              <p className="text-sm text-muted-foreground">
                Awating Agent to upload COE payment confirmation file.
              </p>
            </div>

            <Badge
              variant="outline"
              className="text-sm py-1 px-3 bg-background"
            >
              <Clock className="h-3.5 w-3.5 mr-2 text-amber-500" />
            </Badge>
          </CardContent>
        </Card>
      ) : (
        agentUploadRequiredDoc && (
          <UploadCard
            title="Upload Required Documents"
            description="Please upload the following documents to proceed with COE issuance"
            onDrop={handleAgentUploadFIle}
            isUploading={isUploading}
          />
        )
      )}
    </>
  );
};

export default CoeTab;
