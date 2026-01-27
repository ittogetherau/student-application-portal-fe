"use client";

import {
  ArrowLeft,
  CheckCircle2,
  CircleCheck,
  Clock,
  Eye,
  FileText,
  Loader2,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { GSScreeningForm } from "@/app/dashboard/application/gs-form/_components/gs-screening-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGSAgentDeclarationQuery,
  useGSDeclarationReviewMutation,
  useGSStudentDeclarationQuery,
  useGSStudentDeclarationResendMutation,
} from "@/hooks/useGSAssessment.hook";
import { cn } from "@/lib/utils";

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

export default function GSDeclarationsTab({
  applicationId,
  isStaff = false,
  isStageCompleted = false,
  onStageComplete,
}: GSDeclarationsTabProps) {
  const [viewState, setViewState] = useState<ViewState>("cards");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: studentDeclaration } = useGSStudentDeclarationQuery(
    applicationId ?? null,
  );
  const { data: agentDeclaration } = useGSAgentDeclarationQuery(
    applicationId ?? null,
  );
  const resendMutation = useGSStudentDeclarationResendMutation(
    applicationId ?? null,
  );
  const reviewMutation = useGSDeclarationReviewMutation(applicationId ?? null);

  const studentDeclarationData = studentDeclaration?.data;
  const agentDeclarationData = agentDeclaration?.data;

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

  if (viewState === "cards") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Student Declaration Form
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Student must complete their section
                  </p>
                </div>
                {getStatusBadge(studentStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {/* {studentStatus === "submitted" && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() =>
                      resendMutation.mutate({ rotate_token: true })
                    }
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Resend Form
                  </Button>
                )} */}
                {!isStaff && (
                  <Button
                    className="w-full gap-2"
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
                    {isStudentVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Student Verified
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Verify Student Declaration
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Agent Declaration Form
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Agent/staff must complete this section
                  </p>
                </div>
                {getStatusBadge(agentStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {!isStaff && (
                  <Button
                    className="w-full gap-2"
                    onClick={() =>
                      setViewState({ mode: "edit", declarationType: "agent" })
                    }
                  >
                    <FileText className="h-4 w-4" />
                    Edit Form
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
            className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2"
            size="lg"
            onClick={handleVerifyAndProceed}
            disabled={isProcessing}
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
              Declarations stage completed. Proceed to Schedule.
            </span>
          </div>
        )}
      </div>
    );
  }

  const isReadOnly = viewState.mode === "view";
  const declarationType = viewState.declarationType;

  // For agent form, merge student data with agent data so student details are pre-filled
  const getInitialData = () => {
    if (declarationType === "student") {
      return studentDeclaration?.data?.data;
    }
    // For agent form, include student data as base
    const studentData = studentDeclaration?.data?.data;
    const agentData = agentDeclaration?.data?.data;
    return { ...studentData, ...agentData };
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
        applicationId={applicationId}
        handleBack={handleBack}
      />
    </div>
  );
}
