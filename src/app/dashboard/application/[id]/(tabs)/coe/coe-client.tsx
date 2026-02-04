"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { siteRoutes } from "@/constants/site-routes";
import CoeTab from "@/features/application-detail/components/tabs/coe-tab";
import { shouldShowCoeRoute } from "@/features/application-detail/utils/stage-utils";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";

export default function CoeClient({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const { data } = useApplicationGetQuery(applicationId);
  const application = data?.data;

  useEffect(() => {
    if (!application) return;
    if (!shouldShowCoeRoute(application.current_stage)) {
      router.replace(
        siteRoutes.dashboard.application.id.details(applicationId),
      );
    }
  }, [application, applicationId, router]);

  if (!application) {
    return null;
  }

  return <CoeTab applicationId={applicationId} />;
}
