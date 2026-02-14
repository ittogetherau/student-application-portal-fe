"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { siteRoutes } from "@/shared/constants/site-routes";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";

type UseStageRouteGuardOptions = {
  applicationId: string;
  canAccess: (stage: string | undefined) => boolean;
};

export function useStageRouteGuard({
  applicationId,
  canAccess,
}: UseStageRouteGuardOptions) {
  const router = useRouter();
  const { data } = useApplicationGetQuery(applicationId);
  const application = data?.data;

  useEffect(() => {
    if (!application) return;
    if (canAccess(application.current_stage)) return;

    router.replace(siteRoutes.dashboard.application.id.details(applicationId));
  }, [application, applicationId, canAccess, router]);

  return application;
}
