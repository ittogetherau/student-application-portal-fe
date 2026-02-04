"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { siteRoutes } from "@/constants/site-routes";
import GsTab from "@/features/application-detail/components/tabs/gs-tab";
import { shouldShowGsRoute } from "@/features/application-detail/utils/stage-utils";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";

export default function GsClient({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const { data } = useApplicationGetQuery(applicationId);
  const application = data?.data;
  const { data: session } = useSession();

  const isStaff = session?.user.role === "staff" || !!session?.user.staff_admin;

  useEffect(() => {
    if (!application) return;
    if (!shouldShowGsRoute(application.current_stage)) {
      router.replace(
        siteRoutes.dashboard.application.id.details(applicationId),
      );
    }
  }, [application, applicationId, router]);

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
