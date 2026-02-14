"use client";

import TwoColumnLayout from "@/components/ui-kit/layout/two-column-layout";
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from "@/components/ui-kit/states";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { siteRoutes } from "@/shared/constants/site-routes";
import ApplicationHeaderActions from "@/features/application-detail/components/layout/application-header-actions";
import ApplicationHeaderDetails from "@/features/application-detail/components/layout/application-header-details";
import ApplicationSidebar from "@/features/application-detail/components/layout/application-sidebar";
import ApplicationTabNav from "@/features/application-detail/components/layout/application-tab-nav";
import CreateThreadForm from "@/features/threads/components/forms/create-thread-form";
import ThreadMessagesPanel from "@/features/threads/components/panels/thread-messages-panel";
import {
  getActiveSegment,
  useApplicationLayoutData,
} from "@/features/application-detail/hooks/useApplicationLayoutData.hook";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

export default function ClientApplicationLayout({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();
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

  const ROLE = session?.user.role;
  const IS_ADMIN_STAFF = session?.user.staff_admin;
  const isStaffOrAdmin = ROLE === "staff" || !!IS_ADMIN_STAFF;
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const hasAppliedInitialStageRedirect = useRef(false);

  const handleBackNavigation = () =>
    router.push(siteRoutes.dashboard.application.root);

  const activeSegment = getActiveSegment(pathname);

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

  if (isLoading)
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

  if (!application)
    return (
      <div className="mt-4">
        <NotFoundState
          action={{ label: "Back", onClick: handleBackNavigation }}
        />
      </div>
    );

  return (
    <main className="space-y-4 p-6">
      <ThreadMessagesPanel />

      <ContainerLayout className="space-y-2">
        <ApplicationHeaderDetails
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
          role={ROLE}
          isAdminStaff={IS_ADMIN_STAFF}
          onStartConversation={() => setIsCreateThreadOpen(true)}
        />
      </ContainerLayout>

      <TwoColumnLayout
        reversed
        sticky={true}
        sidebar={<ApplicationSidebar id={id} stage={stage} role={ROLE} />}
      >
        <div className="space-y-3">
          <ApplicationTabNav
            activeSegment={activeSegment}
            navItems={navItems}
          />
          <div className="space-y-4">{children}</div>
        </div>
      </TwoColumnLayout>

      <Dialog
        open={isCreateThreadOpen}
        onOpenChange={(open) => setIsCreateThreadOpen(open)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Communication Thread</DialogTitle>
          </DialogHeader>
          <CreateThreadForm
            applicationId={application.id}
            onSuccess={() => setIsCreateThreadOpen(false)}
            currentRole={ROLE}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
