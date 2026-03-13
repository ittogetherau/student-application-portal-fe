"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GSDeclarationPdfDownloadButton } from "@/features/gs/components/forms/gs-declaration-pdf-download-button";
import { GSScreeningForm } from "@/features/gs/components/forms/gs-screening-form";
import {
  useGSAgentDeclarationQuery,
  useGSDeclarationReviewMutation,
  useGSStudentDeclarationQuery,
} from "@/hooks/useGSAssessment.hook";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";
import { cn } from "@/shared/lib/utils";
import type { ApplicationDetailResponse } from "@/service/application.service";
import {
  ArrowLeft,
  CheckCircle2,
  CircleCheck,
  Clock,
  Edit2,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Send,
  UserStar,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { GSScreeningFormValues } from "../../utils/gs-screening.validation";

type DeclarationType = "student" | "agent";

type ViewState =
  | "cards"
  | { mode: "view" | "edit"; declarationType: DeclarationType };

interface GSDeclarationsTabProps {
  applicationId?: string;
  isStaff?: boolean;
  isStageCompleted?: boolean;
  onStageComplete?: () => Promise<void>;
}

// Get status badge based on declaration status
const getStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "approved":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500 text-emerald-600 gap-1"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </Badge>
      );
    case "submitted":
      return (
        <Badge
          variant="outline"
          className="border-amber-500 text-amber-600 gap-1"
        >
          <Clock className="h-3.5 w-3.5" />
          Pending Review
        </Badge>
      );
    case "draft":
      return (
        <Badge
          variant="outline"
          className="border-blue-400 text-blue-500 gap-1"
        >
          <Send className="h-3.5 w-3.5" />
          Sent
        </Badge>
      );
    default:
      return null;
  }
};

const isNonEmptyRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.keys(value as Record<string, unknown>).length > 0;
};

const normalizeDateForInput = (value: unknown): string | undefined => {
  const raw = String(value ?? "").trim();
  if (raw === "") return undefined;

  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso?.[1]) return iso[1];

  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const day = String(slash[1]).padStart(2, "0");
    const month = String(slash[2]).padStart(2, "0");
    const year = String(slash[3]);
    return `${year}-${month}-${day}`;
  }

  return raw;
};

const mapApplicationToGSPrefill = (
  application: ApplicationDetailResponse | null | undefined,
): Partial<GSScreeningFormValues> | undefined => {
  if (!application) return undefined;

  const personal = application.personal_details ?? null;
  if (!personal || typeof personal !== "object") return undefined;

  const givenName = String(
    (personal as Record<string, unknown>).given_name ?? "",
  ).trim();
  const familyName = String(
    (personal as Record<string, unknown>).family_name ?? "",
  ).trim();
  const passportNumber = String(
    (personal as Record<string, unknown>).passport_number ?? "",
  ).trim();
  const email = String(
    (personal as Record<string, unknown>).email ?? "",
  ).trim();
  const dateOfBirth = normalizeDateForInput(
    (personal as Record<string, unknown>).date_of_birth,
  );

  const studentId = String(
    application.reference_number ?? application.tracking_code ?? "",
  ).trim();

  const applicantFullName = `${givenName} ${familyName}`.trim();

  const out: Partial<GSScreeningFormValues> = {};
  if (givenName) out.firstName = givenName;
  if (familyName) out.lastName = familyName;
  if (dateOfBirth) out.dateOfBirth = dateOfBirth;
  if (studentId) out.studentId = studentId;
  if (passportNumber) out.passportNumber = passportNumber;
  if (email) out.email = email;
  if (applicantFullName) out.applicantFullName = applicantFullName;
  return out;
};

export default function GSDeclarationsTab({
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSDeclarationsTabProps) {
  const [viewState, setViewState] = useState<ViewState>("cards");
  const [isProcessing, setIsProcessing] = useState(false);

  const studentDeclarationQuery = useGSStudentDeclarationQuery(
    applicationId ?? null,
  );
  const agentDeclarationQuery = useGSAgentDeclarationQuery(
    applicationId ?? null,
  );

  const reviewMutation = useGSDeclarationReviewMutation(applicationId ?? null);

  const studentDeclarationData = studentDeclarationQuery.data?.data;
  const agentDeclarationData = agentDeclarationQuery.data?.data;
  const activeView = viewState === "cards" ? null : viewState;
  const activeDeclarationType = activeView?.declarationType ?? null;

  const hasDeclarationData =
    isNonEmptyRecord(studentDeclarationData?.data) ||
    isNonEmptyRecord(agentDeclarationData?.data);
  const declarationPdfData = hasDeclarationData
    ? ({
        ...(studentDeclarationData?.data ?? {}),
        ...(agentDeclarationData?.data ?? {}),
      } as GSScreeningFormValues)
    : null;

  const studentDeclarationFormData = isNonEmptyRecord(
    studentDeclarationData?.data,
  )
    ? (studentDeclarationData?.data as Partial<GSScreeningFormValues>)
    : undefined;
  const studentUploadedDocuments = Array.isArray(
    studentDeclarationQuery.data?.data?.uploaded_documents,
  )
    ? studentDeclarationQuery.data?.data?.uploaded_documents
    : [];

  const shouldPrefillFromApplication =
    Boolean(applicationId) &&
    Boolean(activeDeclarationType) &&
    studentDeclarationQuery.isFetched &&
    !isNonEmptyRecord(studentDeclarationData?.data);

  const applicationQuery = useApplicationGetQuery(
    shouldPrefillFromApplication ? (applicationId ?? null) : null,
  );
  const prefillData = shouldPrefillFromApplication
    ? mapApplicationToGSPrefill(applicationQuery.data?.data ?? null)
    : undefined;

  // Derive status from declaration responses
  const studentStatus = studentDeclarationData?.status;
  const agentStatus = agentDeclarationData?.status;

  // Determine checkbox visibility (show when submitted or approved)
  const showStudentCheckbox =
    studentStatus === "submitted" || studentStatus === "approved";
  const showAgentCheckbox =
    agentStatus === "submitted" || agentStatus === "approved";

  // Determine verification state (approved = verified)
  const isStudentVerified = studentStatus === "approved";
  const isAgentVerified = agentStatus === "approved";

  // Show proceed button only when both are verified
  const canProceed = isStudentVerified && isAgentVerified;

  const handleBack = () => setViewState("cards");

  const handleVerify = async (actor: "student" | "agent") => {
    try {
      await reviewMutation.mutateAsync({
        actor,
        payload: { status: "approved" },
      });
      toast.success(
        `${actor === "student" ? "Student" : "Agent"} declaration verified`,
      );
    } catch {
      // Error toast is shown by the hook
    }
  };

  // Approve both declarations and proceed to next stage
  const handleVerifyAndProceed = async () => {
    if (isStageCompleted) return;

    setIsProcessing(true);
    try {
      // Approve student declaration if not already approved
      if (!isStudentVerified) {
        await reviewMutation.mutateAsync({
          actor: "student",
          payload: { status: "approved" },
        });
      }

      // Approve agent declaration if not already approved
      if (!isAgentVerified) {
        await reviewMutation.mutateAsync({
          actor: "agent",
          payload: { status: "approved" },
        });
      }

      // Call parent's stage completion handler
      await onStageComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to verify declarations",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeView == null) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <p className="p-2 bg-primary/5 border border-primary/50 text-primary rounded-lg ">
                    <GraduationCap />
                  </p>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Student Declaration Form
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Student must complete their section
                    </p>
                  </div>
                </div>
                {getStatusBadge(studentStatus)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {!isStudentVerified && (
                  <Button
                    className="w-full gap-2"
                    variant={"secondary"}
                    onClick={() =>
                      setViewState({ mode: "edit", declarationType: "student" })
                    }
                  >
                    <FileText className="h-4 w-4" />
                    Fill on Behalf of Student
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    setViewState({ mode: "view", declarationType: "student" })
                  }
                >
                  <Eye className="h-4 w-4" />
                  View Form
                </Button>
              </div>

              {isStaff && showStudentCheckbox && (
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    id="verify-student"
                    onClick={() => handleVerify("student")}
                    disabled={isStudentVerified || reviewMutation.isPending}
                    variant={isStudentVerified ? "default" : "outline"}
                    className={cn("w-full gap-2")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isStudentVerified
                      ? "Student Verified"
                      : "Verify Student Declaration"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <p className="p-2 bg-primary/5 border border-primary/50 text-primary rounded-lg ">
                    <UserStar className="" />
                  </p>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Agent Declaration Form
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Agent/staff must complete this section
                    </p>
                  </div>
                </div>
                {getStatusBadge(agentStatus)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {!isAgentVerified && (
                  <Button
                    className="w-full gap-2"
                    onClick={() =>
                      setViewState({ mode: "edit", declarationType: "agent" })
                    }
                  >
                    <Edit2 className="h-4 w-4" />
                    {isStaff ? "Complete as Admin" : "Complete Form"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    setViewState({ mode: "view", declarationType: "agent" })
                  }
                >
                  <Eye className="h-4 w-4" />
                  View Form
                </Button>
              </div>
              {isStaff && showAgentCheckbox && (
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    id="verify-agent"
                    onClick={() => handleVerify("agent")}
                    disabled={isAgentVerified || reviewMutation.isPending}
                    variant={isAgentVerified ? "default" : "outline"}
                    className={cn("w-full gap-2")}
                  >
                    {isAgentVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Agent Verified
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Verify Agent Declaration
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Proceed Button - staff only, both verified, stage not completed */}
        {isStaff && canProceed && !isStageCompleted && (
          <Button
            size="lg"
            onClick={handleVerifyAndProceed}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CircleCheck className="h-4 w-4" />
            )}
            Verify Declarations & Proceed to Interview Scheduling
          </Button>
        )}

        {isStageCompleted && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isStaff
                ? "Declarations stage completed. Proceed to Schedule."
                : "All documents verified - Please wait for agent to proceed to next stage."}
            </span>
          </div>
        )}

        {isStageCompleted && (
          <div className="flex justify-end">
            <GSDeclarationPdfDownloadButton
              data={declarationPdfData}
              uploadedDocuments={studentUploadedDocuments}
              applicationId={applicationId}
              variant="secondary"
              className="gap-2"
              buttonText="Declaration PDF"
            />
          </div>
        )}
      </div>
    );
  }

  const isReadOnly = activeView.mode === "view";
  const declarationType = activeView.declarationType;

  const isLoadingDeclarations =
    declarationType === "agent"
      ? studentDeclarationQuery.isLoading || agentDeclarationQuery.isLoading
      : studentDeclarationQuery.isLoading;
  const isLoadingPrefill =
    shouldPrefillFromApplication && applicationQuery.isLoading;
  if (isLoadingDeclarations || isLoadingPrefill) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // For agent form, merge student data with agent data so student details are pre-filled
  const pickAgentDeclarationFields = (
    data?: Record<string, unknown> | null,
  ) => {
    if (!data) return {};
    const toOptionalString = (value: unknown) => {
      const raw = typeof value === "string" ? value : String(value ?? "");
      const trimmed = raw.trim();
      return trimmed === "" ? undefined : trimmed;
    };
    return {
      agentAgencyName: toOptionalString(data.agentAgencyName),
      agentCounsellorName: toOptionalString(data.agentCounsellorName),
      agentDate: toOptionalString(data.agentDate),
      agentSignature: toOptionalString(data.agentSignature),
    };
  };

  const getInitialData = () => {
    if (declarationType === "student") {
      return studentDeclarationFormData;
    }
    // For agent form, include student data as base
    const studentData = studentDeclarationFormData;
    const agentData = agentDeclarationData?.data;
    return { ...studentData, ...pickAgentDeclarationFields(agentData) };
  };
  const initialData = getInitialData();
  const breadcrumbLabel =
    declarationType === "student"
      ? isReadOnly
        ? "View Student Declaration"
        : "Fill Student Declaration"
      : "View Agent Declaration";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Declarations
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{breadcrumbLabel}</span>
      </div>

      <GSScreeningForm
        currentView={declarationType}
        readOnly={isReadOnly}
        initialData={initialData}
        prefillData={prefillData}
        initialUploadedDocuments={studentUploadedDocuments}
        applicationId={applicationId}
        handleBack={handleBack}
      />
    </div>
  );
}
