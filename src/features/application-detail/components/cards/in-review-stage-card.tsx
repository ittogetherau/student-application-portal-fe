"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useGalaxySyncDeclarationMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
  useApplicationUpdateMutation,
} from "@/shared/hooks/use-applications";
import { ArrowRight, Loader2, FileText, Sparkles, Clock, PenTool, Check, X, Eye, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/shared/lib/utils";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";

type InReviewStageCardProps = {
  applicationId: string;
  isInteractive: boolean;
  isAllStagesSynced: boolean;
  onSyncBlocked: () => void;
  studentEmail?: string | null;
  studentName: string;
  withUnresolvedWarning?: (action: () => void) => void;
  currentRole?: string;
};

const getSafeSyncToastMessage = (data: unknown) => {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const maybeMessage = (data as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  return "Declaration synced to Galaxy.";
};

export default function InReviewStageCard({
  applicationId,
  isInteractive,
  isAllStagesSynced,
  onSyncBlocked,
  studentEmail,
  studentName,
  withUnresolvedWarning,
  currentRole,
}: InReviewStageCardProps) {
  const { data: appResponse } = useApplicationGetQuery(applicationId);
  const isStaff =
    currentRole === USER_ROLE.STAFF || currentRole === USER_ROLE.ADMIN;
  const isAgent = currentRole === USER_ROLE.AGENT;

  const enrollmentData = (appResponse?.data?.enrollment_data || {}) as Record<string, unknown>;

  const esosAgentAssessmentReason = enrollmentData?.esos_agent_assessment_reason as string | undefined;

  const [admissionsReason, setAdmissionsReason] = useState(
    (enrollmentData?.esos_admissions_review_reason as string) || ""
  );

  useEffect(() => {
    if (enrollmentData?.esos_admissions_review_reason !== undefined) {
      setAdmissionsReason((enrollmentData.esos_admissions_review_reason as string) || "");
    }
  }, [enrollmentData?.esos_admissions_review_reason]);

  const studentOrigin = appResponse?.data?.personal_details?.student_origin;
  const isOnshore = studentOrigin === "Overseas Student in Australia (Onshore)";

  const esosAgentAssessment = enrollmentData?.esos_agent_assessment as string;
  const esosAgentAssessmentDate = enrollmentData?.esos_agent_assessment_date as string;
  const esosAdmissionsReview = enrollmentData?.esos_admissions_review as string;

  const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(applicationId);
  const changeStage = useApplicationChangeStageMutation(applicationId);
  const updateApplication = useApplicationUpdateMutation(applicationId);
  const isPending = syncDeclaration.isPending || sendOfferLetter.isPending || updateApplication.isPending;

  const handleSendOfferLetter = () => {
    if (!studentEmail) {
      toast.error("Student email is missing.");
      return;
    }

    sendOfferLetter.mutate(
      {
        student_email: studentEmail,
        student_name: studentName,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Offer letter sent successfully!");
          
          if (isOnshore) {
            updateApplication.mutate({
              enrollment_data: {
                ...enrollmentData,
                esos_admissions_review_date: new Date().toISOString(),
              }
            });
          }

          changeStage.mutate(
            { to_stage: APPLICATION_STAGE.OFFER_LETTER },
            {
              onError: (error) => {
                toast.error(error.message || "Failed to change stage");
              },
            },
          );
        },
        onError: (error) => {
          toast.error(error.message || "Failed to send offer letter");
        },
      },
    );
  };

  const handleGenerateOffer = () => {
    if (!isAllStagesSynced) {
      onSyncBlocked();
      return;
    }

    syncDeclaration.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(getSafeSyncToastMessage(data));
        handleSendOfferLetter();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to sync declaration to Galaxy");
      },
    });
  };

  const handleGenerateOfferClick = () => {
    if (!isAllStagesSynced) {
      handleGenerateOffer();
      return;
    }

    if (withUnresolvedWarning) {
      withUnresolvedWarning(handleGenerateOffer);
      return;
    }

    handleGenerateOffer();
  };

  return (
    <>

      {isStaff && isOnshore && (
        <Card className="mb-6 overflow-hidden rounded-xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 shadow-sm">
          <CardHeader className="bg-amber-100/60 dark:bg-amber-900/20 px-4 py-3">
            <CardTitle className="text-[14px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              ESOS Onshore Commission — Admissions Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This student is onshore. Review the agent's self-assessment below and complete your own admissions review before generating the offer letter.
            </p>

            {/* Agent Self-Assessment (read-only) */}
            <div className="rounded-lg border bg-background p-3 space-y-2">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Stage 1 — Agent Self-Assessment</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full font-semibold",
                    esosAgentAssessment === "eligible"
                      ? "bg-green-100 text-green-800 ring-1 ring-green-300"
                      : esosAgentAssessment === "not_eligible"
                        ? "bg-red-100 text-red-800 ring-1 ring-red-300"
                        : "bg-gray-100 text-gray-600 ring-1 ring-gray-300"
                  )}>
                    {esosAgentAssessment === "eligible"
                      ? "Agent declared: Eligible"
                      : esosAgentAssessment === "not_eligible"
                        ? "Agent declared: Not Eligible"
                        : "Not yet assessed"}
                  </span>
                  {esosAgentAssessmentDate && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatUtcToFriendlyLocal(esosAgentAssessmentDate)}
                    </span>
                  )}
                </div>
              </div>
              {esosAgentAssessmentReason && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-dashed">
                  <span className="font-semibold text-foreground">Reason:</span>{" "}
                  {esosAgentAssessmentReason}
                </div>
              )}
            </div>

            {/* Admissions Officer Review */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Stage 2 — Admissions Officer Review</p>
              <div className="flex flex-col gap-2">
                {[
                  { value: "eligible", label: "Assessed eligible" },
                  { value: "not_eligible", label: "Assessed not eligible" },
                  { value: "further_review", label: "Requires further review" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors",
                      esosAdmissionsReview === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40"
                    )}
                    onClick={() => {
                      updateApplication.mutate({
                        enrollment_data: {
                          ...enrollmentData,
                          esos_admissions_review: opt.value,
                        }
                      });
                    }}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      esosAdmissionsReview === opt.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}>
                      {esosAdmissionsReview === opt.value && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Admissions Officer Review Reason */}
              <div className="space-y-1.5 mt-3">
                <label htmlFor="esos_admissions_review_reason" className="text-[11px] font-semibold text-muted-foreground">
                  Reason for Admissions Assessment (Optional)
                </label>
                <Textarea
                  id="esos_admissions_review_reason"
                  placeholder="Explain the reason for this eligibility assessment..."
                  value={admissionsReason}
                  onChange={(e) => setAdmissionsReason(e.target.value)}
                  onBlur={(e) => {
                    updateApplication.mutate({
                      enrollment_data: {
                        ...enrollmentData,
                        esos_admissions_review_reason: e.target.value,
                      }
                    });
                  }}
                  rows={3}
                  className="text-xs resize-none bg-background border-border focus-visible:ring-primary"
                />
              </div>
            </div>

            {isOnshore && !esosAdmissionsReview && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug">
                  Please complete the <strong>ESOS Onshore Commission Admissions Review</strong> above to unlock generating the offer letter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isStaff && (
        <>
          <h3 className="text-base font-semibold">Confirm before generating Offer Letter</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Please review all the requirements and if it satisfies please process
            further with generate offer letter or else please reject application
            with reason.
          </p>

          <Button
            onClick={handleGenerateOfferClick}
            disabled={!isInteractive || isPending || (isOnshore && !esosAdmissionsReview)}
            className="w-full py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isPending && <Loader2 className="h-5 w-5 mr-3 animate-spin" />}
            Generate Offer Letter
            {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </>
      )}

      {!isStaff && (
        <div className="py-8 text-center bg-muted/20 rounded-lg border-dashed border-2">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Application is under review by Churchill staff.</p>
          <p className="text-xs text-muted-foreground mt-1 px-4">We will notify you if any additional documents are required.</p>
        </div>
      )}
    </>
  );
}