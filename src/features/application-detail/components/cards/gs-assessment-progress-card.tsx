"use client";

import { GS_STEPS } from "@/shared/constants/gs-assessment";
import {
  transformGSAssessmentData,
  useGSAssessmentProgress,
  useGSAssessmentQuery,
} from "@/hooks/useGSAssessment.hook";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

type StageStatus = "completed" | "in-progress" | "pending";

export type GSStageProgressItem = {
  id: number;
  title: string;
  subtitle: string;
  status: StageStatus;
  icon: LucideIcon;
};

type GSAssessmentProgressCardProps = {
  applicationId: string;
};

export default function GSAssessmentProgressCard({
  applicationId,
}: GSAssessmentProgressCardProps) {
  const { data: gsAssessmentResponse } = useGSAssessmentQuery(applicationId);
  const gsAssessmentData = useMemo(
    () =>
      transformGSAssessmentData(
        gsAssessmentResponse?.data as Record<string, unknown> | null,
      ),
    [gsAssessmentResponse?.data],
  );
  const { stepsProgress } = useGSAssessmentProgress(gsAssessmentData);
  const stages = useMemo<GSStageProgressItem[]>(
    () =>
      stepsProgress.map((progress, index) => {
        const config = GS_STEPS[index];
        const status =
          progress.state === "completed"
            ? "completed"
            : progress.state === "active"
              ? "in-progress"
              : "pending";

        return {
          id: index + 1,
          title: config.label,
          subtitle: progress.statusText ?? config.description,
          status,
          ...config,
        };
      }),
    [stepsProgress],
  );

  return (
    <>
      <h3 className="text-base font-semibold">GS Assessment Progress</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-4">
        Track the 5-stage GS assessment workflow
      </p>

      <div className="space-y-1 mb-4">
        {stages.map((stageItem) => {
          const Icon = stageItem.icon;

          const containerStyles = {
            completed:
              "bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800",
            "in-progress": "bg-primary/5 border-primary/30",
            pending: "bg-muted/30 border-muted",
          }[stageItem.status];

          const iconStyles = {
            completed: "text-green-600 dark:text-green-400",
            "in-progress": "text-primary",
            pending: "text-muted-foreground",
          }[stageItem.status];

          return (
            <div
              key={stageItem.id}
              className={`flex items-center justify-between px-2 py-2 rounded-lg border ${containerStyles}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${iconStyles}`} />

                <div className="leading-tight">
                  <p className="text-sm font-medium">{stageItem.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {stageItem.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
