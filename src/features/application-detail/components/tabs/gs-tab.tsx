"use client";

import { CheckCircle2, Loader2, Lock, SkipForward } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { transformGSAssessmentData } from "@/shared/constants/gs-assessment";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";
import GSAssessmentTab from "@/features/gs/components/tabs/assessment-tab";
import GSDeclarationsTab from "@/features/gs/components/tabs/declarations-tab";
import GSDocumentsTab from "@/features/gs/components/tabs/gs-documents-tab";
import GSInterviewTab from "@/features/gs/components/tabs/interview-tab";
import GSScheduleTab from "@/features/gs/components/tabs/schedule-tab";
import { useApplicationUnresolvedThreadsQuery } from "@/features/threads/hooks/application-threads.hook";
import {
  useGSAssessmentProgress,
  useGSAssessmentQuery,
  useGSStageCompleteMutation,
} from "@/hooks/useGSAssessment.hook";

const STEPS = [
  { id: "documents", label: "Documents", stageNumber: 1 },
  { id: "declarations", label: "Declarations", stageNumber: 2 },
  { id: "schedule", label: "Schedule", stageNumber: 3 },
  { id: "interview", label: "Interview", stageNumber: 4 },
  { id: "assessment", label: "Assessment", stageNumber: 5 },
] as const;

const ONSHORE_STUDENT_ORIGIN = "Overseas Student in Australia (Onshore)";

type StepId = (typeof STEPS)[number]["id"];

type GSTabProps = {
  trackingCode?: string | null;
  applicationId?: string;
  isStaff?: boolean;
};

export default function GSTab({
  trackingCode,
  applicationId,
  isStaff = false,
}: GSTabProps) {
  const applicationQuery = useApplicationGetQuery(applicationId ?? null);
  const unresolvedThreadsQuery = useApplicationUnresolvedThreadsQuery(
    applicationId ?? null,
  );
  const [userSelectedTab, setUserSelectedTab] = useQueryState(
    "gs_process_tab",
    parseAsStringEnum<StepId>(
      STEPS.map((step) => step.id) as StepId[],
    ).withOptions({
      clearOnDefault: true,
    }),
  );

  const [unresolvedAlertOpen, setUnresolvedAlertOpen] = useState(false);
  const [skipConfirmationStage, setSkipConfirmationStage] = useState<
    number | null
  >(null);
  const pendingActionRef = useRef<null | (() => void)>(null);

  const unresolvedCount =
    unresolvedThreadsQuery.data?.data?.unresolved_count ?? 0;
  const shouldWarnUnresolvedCommunications =
    unresolvedCount > 0 &&
    !unresolvedThreadsQuery.isLoading &&
    !unresolvedThreadsQuery.isError;

  const runWithUnresolvedCommunicationsWarning = useCallback(
    (action: () => void) => {
      if (shouldWarnUnresolvedCommunications) {
        pendingActionRef.current = action;
        setUnresolvedAlertOpen(true);
        return;
      }

      action();
    },
    [shouldWarnUnresolvedCommunications],
  );

  const handleUnresolvedAlertClose = useCallback(() => {
    pendingActionRef.current = null;
    setUnresolvedAlertOpen(false);
  }, []);

  const handleIgnoreUnresolvedAndContinue = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setUnresolvedAlertOpen(false);
    action?.();
  }, []);

  const handleSkipConfirmationClose = useCallback(() => {
    setSkipConfirmationStage(null);
  }, []);

  // Fetch GS assessment from dedicated endpoint: /api/v1/gs-assessment/{application_id}
  const {
    data: gsAssessmentResponse,
    isFetched: isGSAssessmentFetched,
  } = useGSAssessmentQuery(applicationId ?? null);

  // Transform the API response to frontend format
  const gsAssessmentData = useMemo(
    () =>
      transformGSAssessmentData(
        gsAssessmentResponse?.data as Record<string, unknown> | null,
      ),
    [gsAssessmentResponse?.data],
  );

  const { stepsProgress } = useGSAssessmentProgress(gsAssessmentData);

  const currentApiStage = gsAssessmentData?.currentStage ?? 0;
  const studentOrigin =
    applicationQuery.data?.data?.personal_details?.student_origin;

  const activeTab = useMemo(() => {
    if (userSelectedTab !== null) {
      return userSelectedTab;
    }

    const targetStepIndex = Math.min(currentApiStage, STEPS.length - 1);
    return STEPS[targetStepIndex]?.id ?? "documents";
  }, [userSelectedTab, currentApiStage]);

  const getStageStatus = (index: number) => {
    const progress = stepsProgress[index];
    if (!progress) return "locked";

    if (progress.state === "completed") return "completed";
    if (progress.state === "active") return "current";

    if (index <= currentApiStage) return "pending";
    return "locked";
  };

  const isStageCompleted = (stageIndex: number) => {
    return stepsProgress[stageIndex]?.state === "completed";
  };
  const isDocumentsStageCompleted = isStageCompleted(0);

  const handleTabChange = useCallback(
    (tabId: StepId) => {
      runWithUnresolvedCommunicationsWarning(() => {
        setUserSelectedTab(tabId);
      });
    },
    [runWithUnresolvedCommunicationsWarning, setUserSelectedTab],
  );

  const stageCompleteMutation = useGSStageCompleteMutation(
    applicationId ?? null,
  );
  const autoAdvancedStageOneRef = useRef(false);

  useEffect(() => {
    autoAdvancedStageOneRef.current = false;
  }, [applicationId]);

  // Centralized stage completion handler - calls API and updates UI
  const handleStageCompleteInternal = useCallback(
    async (stageToComplete: number) => {
      await stageCompleteMutation.mutateAsync({ stageToComplete });
      // Move to next stage after successful API call
      const nextStageIndex = Math.min(stageToComplete, STEPS.length - 1);
      const nextStep = STEPS[nextStageIndex];
      if (nextStep) {
        setUserSelectedTab(nextStep.id);
      }
    },
    [setUserSelectedTab, stageCompleteMutation],
  );

  const handleStageComplete = async (stageToComplete: number) => {
    if (shouldWarnUnresolvedCommunications) {
      runWithUnresolvedCommunicationsWarning(() => {
        void handleStageCompleteInternal(stageToComplete);
      });
      return;
    }

    await handleStageCompleteInternal(stageToComplete);
  };

  useEffect(() => {
    const shouldAutoAdvanceStageOne =
      applicationQuery.isFetched &&
      isGSAssessmentFetched &&
      gsAssessmentData !== null &&
      studentOrigin === ONSHORE_STUDENT_ORIGIN &&
      currentApiStage === 0 &&
      !isDocumentsStageCompleted;

    if (
      !shouldAutoAdvanceStageOne ||
      autoAdvancedStageOneRef.current ||
      stageCompleteMutation.isPending
    ) {
      return;
    }

    autoAdvancedStageOneRef.current = true;

    void handleStageCompleteInternal(1).catch(() => {
      autoAdvancedStageOneRef.current = false;
    });
  }, [
    applicationQuery.isFetched,
    currentApiStage,
    gsAssessmentData,
    handleStageCompleteInternal,
    isGSAssessmentFetched,
    isDocumentsStageCompleted,
    stageCompleteMutation.isPending,
    studentOrigin,
  ]);

  const canSkipStage = (stageIndex: number) =>
    isStaff &&
    stageIndex < STEPS.length - 1 &&
    currentApiStage >= stageIndex &&
    !isStageCompleted(stageIndex);

  const renderSkipButton = (stageIndex: number) => {
    if (!canSkipStage(stageIndex)) {
      return null;
    }

    return (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size={"xs"}
          onClick={() => setSkipConfirmationStage(stageIndex)}
          disabled={stageCompleteMutation.isPending}
        >
          {stageCompleteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SkipForward className="h-4 w-4" />
          )}
          <span className="text-[11px]">Skip Step</span>
        </Button>
      </div>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const nextTab = value as StepId;
        const nextIndex = STEPS.findIndex((step) => step.id === nextTab);
        const status = getStageStatus(nextIndex);
        if (status !== "locked") {
          handleTabChange(nextTab);
        }
      }}
      className="space-y-4"
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">GS Assessment Flow</CardTitle>
              <p className="text-xs text-muted-foreground">
                Track the 5-step assessment for Genuine Student compliance
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Stage {currentApiStage + 1} of 5
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <section className="flex items-center gap-1">
            {STEPS.map((step, index) => {
              const status = getStageStatus(index);
              const isViewing = activeTab === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (status === "locked") return;
                        handleTabChange(step.id);
                      }}
                      disabled={status === "locked"}
                      className={`
                        group relative flex flex-col items-center gap-1 w-full py-2 px-1 rounded transition-all
                        ${status === "completed" ? "cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/10" : ""}
                        ${status === "current" ? "cursor-pointer" : ""}
                        ${status === "pending" ? "cursor-pointer hover:bg-muted/50" : ""}
                        ${status === "locked" ? "cursor-not-allowed opacity-40" : ""}
                        ${isViewing ? "bg-primary/5" : ""}
                      `}
                    >
                      <div
                        className={`
                          flex items-center justify-center w-7 h-7 rounded-full font-semibold text-xs transition-all
                          ${status === "completed" ? "bg-green-500 text-white shadow-sm" : ""}
                          ${status === "current" ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20" : ""}
                          ${status === "locked" ? "bg-muted/50 text-muted-foreground border border-dashed border-muted-foreground/30" : ""}
                          ${status === "pending" ? "bg-green-50 text-muted-foreground border border-dashed border-muted-foreground/30" : ""}
                          ${isViewing && status !== "current" ? "ring-2 ring-primary/30" : ""}
                        `}
                      >
                        {status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : status === "locked" ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <span
                        className={`
                          text-[10px] font-medium text-center leading-tight
                          ${status === "completed" ? "text-green-600 dark:text-green-400" : ""}
                          ${status === "current" ? "text-primary font-semibold" : ""}
                          ${status === "locked" ? "text-muted-foreground/60" : ""}
                          ${status === "pending" ? "text-muted-foreground/60" : ""}
                        `}
                      >
                        {step.label}
                      </span>
                    </button>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        h-0.5 flex-1 transition-all
                        ${status === "completed" ? "bg-green-500" : "bg-muted/40"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </section>

          {/* <section className="flex gap-3 justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>Use the tabs above to review each GS stage.</span>
            </div>
          </section> */}
        </CardContent>
      </Card>

      <TabsContent value="documents" className="mt-0">
        {currentApiStage >= 0 && (
          <div className="space-y-4">
            <GSDocumentsTab
              applicationId={applicationId}
              isStaff={isStaff}
              isStageCompleted={isStageCompleted(0)}
              onStageComplete={() => handleStageComplete(1)}
            />
            {renderSkipButton(0)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="declarations" className="mt-0">
        {currentApiStage >= 1 && (
          <div className="space-y-4">
            <GSDeclarationsTab
              applicationId={applicationId}
              isStaff={isStaff}
              isStageCompleted={isStageCompleted(1)}
              onStageComplete={() => handleStageComplete(2)}
            />
            {renderSkipButton(1)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="schedule" className="mt-0">
        {currentApiStage >= 2 && (
          <div className="space-y-4">
            <GSScheduleTab
              applicationId={applicationId}
              isStageCompleted={isStageCompleted(2)}
              onStageComplete={() => handleStageComplete(3)}
              // onSkipToAssessment={() => handleStageComplete(5)}
            />
            {renderSkipButton(2)}
          </div>
        )}
      </TabsContent>
      <TabsContent value="interview" className="mt-0">
        {currentApiStage >= 3 && (
          <div className="space-y-4">
            <GSInterviewTab
              applicationId={applicationId}
              isStageCompleted={isStageCompleted(3)}
              onStageComplete={() => handleStageComplete(4)}
            />
            {renderSkipButton(3)}
          </div>
        )}
      </TabsContent>
      <TabsContent value="assessment" className="mt-0">
        {currentApiStage >= 4 && (
          <GSAssessmentTab
            trackingCode={trackingCode}
            applicationId={applicationId}
            isStaff={isStaff}
            isStageCompleted={isStageCompleted(4)}
            onStageComplete={() => handleStageComplete(5)}
          />
        )}
      </TabsContent>

      <Dialog
        open={unresolvedAlertOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleUnresolvedAlertClose();
            return;
          }
          setUnresolvedAlertOpen(true);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2">
            <DialogTitle>Incomplete communications remain</DialogTitle>
            <DialogDescription>
              There {unresolvedCount === 1 ? "is" : "are"} {unresolvedCount}{" "}
              unresolved communication{" "}
              {unresolvedCount === 1 ? "thread" : "threads"} for this
              application. You can close this message to review them, or ignore
              the warning and continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-end">
            <Button variant="secondary" onClick={handleUnresolvedAlertClose}>
              Close
            </Button>
            <Button onClick={handleIgnoreUnresolvedAndContinue}>
              Ignore warning and continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={skipConfirmationStage !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleSkipConfirmationClose();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2">
            <DialogTitle>Skip this stage?</DialogTitle>
            <DialogDescription>
              This will mark the current GS stage as skipped and move the
              application to the next stage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-end">
            <Button
              variant="secondary"
              onClick={handleSkipConfirmationClose}
              disabled={stageCompleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (skipConfirmationStage === null) return;
                const stageToComplete = skipConfirmationStage + 1;
                setSkipConfirmationStage(null);
                void handleStageComplete(stageToComplete);
              }}
              disabled={stageCompleteMutation.isPending}
            >
              {stageCompleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
