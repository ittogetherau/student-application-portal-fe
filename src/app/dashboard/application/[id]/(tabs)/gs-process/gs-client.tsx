"use client";

import { useRoleFlags } from "@/shared/hooks/use-role-flags";

import GsTab from "@/features/application-detail/components/tabs/gs-tab";
import { useStageRouteGuard } from "@/features/application-detail/hooks/useStageRouteGuard.hook";
import { shouldShowGsRoute } from "@/features/application-detail/utils/stage-utils";

export default function GsClient({ applicationId }: { applicationId: string }) {
  const application = useStageRouteGuard({
    applicationId,
    canAccess: shouldShowGsRoute,
  });
  const { isStaffOrAdmin: isStaff } = useRoleFlags();

  if (!application) {
    return null;
  }

  return (
    <GsTab
      applicationId={applicationId}
      trackingCode={application.tracking_code ?? null}
      isStaff={isStaff}
    />
  );
}
