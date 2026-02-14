"use client";

import { Plus, SquarePen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplicationActionsMenu } from "@/features/application-detail/components/toolbar/application-actions-menu";
import { StaffAssignmentSelect } from "@/features/application-detail/components/toolbar/staff-assignment-select";
import StudentEnrollmentForm from "@/features/application-form/components/student-enrollment/student-enrollment-form";
import { siteRoutes } from "@/shared/constants/site-routes";
import { APPLICATION_STAGE } from "@/shared/constants/types";

type ApplicationHeaderActionsProps = {
  applicationId: string;
  assignedStaffId: string | null;
  stage: APPLICATION_STAGE;
  role?: string;
  isAdminStaff?: boolean;
  onStartConversation: () => void;
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
  stage,
  role,
  isAdminStaff,
  onStartConversation,
}: ApplicationHeaderActionsProps) {
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);

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

        {role === "staff" && isAdminStaff ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEnrollmentDialogOpen(true)}
            >
              Manage Enrollment
            </Button>

            <div className="w-[12rem] min-w-0 shrink">
              <StaffAssignmentSelect
                assignedStaffId={assignedStaffId}
                applicationId={applicationId}
              />
            </div>

            <ApplicationActionsMenu applicationId={applicationId} />
          </>
        ) : null}

        <Button
          size="sm"
          className="w-full sm:w-auto gap-2"
          onClick={onStartConversation}
        >
          <Plus className="h-4 w-4" />
          Start Conversation
        </Button>
      </div>

      <Dialog
        open={isEnrollmentDialogOpen}
        onOpenChange={setIsEnrollmentDialogOpen}
      >
        <DialogContent className="max-w-4xl h-[85vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Manage Student Enrollment</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 px-6 pb-6">
            <StudentEnrollmentForm
              isDialogMode
              applicationId={applicationId}
              onSubmitSuccess={() => setIsEnrollmentDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
