"use client";

import { useMemo } from "react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { CheckCircle2, FileText, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  useGSAssessmentQuery,
  useGSAssessmentProgress,
  useGSStageCompleteMutation,
} from "@/hooks/useGSAssessment.hook";
import { transformGSAssessmentData } from "@/constants/gs-assessment";
import GSAssessmentTab from "./gs-tabs/assessment-tab";
import GSDeclarationsTab from "./gs-tabs/declarations-tab";
import GSDocumentsTab from "./gs-tabs/documents-tab";
import GSInterviewTab from "./gs-tabs/interview-tab";
import GSScheduleTab from "./gs-tabs/schedule-tab";

const STEPS = [
  { id: "documents", label: "Documents", stageNumber: 1 },
  { id: "declarations", label: "Declarations", stageNumber: 2 },
  { id: "schedule", label: "Schedule", stageNumber: 3 },
  { id: "interview", label: "Interview", stageNumber: 4 },
  { id: "assessment", label: "Assessment", stageNumber: 5 },
] as const;

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
  const [userSelectedTab, setUserSelectedTab] = useQueryState(
    "gs_process_tab",
    parseAsStringEnum<StepId>(
      STEPS.map((step) => step.id) as StepId[],
    ).withOptions({
      clearOnDefault: true,
    }),
  );

  // Fetch GS assessment from dedicated endpoint: /api/v1/gs-assessment/{application_id}
  const { data: gsAssessmentResponse } = useGSAssessmentQuery(
    applicationId ?? null,
  );

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

  const handleTabChange = (tabId: StepId) => {
    setUserSelectedTab(tabId);
  };

  const stageCompleteMutation = useGSStageCompleteMutation(
    applicationId ?? null,
  );

  // Centralized stage completion handler - calls API and updates UI
  const handleStageComplete = async (stageToComplete: number) => {
    await stageCompleteMutation.mutateAsync({ stageToComplete });
    // Move to next stage after successful API call
    const nextStageIndex = Math.min(stageToComplete, STEPS.length - 1);
    const nextStep = STEPS[nextStageIndex];
    if (nextStep) {
      setUserSelectedTab(nextStep.id);
    }
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

          <section className="flex gap-3 justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>Use the tabs above to review each GS stage.</span>
            </div>
          </section>
        </CardContent>
      </Card>

      <TabsContent value="documents" className="mt-0">
        {isStageCompleted(0) && (
          <GSDocumentsTab
            applicationId={applicationId}
            isStaff={isStaff}
            isStageCompleted={isStageCompleted(0)}
            onStageComplete={() => handleStageComplete(1)}
          />
        )}
      </TabsContent>
      <TabsContent value="declarations" className="mt-0">
        {isStageCompleted(1) && (
          <GSDeclarationsTab
            applicationId={applicationId}
            isStaff={isStaff}
            isStageCompleted={isStageCompleted(1)}
            onStageComplete={() => handleStageComplete(2)}
          />
        )}
      </TabsContent>
      <TabsContent value="schedule" className="mt-0">
        {isStageCompleted(2) && (
          <GSScheduleTab
            applicationId={applicationId}
            isStaff={isStaff}
            isStageCompleted={isStageCompleted(2)}
            onStageComplete={() => handleStageComplete(3)}
            // onSkipToAssessment={() => handleStageComplete(5)}
          />
        )}
      </TabsContent>
      <TabsContent value="interview" className="mt-0">
        {isStageCompleted(3) && (
          <GSInterviewTab
            applicationId={applicationId}
            isStaff={isStaff}
            isStageCompleted={isStageCompleted(3)}
            onStageComplete={() => handleStageComplete(4)}
          />
        )}
      </TabsContent>
      <TabsContent value="assessment" className="mt-0">
        {isStageCompleted(4) && (
          <GSAssessmentTab
            trackingCode={trackingCode}
            applicationId={applicationId}
            isStaff={isStaff}
            isStageCompleted={isStageCompleted(4)}
            onStageComplete={() => handleStageComplete(5)}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
