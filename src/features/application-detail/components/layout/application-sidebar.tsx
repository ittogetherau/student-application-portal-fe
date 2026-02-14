import { CheckCircle2, XCircle } from "lucide-react";

import ApplicationStage from "@/features/application-detail/components/stages/application-stage";
import { APPLICATION_STAGE } from "@/shared/constants/types";

type ApplicationSidebarProps = {
  id: string;
  stage: APPLICATION_STAGE;
  role?: string;
};

export default function ApplicationSidebar({
  id,
  stage,
  role,
}: ApplicationSidebarProps) {
  return (
    <div className="space-y-4">
      <ApplicationStage currentStatus={stage} current_role={role} id={id} />

      {stage === APPLICATION_STAGE.REJECTED ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-destructive">
              Application rejected
            </div>
            <div className="text-xs text-muted-foreground">
              This application was rejected by staff.
            </div>
          </div>
        </div>
      ) : null}

      {stage === APPLICATION_STAGE.ACCEPTED ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-emerald-700">
              Application Completed
            </div>
            <div className="text-xs text-muted-foreground">
              This application has been completed by staff.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
