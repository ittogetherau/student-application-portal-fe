"use client";

import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
import { Button } from "@/components/ui/button";
import { AgentAssignmentSelect } from "@/features/application-detail/components/toolbar/agent-assignment-select";
import { ApplicationActionsMenu } from "@/features/application-detail/components/toolbar/application-actions-menu";
import { StaffAssignmentSelect } from "@/features/application-detail/components/toolbar/staff-assignment-select";
import CreateThreadButton from "@/features/threads/components/buttons/create-thread-button";
import { siteRoutes } from "@/shared/constants/site-routes";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { SquarePen } from "lucide-react";
import Link from "next/link";

type ApplicationHeaderActionsProps = {
  applicationId: string;
  assignedStaffId: string | null;
  assignedAgentProfileId?: string | null;
  assignedAgentEmail?: string | null;
  stage: APPLICATION_STAGE;
};

const EDITABLE_STAGES = [
  APPLICATION_STAGE.IN_REVIEW,
  APPLICATION_STAGE.DRAFT,
  APPLICATION_STAGE.SUBMITTED,
  APPLICATION_STAGE.OFFER_LETTER,
];

export default function ApplicationHeaderActions({
  applicationId,
  assignedStaffId,
  assignedAgentProfileId = null,
  assignedAgentEmail = null,
  stage,
}: ApplicationHeaderActionsProps) {
  const { role, isStaffAdmin } = useRoleFlags();

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
        <ApplicationStagePill stage={stage} role={role} />

        {EDITABLE_STAGES.includes(stage) ? (
          <Button asChild variant="outline" size="sm" className="gap-2 h-8">
            <Link
              href={`${siteRoutes.dashboard.application.create}?id=${applicationId}&edit=true`}
            >
              <SquarePen className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        ) : null}

        {role === USER_ROLE.STAFF ? (
          <>
            {isStaffAdmin && (
              <div className="w-[13rem] min-w-0 shrink">
                <StaffAssignmentSelect
                  assignedStaffId={assignedStaffId}
                  applicationId={applicationId}
                />
              </div>
            )}

            {/* <div className="w-[13rem] min-w-0 shrink">
              <AgentAssignmentSelect
                applicationId={applicationId}
                assignedAgentProfileId={assignedAgentProfileId}
                assignedAgentEmail={assignedAgentEmail}
              />
            </div> */}

            <ApplicationActionsMenu applicationId={applicationId} />
          </>
        ) : null}

        <CreateThreadButton variant={"default"} applicationId={applicationId} />
      </div>
    </>
  );
}
