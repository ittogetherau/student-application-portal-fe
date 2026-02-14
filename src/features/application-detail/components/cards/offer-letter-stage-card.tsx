"use client";

import { siteRoutes } from "@/shared/constants/site-routes";
import ApplicationSignStage from "@/features/application-detail/components/stages/application-sign-stage";
import type { ApplicationDetailResponse } from "@/service/application.service";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import { useApplicationChangeStageMutation } from "@/shared/hooks/use-applications";
import type { ServiceResponse } from "@/shared/types/service";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type OfferLetterStageCardProps = {
  applicationId: string;
  currentRole?: string;
  studentEmail?: string | null;
  isInteractive: boolean;
  isAllStagesSynced: boolean;
  onSyncBlocked: () => void;
};

export default function OfferLetterStageCard({
  applicationId,
  currentRole,
  studentEmail,
  isInteractive,
  isAllStagesSynced,
  onSyncBlocked,
}: OfferLetterStageCardProps) {
  const changeStage = useApplicationChangeStageMutation(applicationId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleMoveToGs = (toStage: APPLICATION_STAGE) => {
    changeStage.mutate(
      { to_stage: toStage },
      {
        onSuccess: () => {
          queryClient.setQueryData<ServiceResponse<ApplicationDetailResponse>>(
            ["application-get", applicationId],
            (old) => {
              if (!old?.data) return old;
              return {
                ...old,
                data: { ...old.data, current_stage: toStage },
              };
            },
          );

          router.push(siteRoutes.dashboard.application.id.gs(applicationId));
        },
      },
    );
  };

  return (
    <ApplicationSignStage
      applicationId={applicationId}
      currentRole={currentRole}
      studentEmail={studentEmail}
      handleStageChange={handleMoveToGs}
      isInteractive={isInteractive}
      isAllStagesSynced={isAllStagesSynced}
      onSyncBlocked={onSyncBlocked}
    />
  );
}
