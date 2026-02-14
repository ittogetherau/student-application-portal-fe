"use client";

import { useSession } from "next-auth/react";

import GsTab from "@/features/application-detail/components/tabs/gs-tab";
import { useStageRouteGuard } from "@/features/application-detail/hooks/useStageRouteGuard.hook";
import { shouldShowGsRoute } from "@/features/application-detail/utils/stage-utils";

export default function GsClient({ applicationId }: { applicationId: string }) {
  const application = useStageRouteGuard({
    applicationId,
    canAccess: shouldShowGsRoute,
  });
  const { data: session } = useSession();

  const isStaff = session?.user.role === "staff" || !!session?.user.staff_admin;

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
