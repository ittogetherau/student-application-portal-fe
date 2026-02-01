"use client";

import {
  ArrowRight,
  BadgeCheck,
  CircleQuestionMark,
  ClipboardCheck,
  Eye,
  ListTodo,
  Loader2,
  LucideIcon,
  ScanSearch,
  Signature,
  User,
} from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "react-hot-toast";

import {
  STAGE_PILL_CONFIG,
  formatStageLabel,
  getRoleStageLabel,
} from "@/components/shared/applicationStageConfig";
import { Button } from "@/components/ui/button";
import { GS_STEPS } from "@/constants/gs-assessment";
import { APPLICATION_STAGE, USER_ROLE } from "@/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationEnrollGalaxyCourseMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
} from "@/hooks/useApplication.hook";
import {
  transformGSAssessmentData,
  useGSAssessmentProgress,
  useGSAssessmentQuery,
} from "@/hooks/useGSAssessment.hook";
import { useQueryState } from "nuqs";
import ApplicationSignDisplay from "./ApplicationSignDisplay";

interface ApplicationStageProps {
  currentStatus: APPLICATION_STAGE;
  id: string;
  current_role?: string;
}

const IconMap: Record<string, LucideIcon> = {
  [APPLICATION_STAGE.DRAFT]: User,
  [APPLICATION_STAGE.SUBMITTED]: ClipboardCheck,
  [APPLICATION_STAGE.IN_REVIEW]: ScanSearch,
  [APPLICATION_STAGE.OFFER_LETTER]: Signature,
  [APPLICATION_STAGE.GS_ASSESSMENT]: ListTodo,
  [APPLICATION_STAGE.COE_ISSUED]: CircleQuestionMark,
};

const ApplicationStage = ({ id, current_role }: ApplicationStageProps) => {
  const [_, setTabNavigation] = useQueryState("application_tab");
  // Queries & Mutations
  const { data: response, isLoading } = useApplicationGetQuery(id);
  const { data: gsAssessmentResponse } = useGSAssessmentQuery(id);
  const changeStage = useApplicationChangeStageMutation(id);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(id);
  const enrollGalaxyCourse = useApplicationEnrollGalaxyCourseMutation(id);
  // const syncGalaxyApplication = useApplicationGalaxySyncMutation(id);

  const application = response?.data;
  const isStaff = current_role === USER_ROLE.STAFF;
  const currentStage = application?.current_stage;
  const [activeStage, setActiveStage] =
    React.useState<APPLICATION_STAGE | null>(currentStage ?? null);

  React.useEffect(() => {
    if (currentStage) {
      setActiveStage(currentStage);
    }
  }, [currentStage]);

  // Transform GS assessment data from dedicated GS endpoint (same source as gs-tab.tsx)
  const gsAssessmentData = useMemo(
    () =>
      transformGSAssessmentData(
        gsAssessmentResponse?.data as Record<string, unknown> | null,
      ),
    [gsAssessmentResponse?.data],
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

  // const handleSyncGalaxyApplication = () => {
  //   syncGalaxyApplication.mutate(undefined, {
  //     onSuccess: (data) => {
  //       toast.success(data?.message || "Galaxy sync completed.");
  //       // handleStageChange(APPLICATION_STAGE.OFFER_LETTER);
  //     },
  //     onError: (error) => {
  //       toast.error(error.message || "Failed to sync application in Galaxy");
  //     },
  //   });
  // };

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

  const allStages = Object.values(APPLICATION_STAGE) as APPLICATION_STAGE[];
  const stages = allStages.filter(
    (stage) =>
      stage !== APPLICATION_STAGE.ACCEPTED &&
      stage !== APPLICATION_STAGE.REJECTED,
  );
  const currentStageForIndex =
    currentStage && stages.includes(currentStage as (typeof stages)[number])
      ? (currentStage as (typeof stages)[number])
      : stages[0];
  const currentIndex = stages.indexOf(currentStageForIndex);
  const gsStages = useMemo(
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

  const renderStageAction = ({
    stage,
    isActive,
    isInteractive,
    cardBorderClass,
  }: {
    stage: APPLICATION_STAGE;
    isActive: boolean;
    isInteractive: boolean;
    cardBorderClass: string;
  }) => {
    if (!isActive) return null;

    switch (stage) {
      case APPLICATION_STAGE.SUBMITTED: {
        if (!isStaff) return null;
        return (
          <div className={cardBorderClass}>
            <h3 className="text-base">Ready to Start Review?</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Please check all the student details documents uploaded and make
              sure it can proceed before completing review or else please reject
              application with reason.
            </p>
            <Button
              onClick={() => handleStartReview(APPLICATION_STAGE.IN_REVIEW)}
              disabled={!isInteractive || changeStage.isPending}
              className="w-full"
            >
              {changeStage.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Start Application Review
              {!changeStage.isPending && <ArrowRight />}
            </Button>
          </div>
        );
      }
      case APPLICATION_STAGE.IN_REVIEW: {
        if (!isStaff) return null;
        const isGeneratingOffer =
          enrollGalaxyCourse.isPending || sendOfferLetter.isPending;
        return (
          <div className={cardBorderClass}>
            <h3 className="text-base">
              Confirm before generating Offer Letter
            </h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Please review all the requirements and if it satisfies please
              process further with generate offer letter or else please reject
              application with reason.
            </p>

            <Button
              onClick={handleEnrollGalaxyCourse}
              disabled={!isInteractive || isGeneratingOffer}
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
      case APPLICATION_STAGE.OFFER_LETTER: {
        return (
          <ApplicationSignDisplay
            applicationId={id}
            currentRole={current_role}
            studentEmail={application?.personal_details?.email}
            cardBorderClass={cardBorderClass}
            handleStageChange={handleStageChange}
            isInteractive={isInteractive}
          />
        );
      }
      case APPLICATION_STAGE.GS_ASSESSMENT: {
        return (
          <div className={cardBorderClass}>
            <h3 className="text-base font-semibold">GS Assessment Progress</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Track the 5-stage GS assessment workflow
            </p>

            <div className="space-y-2 mb-4">
              {gsStages.map((stageItem) => {
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
                    className={`flex items-center justify-between p-3 rounded-lg border ${containerStyles}`}
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

            <Button
              onClick={() => setTabNavigation("gs-process")}
              variant="outline"
              className="w-full gap-2 shadow-none"
              disabled={!isInteractive}
            >
              <Eye className="h-4 w-4" />
              Open GS Process Tab
            </Button>
          </div>
        );
      }
      case APPLICATION_STAGE.COE_ISSUED: {
        return (
          <div className={cardBorderClass}>
            <h3 className="text-base font-semibold">COE Process</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Confirmation of Enrolment has been issued
            </p>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      {stages.map((el, i) => {
        if (i < 1) return null;

        const Icon = IconMap[el] ?? User;
        const isCurrent = i === currentIndex;
        const isActive = activeStage === el;
        const isInteractive = isCurrent && isActive;
        const stageLabel =
          getRoleStageLabel(el, current_role) ??
          STAGE_PILL_CONFIG[el]?.label ??
          formatStageLabel(el);
        // const isPrevious = i === currentIndex - 1;
        // const isNext = i === currentIndex + 1;
        // const isCompleted = i < currentIndex;

        const cardBorderClass = `
          p-3 border-x-2 last:border-b-2  flex flex-col  gap-0
          ${isCurrent ? "bg-primary/5 border-primary" : ""}
          border-b-2 last:rounded-bg-lg
        `;

        return (
          <React.Fragment key={el}>
            <button
              type="button"
              onClick={() =>
                setActiveStage((prev) =>
                  prev === el ? (currentStage ?? null) : el,
                )
              }
              aria-expanded={isActive}
              className={`w-full text-left p-2 first:rounded-t-lg border-x-2 border-t-2 last:rounded-b-lg flex items-center justify-between gap-2.5 ${
                isCurrent ? "bg-primary/5 border-primary" : "last:border-b"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="p-1.5 bg-primary/10 outline-2 outline-primary/30 text-primary rounded-sm dark:text-white">
                  <Icon size={17} />
                </span>
                {stageLabel}
              </span>

              {i < currentIndex && (
                <BadgeCheck fill="#2a52be" className="text-white" />
              )}
            </button>

            {renderStageAction({
              stage: el,
              isActive,
              isInteractive,
              cardBorderClass,
            })}
          </React.Fragment>
        );
      })}

      {/* <Button
        className="mt-4"
        onClick={() => handleStageChange(APPLICATION_STAGE.GS_ASSESSMENT)}
      >
        Change stage
      </Button> */}
    </div>
  );
};

export default ApplicationStage;
