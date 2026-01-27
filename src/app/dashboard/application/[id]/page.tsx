"use client";

import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
import GuidedTooltip from "@/components/shared/guided-tooltip";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import TwoColumnLayout from "@/components/ui-kit/layout/two-column-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteRoutes } from "@/constants/site-routes";
import { APPLICATION_STAGE } from "@/constants/types";
import { useApplicationGetQuery } from "@/hooks/useApplication.hook";
import { ArrowLeft, Plus, SquarePen } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import ReviewForm from "../create/_forms/review-form";
import ApplicationStage from "./_components/ApplicationStage";
import CreateThreadForm from "./_components/forms/CreateThreadForm";
import ThreadMessagesPanel from "./_components/panels/thread-messages-panel";
import { ApplicationActionsMenu } from "./_components/ApplicationActionsMenu";
import { ErrorState, LoadingState, NotFoundState } from "./_components/states";
import CommunicationTab from "./_components/tabs/CommunicationTab";
import DocumentsTab from "./_components/tabs/DocumentsTab";
import GSTab from "./_components/tabs/gs-tab";
import Timeline from "./_components/tabs/TimelineTab";

const validTabs = [
  "details",
  "documents",
  "timeline",
  "gs-process",
  "communication",
];

export default function AgentApplicationDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [tabParam, setTabParam] = useQueryState("tab");
  const hasSetInitialTab = useRef(false);

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useApplicationGetQuery(id);

  const application = response?.data;
  const isGSAssessment =
    application?.current_stage === APPLICATION_STAGE.GS_ASSESSMENT;

  useEffect(() => {
    if (hasSetInitialTab.current || !application) return;

    if (!tabParam) {
      const defaultTab = isGSAssessment ? "gs-process" : "details";
      setTabParam(defaultTab);
    }
    hasSetInitialTab.current = true;
  }, [application, tabParam, setTabParam, isGSAssessment]);

  const activeTab =
    tabParam && validTabs.includes(tabParam)
      ? tabParam
      : isGSAssessment
        ? "gs-process"
        : "details";

  useEffect(() => {
    if (tabParam && !validTabs.includes(tabParam)) {
      setTabParam(null);
    }
  }, [tabParam, setTabParam]);

  const { data: session } = useSession();
  const ROLE = session?.user.role;
  const IS_ADMIN_STAFF = session?.user.staff_admin;
  const isStaffOrAdmin = ROLE === "staff" || !!IS_ADMIN_STAFF;

  const handleBackNavigation = () =>
    router.push(siteRoutes.dashboard.application.root);

  if (isLoading) return <LoadingState />;
  if (isError)
    return <ErrorState error={error as Error} onBack={handleBackNavigation} />;
  if (!application) return <NotFoundState onBack={handleBackNavigation} />;

  const studentName = () => {
    const given = application.personal_details?.given_name;
    const family = application.personal_details?.family_name;
    return given && family ? `${given} ${family}` : "N/A";
  };

  return (
    <main className="p-6 space-y-4">
      <ThreadMessagesPanel />

      <ContainerLayout>
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="h-8 w-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-medium truncate">
                {studentName()}
              </h1>

              <p className="text-xs text-muted-foreground truncate">
                Reference: {application?.tracking_code || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            {/* Badge */}
            <ApplicationStagePill
              stage={application.current_stage || application.stage || ""}
              role={ROLE}
            />

            {/* Edit */}
            {[
              APPLICATION_STAGE.IN_REVIEW,
              APPLICATION_STAGE.DRAFT,
              APPLICATION_STAGE.SUBMITTED,
              APPLICATION_STAGE.OFFER_LETTER,
            ].includes(application.current_stage) && (
              <Button asChild variant="outline" size="sm" className="gap-2 h-8">
                <Link
                  href={`${siteRoutes.dashboard.application.create}?id=${application.id}&edit=true`}
                >
                  <SquarePen className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </section>
      </ContainerLayout>

      <TwoColumnLayout
        reversed={true}
        sidebar={
          <div className="space-y-4">
            <ApplicationStage
              currentStatus={application.current_stage}
              current_role={ROLE}
              id={id}
            />
          </div>
        }
      >
        <Tabs
          value={activeTab}
          onValueChange={setTabParam}
          className="space-y-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-full sm:w-auto flex flex-wrap justify-start">
              <TabsTrigger value="details" className="text-xs px-3">
                Details
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs px-3">
                Documents
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs px-3">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="gs-process" className="text-xs px-3">
                GS Process
              </TabsTrigger>
              <TabsTrigger value="communication" className="text-xs px-3">
                Communication
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center justify-end gap-2">
              {ROLE === "staff" && IS_ADMIN_STAFF && (
                <GuidedTooltip
                  storageKey="staff:application-detail:actions"
                  text="Assign, accept, reject, or archive this application."
                  enabled={ROLE === "staff" && IS_ADMIN_STAFF}
                >
                  <ApplicationActionsMenu
                    applicationId={application.id}
                    assignedStaffId={application.assigned_staff_id}
                    assignedStaffEmail={
                      (application as { assigned_staff_email?: string | null })
                        .assigned_staff_email
                    }
                  />
                </GuidedTooltip>
              )}

              <Button
                size="sm"
                className="w-full sm:w-auto gap-2"
                onClick={() => setIsCreateThreadOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Thread
              </Button>
            </div>
          </div>

          <TabsContent value="details" className="space-y-3">
            <ReviewForm
              applicationId={application.id}
              showDetails={false}
              showSync={true}
              onNavigateToDocuments={() => setTabParam("documents")}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-3">
            <DocumentsTab
              applicationId={application.id}
              showSync={true}
              isStaffOrAdmin={isStaffOrAdmin}
              syncMeta={application.sync_metadata?.documents}
            />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-3">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base">
                  Application Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Timeline id={application.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gs-process" className="space-y-3">
            <GSTab
              trackingCode={application?.tracking_code}
              applicationId={application.id}
              isStaff={isStaffOrAdmin}
            />
          </TabsContent>

          <TabsContent value="communication" className="space-y-3">
            <CommunicationTab applicationId={application.id} />
          </TabsContent>
        </Tabs>
      </TwoColumnLayout>

      {/* Dialog */}
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
