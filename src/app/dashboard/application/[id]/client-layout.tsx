"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import TwoColumnLayout from "@/components/ui-kit/layout/two-column-layout";
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from "@/components/ui-kit/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ApplicationHeaderActions from "@/features/application-detail/components/layout/application-header-actions";
import ApplicationHeaderDetails from "@/features/application-detail/components/layout/application-header-details";
import ApplicationSidebar from "@/features/application-detail/components/layout/application-sidebar";
import ApplicationTabNav from "@/features/application-detail/components/layout/application-tab-nav";
import { StaffAssignmentSelect } from "@/features/application-detail/components/toolbar/staff-assignment-select";
import {
  getActiveSegment,
  useApplicationLayoutData,
} from "@/features/application-detail/hooks/useApplicationLayoutData.hook";
import ThreadMessagesPanel from "@/features/threads/components/panels/thread-messages-panel";
import { siteRoutes } from "@/shared/constants/site-routes";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { CircleAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";

export default function ClientApplicationLayout({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const {
    role: ROLE,
    isStaff: IS_STAFF,
    isStaffOrAdmin,
    isStaffAdmin: IS_ADMIN_STAFF,
  } = useRoleFlags();

  const {
    application,
    stage,
    showGs,
    showCoe,
    navItems,
    studentName,
    courseLabel,
    campusLabel,
    submittedLabel,
    agentName,
    agentEmail,
    agentPhone,
    isLoading,
    isError,
    error,
  } = useApplicationLayoutData(id);

  const hasAppliedInitialStageRedirect = useRef(false);

  const handleBackNavigation = () =>
    router.push(siteRoutes.dashboard.application.root);

  const activeSegment = getActiveSegment(pathname);
  const isInitialLoading = isLoading && application === undefined;

  useEffect(() => {
    if (hasAppliedInitialStageRedirect.current) return;
    if (activeSegment !== "details") return;
    if (!stage) return;

    if (stage === APPLICATION_STAGE.COE_ISSUED && showCoe) {
      hasAppliedInitialStageRedirect.current = true;
      router.replace(siteRoutes.dashboard.application.id.coe(id));
      return;
    }

    if (stage === APPLICATION_STAGE.GS_ASSESSMENT && showGs) {
      hasAppliedInitialStageRedirect.current = true;
      router.replace(siteRoutes.dashboard.application.id.gs(id));
    }
  }, [activeSegment, id, router, showCoe, showGs, stage]);

  if (isInitialLoading)
    return (
      <div className="mt-4">
        <LoadingState />
      </div>
    );

  if (isError)
    return (
      <div className="mt-4">
        <ErrorState
          description={error instanceof Error ? error.message : undefined}
          action={{ label: "Back", onClick: handleBackNavigation }}
        />
      </div>
    );

  if (application === undefined)
    return (
      <div className="mt-4">
        <LoadingState />
      </div>
    );

  if (application === null)
    return (
      <div className="mt-4">
        <NotFoundState
          title="Application was not found or was removed."
          action={{ label: "Back", onClick: handleBackNavigation }}
        />
      </div>
    );

  const showUnassignedAlert =
    IS_STAFF &&
    stage &&
    stage !== APPLICATION_STAGE.DRAFT &&
    application.assigned_staff_id === null;

  return (
    <main className="space-y-4 p-6">
      <ThreadMessagesPanel />

      <ContainerLayout className="space-y-2">
        <ApplicationHeaderDetails
          applicationId={application.id}
          assignedAgentProfileId={application.agent_profile_id}
          data={{
            studentName,
            trackingCode: application.tracking_code,
            studentEmail: application.personal_details?.email,
            courseLabel,
            campusLabel,
            submittedLabel,
            agentName,
            agentEmail,
            agentPhone,
          }}
          isStaffOrAdmin={isStaffOrAdmin}
          onBack={handleBackNavigation}
        />

        <ApplicationHeaderActions
          applicationId={application.id}
          assignedStaffId={application.assigned_staff_id}
          stage={stage}
          hasUploadedCeoPaymentProof={
            application.has_uploaded_ceo_payment_proof
          }
          submittedByStudent={application.submitted_by_student}
        />
      </ContainerLayout>

      <Dialog open={showUnassignedAlert}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CircleAlert className="text-destructive" />
              Staff member not assigned
            </DialogTitle>
            <DialogDescription>
              This application is not assigned to a staff member yet.
              {IS_ADMIN_STAFF ? (
                <> Assign a staff member to continue.</>
              ) : (
                <> Please contact an administrator to assign a staff member.</>
              )}
            </DialogDescription>
          </DialogHeader>

          {IS_ADMIN_STAFF ? (
            <div className="w-full">
              <StaffAssignmentSelect applicationId={application.id} />
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleBackNavigation}>
              Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TwoColumnLayout
        reversed
        sticky={true}
        sidebar={<ApplicationSidebar id={id} stage={stage} role={ROLE} />}
      >
        <div className="space-y-3">
          <ApplicationTabNav
            activeSegment={activeSegment}
            applicationId={application.id}
            navItems={navItems}
          />
          <div className="space-y-4">{children}</div>
        </div>
      </TwoColumnLayout>
    </main>
  );
}
