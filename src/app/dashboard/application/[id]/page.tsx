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
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Hash,
  Mail,
  MapPin,
  Plus,
  SquarePen,
  User,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { ReactNode, useEffect, useRef, useState } from "react";
import ReviewForm from "../create/_forms/review-form";
import { ApplicationActionsMenu } from "./_components/ApplicationActionsMenu";
import ApplicationStage from "./_components/ApplicationStage";
import CreateThreadForm from "./_components/forms/CreateThreadForm";
import ThreadMessagesPanel from "./_components/panels/thread-messages-panel";
import { ErrorState, LoadingState, NotFoundState } from "./_components/states";
import CoeTab from "./_components/tabs/coe-tab";
import CommunicationTab from "./_components/tabs/communication-tab";
import DocumentsTab from "./_components/tabs/DocumentsTab";
import GSTab from "./_components/tabs/gs-tab";
import Timeline from "./_components/tabs/TimelineTab";

const BASE_TABS = [
  "details",
  "documents",
  "timeline",
  "communication",
] as const;
type TabValue = (typeof BASE_TABS)[number] | "gs-process" | "coe";

const STAGE_ORDER: APPLICATION_STAGE[] = [
  APPLICATION_STAGE.DRAFT,
  APPLICATION_STAGE.SUBMITTED,
  APPLICATION_STAGE.IN_REVIEW,
  APPLICATION_STAGE.OFFER_LETTER,
  APPLICATION_STAGE.GS_ASSESSMENT,
  APPLICATION_STAGE.COE_ISSUED,
  APPLICATION_STAGE.ACCEPTED,
];

const isStageAtLeast = (
  current: APPLICATION_STAGE | null | undefined,
  target: APPLICATION_STAGE,
) => {
  if (!current || current === APPLICATION_STAGE.REJECTED) return false;
  const currentIndex = STAGE_ORDER.indexOf(current);
  const targetIndex = STAGE_ORDER.indexOf(target);
  return currentIndex >= targetIndex && targetIndex !== -1;
};

const getAvailableTabs = (stage?: APPLICATION_STAGE | null) => {
  const tabs: TabValue[] = [...BASE_TABS];
  const showGs = isStageAtLeast(stage, APPLICATION_STAGE.GS_ASSESSMENT);
  const showCoe = isStageAtLeast(stage, APPLICATION_STAGE.COE_ISSUED);

  if (showGs) {
    tabs.splice(3, 0, "gs-process");
  }

  if (showCoe) {
    const insertIndex = tabs.includes("gs-process") ? 4 : 3;
    tabs.splice(insertIndex, 0, "coe");
  }

  return tabs;
};

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value?: string | null;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2 text-xs min-w-0">
      <div className="flex items-center gap-2 text-muted-foreground w-24 shrink-0">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="font-medium truncate">{value || "N/A"}</span>
    </div>
  );
}

export default function AgentApplicationDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [tabParam, setTabParam] = useQueryState("application_tab");
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
  const { data: session } = useSession();
  const ROLE = session?.user.role;
  const IS_ADMIN_STAFF = session?.user.staff_admin;
  const isStaffOrAdmin = ROLE === "staff" || !!IS_ADMIN_STAFF;

  useEffect(() => {
    if (hasSetInitialTab.current || !application) return;

    if (!tabParam) {
      const defaultTab = isGSAssessment ? "gs-process" : "details";
      setTabParam(defaultTab);
    }
    hasSetInitialTab.current = true;
  }, [application, tabParam, setTabParam, isGSAssessment]);

  const availableTabs = getAvailableTabs(application?.current_stage);
  const isRejected = application?.current_stage === APPLICATION_STAGE.REJECTED;
  const availableTabsWithRejected = isRejected
    ? ([
        ...new Set([...availableTabs, "gs-process", "coe"]),
      ] as TabValue[])
    : availableTabs;
  const showGsTab = availableTabsWithRejected.includes("gs-process");
  const showCoeTab = availableTabsWithRejected.includes("coe");

  const activeTab =
    tabParam && availableTabsWithRejected.includes(tabParam as TabValue)
      ? tabParam
      : isGSAssessment && showGsTab
        ? "gs-process"
        : "details";

  useEffect(() => {
    if (
      tabParam &&
      !availableTabsWithRejected.includes(tabParam as TabValue)
    ) {
      setTabParam(null);
    }
  }, [tabParam, setTabParam, availableTabsWithRejected]);

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

  const enrollmentData = application.enrollment_data as {
    course_name?: string;
    course?: string | number;
    campus_name?: string;
    campus?: string | number;
  } | null;

  const courseLabel = String(
    enrollmentData?.course_name ?? enrollmentData?.course ?? "N/A",
  );
  const campusLabel = String(
    enrollmentData?.campus_name ?? enrollmentData?.campus ?? "N/A",
  );

  const agentInfo = application as {
    agent?: {
      agency_name?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    };
    agent_name?: string | null;
    agent_email?: string | null;
  };

  const agentName =
    agentInfo.agent?.agency_name ??
    agentInfo.agent?.name ??
    agentInfo.agent_name ??
    "N/A";
  const agentEmail =
    agentInfo.agent?.email ??
    agentInfo.agent_email ??
    "N/A";
  const agentPhone = agentInfo.agent?.phone ?? null;

  const submittedAt =
    application.submitted_at ?? application.created_at ?? null;
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <main className="p-6 space-y-4">
      <ThreadMessagesPanel />

      <ContainerLayout>
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="h-8 w-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <section className="grid grid-cols-3 gap-6 items-end">
              <div className="space-y-2 min-w-0">
                <h1 className="text-xl sm:text-2xl font-medium truncate">
                  {studentName()}
                </h1>

                <InfoRow
                  icon={<BookOpen className="h-3.5 w-3.5" />}
                  label="Ref ID"
                  value={application?.tracking_code}
                />

                <InfoRow
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Email"
                  value={application?.personal_details?.email}
                />
              </div>

              {/* Application */}
              <div className="space-y-2 min-w-0">
                <InfoRow
                  icon={<BookOpen className="h-3.5 w-3.5" />}
                  label="Course"
                  value={courseLabel}
                />

                <InfoRow
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Campus"
                  value={campusLabel}
                />

                <InfoRow
                  icon={<CalendarCheck className="h-3.5 w-3.5" />}
                  label="Submitted"
                  value={submittedLabel}
                />
              </div>

              {/* Agent */}
              {isStaffOrAdmin ? (
                <div className="space-y-2 min-w-0">
                  <InfoRow
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Agent"
                    value={agentName}
                  />

                  <InfoRow
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Email"
                    value={agentEmail}
                  />
                  {agentPhone ? (
                    <InfoRow
                      icon={<Hash className="h-3.5 w-3.5" />}
                      label="Phone"
                      value={agentPhone}
                    />
                  ) : null}
                </div>
              ) : null}
            </section>
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

            {application.current_stage === APPLICATION_STAGE.REJECTED && (
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
            )}

            {application.current_stage === APPLICATION_STAGE.ACCEPTED && (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />

                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-emerald-700">
                    Application accepted
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This application has been accepted by staff.
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      >
        <Tabs
          value={activeTab}
          onValueChange={setTabParam}
          className="space-y-3"
        >
          <section className="flex flex-col gap-2">
            {/* <div className="flex items-center justify-end gap-2"></div> */}

            <TabsList className="w-fit">
              <TabsTrigger value="details" className="text-xs px-3">
                Details
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs px-3">
                Documents
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs px-3">
                Timeline
              </TabsTrigger>
              {showGsTab && (
                <TabsTrigger value="gs-process" className="text-xs px-3">
                  GS Process
                </TabsTrigger>
              )}
              {showCoeTab && (
                <TabsTrigger value="coe" className="text-xs px-3">
                  Confirmation of Enrollment
                </TabsTrigger>
              )}
              <TabsTrigger value="communication" className="text-xs px-3">
                Communication
              </TabsTrigger>
            </TabsList>
          </section>

          <TabsContent value="details" className="space-y-3">
            <ReviewForm
              applicationId={application.id}
              showDetails={false}
              showSync={true}
              onNavigateToDocuments={() => setTabParam("documents")}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-3">
            <DocumentsTab applicationId={application.id} />
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

          {showGsTab && (
            <TabsContent value="gs-process" className="space-y-3">
              <GSTab
                trackingCode={application?.tracking_code}
                applicationId={application.id}
                isStaff={isStaffOrAdmin}
              />
            </TabsContent>
          )}
          {showCoeTab && (
            <TabsContent value="coe" className="space-y-3">
              <CoeTab applicationId={application.id} />
              {/* <hr className="my-80" /> */}
              {/* <COETab applicationId={application.id} /> */}
            </TabsContent>
          )}

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
