"use client";

import { ApplicationStagePill } from "@/components/shared/ApplicationStagePill";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteRoutes } from "@/constants/site-routes";
import ApplicationStage from "@/features/application-detail/components/stages/application-stage";
import { ApplicationActionsMenu } from "@/features/application-detail/components/toolbar/application-actions-menu";
import { StaffAssignmentSelect } from "@/features/application-detail/components/toolbar/staff-assignment-select";
import {
  shouldShowCoeRoute,
  shouldShowGsRoute,
} from "@/features/application-detail/utils/stage-utils";
import CreateThreadForm from "@/features/threads/components/forms/create-thread-form";
import ThreadMessagesPanel from "@/features/threads/components/panels/thread-messages-panel";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import clsx from "clsx";
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
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

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

type ApplicationNavKey =
  | "details"
  | "documents"
  | "timeline"
  | "communication"
  | "gs"
  | "coe";

type ApplicationNavItem = {
  key: ApplicationNavKey;
  label: string;
  requires?: "gs" | "coe";
  href: (applicationId: string) => string;
};

const NAV_ITEMS: ApplicationNavItem[] = [
  {
    key: "details",
    label: "Details",
    href: siteRoutes.dashboard.application.id.details,
  },
  {
    key: "documents",
    label: "Documents",
    href: siteRoutes.dashboard.application.id.documents,
  },
  {
    key: "timeline",
    label: "Timeline",
    href: siteRoutes.dashboard.application.id.timeline,
  },
  {
    key: "gs",
    label: "GS Process",
    requires: "gs",
    href: siteRoutes.dashboard.application.id.gs,
  },
  {
    key: "coe",
    label: "Confirmation of Enrollment",
    requires: "coe",
    href: siteRoutes.dashboard.application.id.coe,
  },
  {
    key: "communication",
    label: "Communication",
    href: siteRoutes.dashboard.application.id.communication,
  },
];

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
    data: response,
    isLoading,
    isError,
    error,
  } = useApplicationGetQuery(id);

  const application = response?.data;
  const stage = application?.current_stage ?? APPLICATION_STAGE.DRAFT;
  const showGs = shouldShowGsRoute(stage);
  const showCoe = shouldShowCoeRoute(stage);

  const ROLE = session?.user.role;
  const IS_ADMIN_STAFF = session?.user.staff_admin;
  const isStaffOrAdmin = ROLE === "staff" || !!IS_ADMIN_STAFF;
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const hasAppliedInitialStageRedirect = useRef(false);

  const handleBackNavigation = () =>
    router.push(siteRoutes.dashboard.application.root);

  const activeSegment = (() => {
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    if (last === "gs-process") return "gs";
    return last;
  })();

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

  const navItems = NAV_ITEMS.filter((item) => {
    if (item.requires === "gs" && !showGs) return false;
    if (item.requires === "coe" && !showCoe) return false;
    return true;
  }).map((item) => ({
    ...item,
    href: item.href(id),
  }));

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
  const agentEmail = agentInfo.agent?.email ?? agentInfo.agent_email ?? "N/A";
  const agentPhone = agentInfo.agent?.phone ?? null;

  const submittedAt =
    application.submitted_at ?? application.created_at ?? null;
  const submittedLabel = submittedAt
    ? formatUtcToFriendlyLocal(submittedAt)
    : "N/A";

  const navButtonClass = (navKey: string) =>
    clsx(
      "text-xs px-3 py-2 rounded-lg border transition",
      activeSegment === navKey
        ? "border-transparent bg-primary text-primary-foreground"
        : "border-muted/40 text-muted-foreground hover:text-foreground hover:border-border",
    );

  return (
    <main className="space-y-4 p-6">
      <ThreadMessagesPanel />

      <ContainerLayout>
        <section className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
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

              {isStaffOrAdmin && (
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
              )}
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            <ApplicationStagePill stage={stage} role={ROLE} />

            {stage &&
              [
                APPLICATION_STAGE.IN_REVIEW,
                APPLICATION_STAGE.DRAFT,
                APPLICATION_STAGE.SUBMITTED,
                APPLICATION_STAGE.OFFER_LETTER,
              ].includes(stage) && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8"
                >
                  <Link
                    href={`${siteRoutes.dashboard.application.create}?id=${application.id}&edit=true`}
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              )}

            {ROLE === "staff" && IS_ADMIN_STAFF && (
              <>
                <div className="w-56 min-w-0 shrink">
                  <StaffAssignmentSelect
                    assignedStaffId={application.assigned_staff_id}
                    applicationId={application.id}
                  />
                </div>

                <ApplicationActionsMenu applicationId={application.id} />
              </>
            )}

            <Button
              size="sm"
              className="w-full sm:w-auto gap-2"
              onClick={() => setIsCreateThreadOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Start Conversation
            </Button>
          </div>
        </section>
      </ContainerLayout>

      <TwoColumnLayout
        reversed
        sidebar={
          <div className="space-y-4">
            <ApplicationStage
              currentStatus={stage}
              current_role={ROLE}
              id={id}
            />

            {stage === APPLICATION_STAGE.REJECTED && (
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

            {stage === APPLICATION_STAGE.ACCEPTED && (
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
            )}
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={navButtonClass(item.key)}
                aria-current={activeSegment === item.key ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
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
