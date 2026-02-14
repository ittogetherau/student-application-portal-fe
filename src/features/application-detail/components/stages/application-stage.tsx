"use client";

import {
  STAGE_PILL_CONFIG,
  formatStageLabel,
  getRoleStageLabel,
} from "@/components/shared/applicationStageConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GS_STEPS } from "@/constants/gs-assessment";
import { siteRoutes } from "@/constants/site-routes";
import { isSyncMetadataComplete } from "@/features/application-form/components/sync/sync-all-to-galaxy";
import {
  transformGSAssessmentData,
  useGSAssessmentProgress,
  useGSAssessmentQuery,
} from "@/hooks/useGSAssessment.hook";
import type {
  ApplicationDetailResponse,
  ApplicationSyncMetadata,
} from "@/service/application.service";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  useApplicationChangeStageMutation,
  useApplicationEnrollGalaxyCourseMutation,
  useApplicationGetQuery,
  useApplicationSendOfferLetterMutation,
} from "@/shared/hooks/use-applications";
import type { ServiceResponse } from "@/shared/types/service";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CircleQuestionMark,
  ClipboardCheck,
  ListTodo,
  Loader2,
  LucideIcon,
  OctagonAlert,
  ScanSearch,
  Signature,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ApplicationSignStage from "./application-sign-stage";

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

const SYNC_SECTION_LABELS: Record<string, string> = {
  enrollment_data: "Enrollment",
  personal_details: "Personal details",
  emergency_contacts: "Emergency contacts",
  health_cover_policy: "Health cover",
  language_cultural_data: "Language & cultural",
  disability_support: "Disability support",
  schooling_history: "Schooling history",
  qualifications: "Qualifications",
  employment_history: "Employment",
  usi: "USI",
  documents: "Documents",
  additional_services: "Additional services",
  survey_responses: "Survey/Declaration",
  declaration: "Declaration",
};

const SYNC_IGNORED_KEYS: (keyof ApplicationSyncMetadata)[] = [
  "additional_services",
  "survey_responses",
  "declaration",
  "enrollment_data",
  "employment_history",
  "usi",
];

const SYNC_ALLOW_NULL_KEYS: (keyof ApplicationSyncMetadata)[] = [
  "qualifications",
];

const ApplicationStage = ({ id, current_role }: ApplicationStageProps) => {
  const { data: response, isLoading } = useApplicationGetQuery(id);
  const { data: gsAssessmentResponse } = useGSAssessmentQuery(id);
  const changeStage = useApplicationChangeStageMutation(id);
  const sendOfferLetter = useApplicationSendOfferLetterMutation(id);
  const enrollGalaxyCourse = useApplicationEnrollGalaxyCourseMutation(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const application = response?.data;
  const isStaff = current_role === USER_ROLE.STAFF;
  const currentStage = application?.current_stage;
  const [activeStage, setActiveStage] = useState<APPLICATION_STAGE | null>(
    currentStage ?? null,
  );
  const [syncAlertOpen, setSyncAlertOpen] = useState(false);

  useEffect(() => {
    if (currentStage) setActiveStage(currentStage);
  }, [currentStage]);

  const gsAssessmentData = useMemo(
    () =>
      transformGSAssessmentData(
        gsAssessmentResponse?.data as Record<string, unknown> | null,
      ),
    [gsAssessmentResponse?.data],
  );

  const { stepsProgress } = useGSAssessmentProgress(gsAssessmentData);

  const isAllStagesSynced = useMemo(
    () =>
      isSyncMetadataComplete(application?.sync_metadata ?? null, {
        ignoredKeys: SYNC_IGNORED_KEYS,
        allowNullKeys: SYNC_ALLOW_NULL_KEYS,
        requireNoErrors: true,
      }),
    [application?.sync_metadata],
  );

  const unsyncedSectionKeys = useMemo(() => {
    const metadata = application?.sync_metadata ?? null;
    if (!metadata) return [];

    return Object.entries(metadata)
      .filter(
        ([key]) =>
          !SYNC_IGNORED_KEYS.includes(key as keyof ApplicationSyncMetadata),
      )
      .filter(([key, value]) => {
        if (
          value == null &&
          SYNC_ALLOW_NULL_KEYS.includes(key as keyof ApplicationSyncMetadata)
        ) {
          return false;
        }
        if (!value) return true;
        if (value.uptodate !== true) return true;
        if (!value.last_synced_at) return true;
        if (value.last_error) return true;
        return false;
      })
      .map(([key]) => key);
  }, [application?.sync_metadata]);

  const ensureSynced = () => {
    const ok = isAllStagesSynced === true;
    if (!ok) setSyncAlertOpen(true);
    return ok;
  };

  const handleStartReview = (toStage: APPLICATION_STAGE) => {
    changeStage.mutate(
      { to_stage: toStage },
      {
        onSuccess: () => {
          toast.success(`Application is now under review.`);
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

  const handleMoveToGs = (str: APPLICATION_STAGE) => {
    changeStage.mutate(
      { to_stage: str },
      {
        onSuccess: () => {
          // GS tab client code redirects to Details if it reads a stale stage from cache.
          queryClient.setQueryData<ServiceResponse<ApplicationDetailResponse>>(
            ["application-get", id],
            (old) => {
              if (!old?.data) return old;
              return {
                ...old,
                data: { ...old.data, current_stage: str },
              };
            },
          );

          router.push(siteRoutes.dashboard.application.id.gs(id));
        },
      },
    );
  };

  const navigateToStageRoute = (stage: APPLICATION_STAGE) => {
    if (!id) return;

    let destination: string;

    switch (stage) {
      case APPLICATION_STAGE.GS_ASSESSMENT:
        destination = siteRoutes.dashboard.application.id.gs(id);
        break;

      case APPLICATION_STAGE.COE_ISSUED:
        destination = siteRoutes.dashboard.application.id.coe(id);
        break;

      default:
        destination = siteRoutes.dashboard.application.id.details(id);
    }

    router.push(destination);
  };

  const handleEnrollGalaxyCourse = () => {
    if (!ensureSynced()) return;
    enrollGalaxyCourse.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          data?.message || "Course enrollment in Galaxy completed.",
        );
        handleSendOfferLetter();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to enroll course in Galaxy");
      },
    });
  };

  const handleSendOfferLetter = () => {
    if (!ensureSynced()) return;
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

  const handleStageClick = (stage: APPLICATION_STAGE) => {
    const isNavigableStage =
      stage === APPLICATION_STAGE.GS_ASSESSMENT ||
      stage === APPLICATION_STAGE.COE_ISSUED;

    if (isNavigableStage) {
      navigateToStageRoute(stage);
      setActiveStage(stage);
      return;
    }

    setActiveStage((prev) => (prev === stage ? (currentStage ?? null) : stage));
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
          <ApplicationSignStage
            applicationId={id}
            currentRole={current_role}
            studentEmail={application?.personal_details?.email}
            cardBorderClass={cardBorderClass}
            handleStageChange={handleMoveToGs}
            isInteractive={isInteractive}
            isAllStagesSynced={isAllStagesSynced}
            onSyncBlocked={() => setSyncAlertOpen(true)}
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

            <div className="space-y-1 mb-4">
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

            {/* <Button
              onClick={() =>
                navigateToStageRoute(APPLICATION_STAGE.GS_ASSESSMENT)
              }
              variant="outline"
              className="w-full gap-2 shadow-none"
            >
              <Eye className="h-4 w-4" />
              Open GS Process Tab
            </Button> */}
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

            {/* <Button
              onClick={() => navigateToStageRoute(APPLICATION_STAGE.COE_ISSUED)}
              variant="outline"
              className="w-full gap-2 shadow-none"
            >
              <Eye className="h-4 w-4" />
              Open COE Tab
            </Button> */}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
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

          const cardBorderClass = `
          p-3 border-x-2 last:border-b-2  flex flex-col  gap-0
          ${isCurrent ? "bg-primary/5 border-primary" : ""}
          border-b-2 last:rounded-bg-lg
        `;

          return (
            <React.Fragment key={el}>
              <button
                type="button"
                onClick={() => handleStageClick(el)}
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
      </div>

      {application.current_stage !== APPLICATION_STAGE.DRAFT &&
        !isAllStagesSynced &&
        unsyncedSectionKeys.length > 0 && (
          <div className="mt-3 rounded-md border border-destructive bg-destructive/20 p-3 text-sm text-destructive-foreground">
            <p className="font-medium">
              The following sections are not synced:
            </p>
            <p className="my-1.5">
              {unsyncedSectionKeys
                .map((key) => SYNC_SECTION_LABELS[key] ?? key)
                .join(", ")}
            </p>
            Please{" "}
            <Link
              className="text-primary-foreground underline"
              href={siteRoutes.dashboard.application.edit(id)}
            >
              update the form
            </Link>{" "}
            if you can{"'"}t see the section.
          </div>
        )}

      <Dialog open={syncAlertOpen} onOpenChange={setSyncAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <OctagonAlert className="h-5 w-5 text-destructive" />
              <DialogTitle>Sync required</DialogTitle>
            </div>
            <DialogDescription>
              All application sections must be synced and error-free before you
              can send or resend the offer letter. Please run the sync and try
              again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
            <Button onClick={() => setSyncAlertOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationStage;
