"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useGalaxySyncApplicationMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
  useApplicationUpdateMutation,
} from "@/shared/hooks/use-applications";
import { ArrowRight, Loader2, Clock, AlertCircle, ChevronDown, ChevronUp, CheckSquare, Square } from "lucide-react";
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

const ADMISSIONS_REVIEW_OPTIONS = [
  { value: "eligible", label: "Assessed eligible" },
  { value: "not_eligible", label: "Assessed not eligible" },
  { value: "further_review", label: "Requires further review" },
];

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

  const studentOrigin = appResponse?.data?.personal_details?.student_origin;
  const isOnshore = studentOrigin === "Overseas Student in Australia (Onshore)";

  const esosAgentAssessment = isOnshore ? (typeof enrollmentData?.esos_agent_assessment === "string" ? enrollmentData.esos_agent_assessment : "") : "";
  const esosAgentAssessmentDate = isOnshore ? (typeof enrollmentData?.esos_agent_assessment_date === "string" ? enrollmentData.esos_agent_assessment_date : "") : "";
  const esosAgentAssessmentReason = isOnshore ? (typeof enrollmentData?.esos_agent_assessment_reason === "string" ? enrollmentData.esos_agent_assessment_reason : "") : "";
  // Persisted (saved) value from backend
  const persistedAdmissionsReview = isOnshore ? (typeof enrollmentData?.esos_admissions_review === "string" ? enrollmentData.esos_admissions_review : "") : "";
  const persistedAdmissionsReason = isOnshore ? (typeof enrollmentData?.esos_admissions_review_reason === "string" ? enrollmentData.esos_admissions_review_reason : "") : "";

  // Local state — only committed on explicit submit
  const [localAdmissionsReview, setLocalAdmissionsReview] = useState<string>("");
  const [localAdmissionsReason, setLocalAdmissionsReason] = useState<string>("");
  const [agentReason, setAgentReason] = useState("");

  // Collapsible: auto-collapse if already submitted
  const [isEsosCollapsed, setIsEsosCollapsed] = useState<boolean>(!!persistedAdmissionsReview);

  // Sync local state from persisted data when it loads
  useEffect(() => {
    if (!isOnshore) return;
    setLocalAdmissionsReview(persistedAdmissionsReview);
    setLocalAdmissionsReason(persistedAdmissionsReason);
    setIsEsosCollapsed(!!persistedAdmissionsReview);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnshore, persistedAdmissionsReview, persistedAdmissionsReason]);

  useEffect(() => {
    if (!isOnshore) return;
    const storedAgent = typeof enrollmentData?.esos_agent_assessment_reason === "string" ? enrollmentData.esos_agent_assessment_reason : "";
    setAgentReason(storedAgent);
  }, [isOnshore, enrollmentData?.esos_agent_assessment_reason]);

  const syncApplication = useGalaxySyncApplicationMutation(applicationId);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(applicationId);
  const changeStage = useApplicationChangeStageMutation(applicationId);
  const updateApplication = useApplicationUpdateMutation(applicationId);
  const isPending = syncApplication.isPending || sendOfferLetter.isPending || updateApplication.isPending;

  // Whether the local state differs from what's persisted
  const hasUnsavedChanges =
    localAdmissionsReview !== persistedAdmissionsReview ||
    localAdmissionsReason !== persistedAdmissionsReason;

  const handleCheckboxToggle = (value: string) => {
    // Single-select: clicking the already-selected option deselects it
    setLocalAdmissionsReview((prev) => (prev === value ? "" : value));
  };

  const handleSubmitAdmissionsReview = () => {
    updateApplication.mutate(
      {
        enrollment_data: {
          ...enrollmentData,
          esos_admissions_review: localAdmissionsReview,
          esos_admissions_review_reason: localAdmissionsReason,
        },
      },
      {
        onSuccess: () => {
          toast.success("Admissions review saved.");
          setIsEsosCollapsed(true);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save admissions review.");
        },
      }
    );
  };

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

    syncApplication.mutate(false, {
      onSuccess: (data) => {
        toast.success(getSafeSyncToastMessage(data) || "Successfully synced all data to Galaxy");
        handleSendOfferLetter();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to sync application to Galaxy");
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
          {/* Collapsible Header */}
          <CardHeader
            className="bg-amber-100/60 dark:bg-amber-900/20 px-4 py-3 cursor-pointer select-none"
            onClick={() => setIsEsosCollapsed((c) => !c)}
          >
            <CardTitle className="flex items-start justify-between gap-2 text-[14px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="min-w-0">ESOS Onshore Commission — Admissions Review</span>
                {persistedAdmissionsReview && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-blue-800 ring-1 ring-blue-300 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-700">
                    Submitted
                  </span>
                )}
              </span>
              {isEsosCollapsed
                ? <ChevronDown className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                : <ChevronUp className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              }
            </CardTitle>
          </CardHeader>

          {!isEsosCollapsed && (
            <CardContent className="p-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This student is onshore. Review the agent&apos;s self-assessment below and complete your own admissions review before generating the offer letter.
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
                {isAgent && isOnshore && (
                   <div className="mt-4 border-t border-primary/10 pt-4">
                     <label className="text-sm font-medium mb-1 block">Agent Reason (Optional)</label>
                     <Textarea
                       placeholder="Explain why the student is or is not eligible..."
                       rows={3}
                       value={agentReason}
                       onChange={(e) => setAgentReason(e.target.value)}
                       onBlur={() => {
                         updateApplication.mutate({
                           enrollment_data: {
                             ...enrollmentData,
                             esos_agent_assessment_reason: agentReason,
                           },
                         });
                       }}
                       className="text-xs resize-none bg-background border-border focus-visible:ring-primary"
                     />
                   </div>
                 )}
              </div>

              {/* Admissions Officer Review — single-select checkboxes, local state only */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Stage 2 — Admissions Officer Review</p>
                <div className="flex flex-col gap-2">
                  {ADMISSIONS_REVIEW_OPTIONS.map((opt) => {
                    const isChecked = localAdmissionsReview === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-left w-full",
                          isChecked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/40"
                        )}
                        onClick={() => handleCheckboxToggle(opt.value)}
                      >
                        {isChecked
                          ? <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                          : <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        }
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Reason text field */}
                <div className="space-y-1.5 mt-3">
                  <label htmlFor="esos_admissions_review_reason" className="text-[11px] font-semibold text-muted-foreground">
                    Reason for Admissions Assessment (Optional)
                  </label>
                  <Textarea
                    id="esos_admissions_review_reason"
                    placeholder="Explain the reason for this eligibility assessment..."
                    value={localAdmissionsReason}
                    onChange={(e) => setLocalAdmissionsReason(e.target.value)}
                    rows={3}
                    className="text-xs resize-none bg-background border-border focus-visible:ring-primary"
                  />
                </div>

                {/* Submit button */}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] text-muted-foreground">
                    {hasUnsavedChanges ? "You have unsaved changes." : persistedAdmissionsReview ? "Review saved." : "No review submitted yet."}
                  </p>
                  <Button
                    size="sm"
                    onClick={handleSubmitAdmissionsReview}
                    disabled={!localAdmissionsReview || !hasUnsavedChanges || updateApplication.isPending}
                    className="w-full text-xs sm:w-auto"
                  >
                    {updateApplication.isPending
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Saving...</>
                      : "Submit Admissions Review"}
                  </Button>
                </div>
              </div>

              {isOnshore && !persistedAdmissionsReview && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                  <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug">
                    Please complete and submit the <strong>ESOS Onshore Commission Admissions Review</strong> above to unlock generating the offer letter.
                  </p>
                </div>
              )}
            </CardContent>
          )}

          {/* Collapsed summary when submitted */}
          {isEsosCollapsed && persistedAdmissionsReview && (
            <CardContent className="px-4 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Review: </span>
                {ADMISSIONS_REVIEW_OPTIONS.find((o) => o.value === persistedAdmissionsReview)?.label ?? persistedAdmissionsReview}
                {persistedAdmissionsReason && (
                  <span className="ml-2 italic">&mdash; &quot;{persistedAdmissionsReason}&quot;</span>
                )}
              </p>
            </CardContent>
          )}
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
            disabled={!isInteractive || isPending || (isOnshore && !persistedAdmissionsReview)}
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
