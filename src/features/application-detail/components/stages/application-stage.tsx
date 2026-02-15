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
import type { ApplicationSyncMetadata } from "@/service/application.service";
import {
  formatStageLabel,
  getStageLabel,
  getStageIcon,
} from "@/shared/config/application-stage.config";
import { siteRoutes } from "@/shared/constants/site-routes";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";
import { BadgeCheck, Loader2, OctagonAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

interface ApplicationStageProps {
  currentStatus: APPLICATION_STAGE;
  id: string;
  current_role?: string;
}

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
  const router = useRouter();

  const application = response?.data;
  const isStaff = current_role === USER_ROLE.STAFF;
  const currentStage = application?.current_stage;
  const [activeStage, setActiveStage] = useState<APPLICATION_STAGE | null>(
    null,
  );
  const [syncAlertOpen, setSyncAlertOpen] = useState(false);

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
            onSyncBlocked={() => setSyncAlertOpen(true)}
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
          const stageLabel = getStageLabel(el, current_role) ?? formatStageLabel(el);

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
                  {renderStageAction({
                    stage: el,
                    isInteractive,
                  })}
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
    </>
  );
};

export default ApplicationStage;
