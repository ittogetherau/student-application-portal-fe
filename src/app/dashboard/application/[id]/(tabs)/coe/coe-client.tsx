"use client";

import CoeTab from "@/features/application-detail/components/tabs/coe-tab";
import { useStageRouteGuard } from "@/features/application-detail/hooks/useStageRouteGuard.hook";
import { shouldShowCoeRoute } from "@/features/application-detail/utils/stage-utils";

export default function CoeClient({
  applicationId,
}: {
  applicationId: string;
}) {
  const application = useStageRouteGuard({
    applicationId,
    canAccess: shouldShowCoeRoute,
  });

  if (!application) return null;

  return <CoeTab applicationId={applicationId} />;
}
