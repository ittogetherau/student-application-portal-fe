"use client";

import { siteRoutes } from "@/shared/constants/site-routes";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import Link from "next/link";

export default function CoeIssuedCard({
  stage,
  applicationId,
}: {
  stage?: APPLICATION_STAGE | string | null;
  applicationId: string;
}) {
  const isAccepted = stage === APPLICATION_STAGE.ACCEPTED;
  const isCoeIssued = stage === APPLICATION_STAGE.COE_ISSUED;

  return (
    <div className="mb-4">
      {isAccepted ? (
        <>
          <p className="text-sm font-medium text-foreground">COE has been issued</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This application has completed the COE step successfully.
          </p>
        </>
      ) : isCoeIssued ? (
        <>
          <p className="text-sm font-medium text-foreground">COE action required</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please continue on the COE tab to complete this stage.
          </p>
          <Link
            href={siteRoutes.dashboard.application.id.coe(applicationId)}
            className="mt-1 inline-flex text-xs font-medium text-primary underline underline-offset-2"
          >
            Go to COE tab
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            COE step is not available yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please complete previous stages before proceeding to COE.
          </p>
        </>
      )}
    </div>
  );
}
