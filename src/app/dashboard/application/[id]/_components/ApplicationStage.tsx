"use client";

import { useMemo } from "react";
import React from "react";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleQuestionMark,
  ClipboardCheck,
  Clock,
  Eye,
  ListTodo,
  Loader2,
  LucideIcon,
  ScanSearch,
  Signature,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  STAGE_PILL_CONFIG,
  formatStageLabel,
  getRoleStageLabel,
} from "@/components/shared/applicationStageConfig";
import { GS_STEPS } from "@/constants/gs-assessment";
import { APPLICATION_STAGE, USER_ROLE } from "@/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationEnrollGalaxyCourseMutation,
  useApplicationGalaxySyncMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import {
  transformGSAssessmentData,
  useGSAssessmentProgress,
  useGSAssessmentQuery,
} from "@/hooks/useGSAssessment.hook";
import ApplicationSignDisplay from "./ApplicationSignDisplay";

interface ApplicationStageProps {
  currentStatus: APPLICATION_STAGE;
  id: string;
  current_role?: string;
}

const IconMap: Record<APPLICATION_STAGE, LucideIcon> = {
  [APPLICATION_STAGE.DRAFT]: User,
  [APPLICATION_STAGE.SUBMITTED]: ClipboardCheck,
  [APPLICATION_STAGE.IN_REVIEW]: ScanSearch,
  [APPLICATION_STAGE.OFFER_LETTER]: Signature,
  [APPLICATION_STAGE.GS_ASSESSMENT]: ListTodo,
  [APPLICATION_STAGE.COE_ISSUED]: CircleQuestionMark,
  // [APPLICATION_STAGE.ACCEPTED]: Check,
  // [APPLICATION_STAGE.REJECTED]: X,
};

const ApplicationStage = ({ id, current_role }: ApplicationStageProps) => {
  // Queries & Mutations
  const { data: response, isLoading } = useApplicationGetQuery(id);
  const { data: gsAssessmentResponse } = useGSAssessmentQuery(id);
  const changeStage = useApplicationChangeStageMutation(id);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(id);
  const enrollGalaxyCourse = useApplicationEnrollGalaxyCourseMutation(id);
  const syncGalaxyApplication = useApplicationGalaxySyncMutation(id);

  const application = response?.data;
  const isStaff = current_role === USER_ROLE.STAFF;

  // Transform GS assessment data from dedicated GS endpoint (same source as gs-tab.tsx)
  const gsAssessmentData = useMemo(
    () =>
      transformGSAssessmentData(
        gsAssessmentResponse?.data as Record<string, unknown> | null
      ),
    [gsAssessmentResponse?.data]
  );

  // Derive GS step progress from API data
  const { stepsProgress } = useGSAssessmentProgress(gsAssessmentData);

  // Handlers
  const handleStartReview = (toStage: APPLICATION_STAGE) => {
    changeStage.mutate(
      { to_stage: toStage },
      {
        onSuccess: () => {
          toast.success(`Moved to ${toStage.replace("_", " ")}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to change stage");
        },
      },
    );
  };

  const handleStageChange = (str: APPLICATION_STAGE) => {
    changeStage.mutateAsync({ to_stage: str });
  };

  const handleEnrollGalaxyCourse = () => {
    enrollGalaxyCourse.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          data?.message || "Course enrollment in Galaxy completed.",
        );
        handleSendOfferLetter();
        // handleStageChange(APPLICATION_STAGE.OFFER_LETTER);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to enroll course in Galaxy");
      },
    });
  };

  const handleSyncGalaxyApplication = () => {
    syncGalaxyApplication.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data?.message || "Galaxy sync completed.");
        // handleStageChange(APPLICATION_STAGE.OFFER_LETTER);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to sync application in Galaxy");
      },
    });
  };

  const handleSendOfferLetter = () => {
    const studentEmail = application?.personal_details?.email;
    const studentName = `${application?.personal_details?.given_name} ${
      application?.personal_details?.middle_name || ""
    } ${application?.personal_details?.family_name}`;

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
          handleStageChange(APPLICATION_STAGE.OFFER_LETTER);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to send offer letter");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!application) return null;

  const stages = Object.values(APPLICATION_STAGE);
  const currentStage = application.current_stage;
  const currentIndex = stages.indexOf(currentStage);

  const renderStageAction = (
    stage: APPLICATION_STAGE,
    isCurrent: boolean,
    cardBorderClass: string,
  ) => {
    if (!isCurrent) return null;

    if (stage === APPLICATION_STAGE.SUBMITTED) {
      if (!isStaff) return null;
      return (
        <div className={cardBorderClass}>
          <h3 className="text-base">Ready to Start Review?</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            You can start reviewing this application. Click the button below to
            begin.
          </p>
          <Button
            onClick={() => handleStartReview(APPLICATION_STAGE.IN_REVIEW)}
            disabled={changeStage.isPending}
            className="w-full"
          >
            {changeStage.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Start Review
            {!changeStage.isPending && <ArrowRight />}
          </Button>
        </div>
      );
    }

    if (stage === APPLICATION_STAGE.IN_REVIEW) {
      if (!isStaff) return null;
      const isGeneratingOffer =
        enrollGalaxyCourse.isPending || sendOfferLetter.isPending;
      return (
        <div className={cardBorderClass}>
          <h3 className="text-base">Confirm Applicant Details</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Review and confirm application details to generate and send the
            offer letter.{" "}
          </p>

          <Button
            onClick={handleEnrollGalaxyCourse}
            disabled={isGeneratingOffer}
            className="w-full"
          >
            {isGeneratingOffer && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Generate Offer Letter
            {!isGeneratingOffer && <ArrowRight />}
          </Button>
        </div>
      );
    }

    if (stage === APPLICATION_STAGE.OFFER_LETTER) {
      return (
        <ApplicationSignDisplay
          applicationId={id}
          currentRole={current_role}
          studentEmail={application?.personal_details?.email}
          cardBorderClass={cardBorderClass}
          handleStageChange={handleStageChange}
        />
      );
    }

    if (stage === APPLICATION_STAGE.GS_ASSESSMENT) {
      // Map stepsProgress to UI format
      const gsStages = stepsProgress.map((progress, index) => {
        const config = GS_STEPS[index];
        let status: "completed" | "in-progress" | "pending";
        if (progress.state === "completed") {
          status = "completed";
        } else if (progress.state === "active") {
          status = "in-progress";
        } else {
          status = "pending";
        }

        return {
          id: index + 1,
          title: config.label,
          subtitle: progress.statusText ?? config.description,
          status,
        };
      });

      // Calculate current active stage index (1-indexed for display)
      const activeStageIndex =
        gsAssessmentData?.currentStage !== undefined
          ? gsAssessmentData.currentStage + 1
          : 1;

      return (
        <div className={cardBorderClass}>
          <h3 className="text-base font-semibold">GS Assessment Progress</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Track the 5-stage GS assessment workflow
          </p>

          <div className="flex items-center gap-1 mb-4 relative">
            {activeStageIndex > 1 && (
              <div
                className="absolute left-0 right-0 top-4 h-0.5 flex items-center"
                style={{ zIndex: 0 }}
              >
                <div
                  className="w-full relative"
                  style={{
                    marginLeft: "calc(100% / 10)",
                    marginRight: "calc(100% / 10)",
                    width: "calc(100% - 100% / 5)",
                  }}
                >
                  <div
                    className="absolute h-0.5 text-green-500 transition-all duration-500"
                    style={{
                      width: `${((activeStageIndex - 1) / (gsStages.length - 1)) * 100}%`,
                      backgroundImage:
                        "repeating-linear-gradient(to right, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>
              </div>
            )}

            {gsStages.map((stageItem) => (
              <div
                key={stageItem.id}
                className="flex items-center flex-1"
                style={{ zIndex: 1 }}
              >
                <div className="flex flex-col items-center gap-1 w-full">
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all
                      ${stageItem.status === "completed" ? "bg-green-500 text-white shadow-sm" : ""}
                      ${stageItem.status === "in-progress" ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20" : ""}
                      ${stageItem.status === "pending" ? "bg-green-50 text-muted-foreground border border-dashed" : ""}
                    `}
                  >
                    {stageItem.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      stageItem.id
                    )}
                  </div>

                  <span
                    className={`
                      text-[10px] font-medium text-center leading-tight
                      ${stageItem.status === "completed" ? "text-green-600 dark:text-green-400" : ""}
                      ${stageItem.status === "in-progress" ? "text-primary font-semibold" : ""}
                      ${stageItem.status === "pending" ? "text-muted-foreground/60" : ""}
                    `}
                  >
                    {stageItem.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            {gsStages.map((stageItem) => (
              <div
                key={stageItem.id}
                className={`
                  flex items-center justify-between p-2 rounded-lg border transition-all
                  ${stageItem.status === "completed" ? "bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800" : ""}
                  ${stageItem.status === "in-progress" ? "bg-primary/5 border-primary/30" : ""}
                  ${stageItem.status === "pending" ? "bg-muted/30 border-muted" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-1.5 h-1.5 rounded-full
                      ${stageItem.status === "completed" ? "bg-green-500" : ""}
                      ${stageItem.status === "in-progress" ? "bg-primary animate-pulse" : ""}
                      ${stageItem.status === "pending" ? "bg-muted-foreground/40" : ""}
                    `}
                  />
                  <div>
                    <p className="text-sm font-medium">{stageItem.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {stageItem.subtitle}
                    </p>
                  </div>
                </div>
                {stageItem.status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
                {stageItem.status === "in-progress" && (
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full gap-2">
            <Eye className="h-4 w-4" />
            View GS Documents Tab for Actions
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      {stages.map((el, i) => {
        if (i < 1) return null;

        const Icon = IconMap[el];
        const isCurrent = i === currentIndex;
        const stageLabel =
          getRoleStageLabel(el, current_role) ??
          STAGE_PILL_CONFIG[el]?.label ??
          formatStageLabel(el);
        // const isPrevious = i === currentIndex - 1;
        // const isNext = i === currentIndex + 1;
        // const isCompleted = i < currentIndex;

        const cardBorderClass = `
          p-3 border-x-2 last:border-b-2 capitalize flex flex-col  gap-0
          ${isCurrent ? "bg-primary/5 border-primary" : ""}
          border-b-2
        `;

        return (
          <React.Fragment key={el}>
            <div
              className={`p-2 first:rounded-t-lg border-x-2 border-t-2 last:rounded-b-lg capitalize flex items-center justify-between gap-2.5 ${
                isCurrent ? "bg-primary/5 border-primary" : "last:border-b"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 outline-2 outline-primary/30 text-primary rounded-sm dark:text-white">
                  <Icon size={17} className="" />
                </div>
                {stageLabel}
              </div>

              {i < currentIndex && (
                <BadgeCheck fill="#2a52be" className="text-white" />
              )}
            </div>

            {renderStageAction(el, isCurrent, cardBorderClass)}
          </React.Fragment>
        );
      })}

      {/* <div onClick={() => handleStageChange(APPLICATION_STAGE.SUBMITTED)}>
        reset
      </div> */}
    </div>
  );
};

export default ApplicationStage;
