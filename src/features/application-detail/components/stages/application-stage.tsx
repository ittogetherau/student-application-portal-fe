"use client";

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
import {
  CoeIssuedCard,
  GSAssessmentProgressCard,
  InReviewStageCard,
  OfferLetterStageCard,
  StageCardShell,
  SubmittedStageCard,
  UnsyncedSectionsCard,
} from "@/features/application-detail/components/cards";
import { isSyncMetadataComplete } from "@/features/application-form/components/sync/sync-all-to-galaxy";
import {
  APPLICATION_SYNC_COMPLETION_ALLOW_NULL_KEYS,
  APPLICATION_SYNC_COMPLETION_IGNORED_KEYS,
} from "@/shared/constants/application-sync";
import type { ApplicationSyncMetadata } from "@/service/application.service";
import {
  formatStageLabel,
  getStageIcon,
  getStageLabel,
} from "@/shared/config/application-stage.config";
import { siteRoutes } from "@/shared/constants/site-routes";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";
import { useApplicationUnresolvedThreadsQuery } from "@/features/threads/hooks/application-threads.hook";
import { BadgeCheck, Loader2, OctagonAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useRef, useState } from "react";

interface ApplicationStageProps {
  currentStatus: APPLICATION_STAGE;
  id: string;
  current_role?: string;
}

const AGENT_STAGE_FALLBACKS = new Set<APPLICATION_STAGE>([
  APPLICATION_STAGE.SUBMITTED,
  APPLICATION_STAGE.IN_REVIEW,
]);

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

const getAgentStageFallbackCopy = ({
  stageLabel,
  isCurrentStage,
  isFutureStage,
}: {
  stageLabel: string;
  isCurrentStage: boolean;
  isFutureStage: boolean;
}) => {
  if (isCurrentStage) {
    return {
      title: "This stage in progress",
      description: "We are currently working through this stage.",
    };
  }

  if (isFutureStage) {
    return {
      title: `${stageLabel} stage is not available yet`,
      description: "Please complete previous stages before proceeding.",
    };
  }

  return {
    title: `${stageLabel} stage completed`,
    description: "This stage has already been completed.",
  };
};

const AgentStageFallbackMessage = ({
  stageLabel,
  isCurrentStage,
  isFutureStage,
}: {
  stageLabel: string;
  isCurrentStage: boolean;
  isFutureStage: boolean;
}) => {
  const { title, description } = getAgentStageFallbackCopy({
    stageLabel,
    isCurrentStage,
    isFutureStage,
  });

  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

const ApplicationStage = ({ id, current_role }: ApplicationStageProps) => {
  const { data: response, isLoading } = useApplicationGetQuery(id);
  const unresolvedThreadsQuery = useApplicationUnresolvedThreadsQuery(id);
  const router = useRouter();

  const application = response?.data;
  const isStaff = current_role === USER_ROLE.STAFF;
  const currentStage = application?.current_stage;
  const [activeStage, setActiveStage] = useState<APPLICATION_STAGE | null>(
    null,
  );
  const [syncAlertOpen, setSyncAlertOpen] = useState(false);
  const [unresolvedAlertOpen, setUnresolvedAlertOpen] = useState(false);
  const pendingCtaActionRef = useRef<null | (() => void)>(null);

  const unresolvedCount =
    unresolvedThreadsQuery.data?.data?.unresolved_count ?? 0;
  const shouldWarnUnresolvedCommunications =
    unresolvedCount > 0 &&
    !unresolvedThreadsQuery.isLoading &&
    !unresolvedThreadsQuery.isError;

  const runWithUnresolvedCommunicationsWarning = useCallback(
    (action: () => void) => {
      if (shouldWarnUnresolvedCommunications) {
        pendingCtaActionRef.current = action;
        setUnresolvedAlertOpen(true);
        return;
      }

      action();
    },
    [shouldWarnUnresolvedCommunications],
  );

  const handleUnresolvedAlertClose = useCallback(() => {
    pendingCtaActionRef.current = null;
    setUnresolvedAlertOpen(false);
  }, []);

  const handleIgnoreUnresolvedAndContinue = useCallback(() => {
    const action = pendingCtaActionRef.current;
    pendingCtaActionRef.current = null;
    setUnresolvedAlertOpen(false);
    action?.();
  }, []);

  const isAllStagesSynced = useMemo(
    () =>
      isSyncMetadataComplete(application?.sync_metadata ?? null, {
        ignoredKeys: APPLICATION_SYNC_COMPLETION_IGNORED_KEYS,
        allowNullKeys: APPLICATION_SYNC_COMPLETION_ALLOW_NULL_KEYS,
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
          !APPLICATION_SYNC_COMPLETION_IGNORED_KEYS.includes(
            key as keyof ApplicationSyncMetadata,
          ),
      )
      .filter(([key, value]) => {
        if (
          value == null &&
          APPLICATION_SYNC_COMPLETION_ALLOW_NULL_KEYS.includes(
            key as keyof ApplicationSyncMetadata,
          )
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
  const displayStage =
    currentStage === APPLICATION_STAGE.ACCEPTED
      ? APPLICATION_STAGE.COE_ISSUED
      : currentStage;
  const currentStageForIndex =
    displayStage && stages.includes(displayStage as (typeof stages)[number])
      ? (displayStage as (typeof stages)[number])
      : stages[0];
  const currentIndex = stages.indexOf(currentStageForIndex);
  const selectedOrCurrentStage = activeStage ?? displayStage ?? null;

  const renderStageAction = ({
    stage,
    isInteractive,
  }: {
    stage: APPLICATION_STAGE;
    isInteractive: boolean;
  }) => {
    switch (stage) {
      case APPLICATION_STAGE.SUBMITTED: {
        if (!isStaff) return null;
        return (
          <SubmittedStageCard
            applicationId={id}
            isInteractive={isInteractive}
            withUnresolvedWarning={runWithUnresolvedCommunicationsWarning}
          />
        );
      }

      case APPLICATION_STAGE.IN_REVIEW: {
        if (!isStaff) return null;

        const studentName = `${application?.personal_details?.given_name} ${
          application?.personal_details?.middle_name || ""
        } ${application?.personal_details?.family_name}`;

        return (
          <InReviewStageCard
            applicationId={id}
            isInteractive={isInteractive}
            isAllStagesSynced={isAllStagesSynced}
            onSyncBlocked={() => setSyncAlertOpen(true)}
            studentEmail={application?.personal_details?.email}
            studentName={studentName}
            withUnresolvedWarning={runWithUnresolvedCommunicationsWarning}
          />
        );
      }

      case APPLICATION_STAGE.OFFER_LETTER: {
        return (
          <OfferLetterStageCard
            applicationId={id}
            currentRole={current_role}
            studentEmail={application?.personal_details?.email}
            isInteractive={isInteractive}
            isAllStagesSynced={isAllStagesSynced}
            syncMetadata={application?.sync_metadata ?? null}
            withUnresolvedWarning={runWithUnresolvedCommunicationsWarning}
          />
        );
      }
      case APPLICATION_STAGE.GS_ASSESSMENT: {
        return <GSAssessmentProgressCard applicationId={id} />;
      }

      case APPLICATION_STAGE.COE_ISSUED: {
        return <CoeIssuedCard stage={currentStage} applicationId={id} />;
      }

      case APPLICATION_STAGE.ACCEPTED: {
        return <CoeIssuedCard stage={currentStage} applicationId={id} />;
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

          const Icon = getStageIcon(el);
          const isCurrent = i === currentIndex;
          const isActive = selectedOrCurrentStage === el;
          const isInteractive = isCurrent && isActive;
          const isFutureStage = i > currentIndex;
          const stageLabel =
            getStageLabel(el, current_role) ?? formatStageLabel(el);
          const showAgentFallback = !isStaff && AGENT_STAGE_FALLBACKS.has(el);

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

              {isActive ? (
                <StageCardShell isCurrent={isCurrent}>
                  {showAgentFallback ? (
                    <AgentStageFallbackMessage
                      stageLabel={stageLabel}
                      isCurrentStage={isCurrent}
                      isFutureStage={isFutureStage}
                    />
                  ) : (
                    renderStageAction({
                      stage: el,
                      isInteractive,
                    })
                  )}
                </StageCardShell>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      {application.current_stage !== APPLICATION_STAGE.DRAFT &&
        !isAllStagesSynced &&
        unsyncedSectionKeys.length > 0 && (
          <UnsyncedSectionsCard
            applicationId={id}
            sectionKeys={unsyncedSectionKeys}
            sectionLabels={SYNC_SECTION_LABELS}
          />
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
    </>
  );
};

export default ApplicationStage;
