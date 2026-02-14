"use client";

import { siteRoutes } from "@/shared/constants/site-routes";
import type {
  ApplicationDetailResponse,
  ApplicationEnrollmentData,
} from "@/service/application.service";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import { useApplicationGetQuery } from "@/shared/hooks/use-applications";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import {
  shouldShowCoeRoute,
  shouldShowGsRoute,
} from "@/features/application-detail/utils/stage-utils";

export type ApplicationNavKey =
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

export type ResolvedNavItem = {
  key: ApplicationNavKey;
  label: string;
  href: string;
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

export function getActiveSegment(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";

  if (last === "gs-process") return "gs";
  return last;
}

function getStudentName(application: ApplicationDetailResponse) {
  const given = application.personal_details?.given_name;
  const family = application.personal_details?.family_name;
  return given && family ? `${given} ${family}` : "N/A";
}

function getEnrollmentSummary(enrollmentData: ApplicationEnrollmentData | null) {
  const courseLabel = String(
    enrollmentData?.course_name ?? enrollmentData?.course ?? "N/A",
  );
  const campusLabel = String(
    enrollmentData?.campus_name ?? enrollmentData?.campus ?? "N/A",
  );

  return {
    courseLabel,
    campusLabel,
  };
}

function getAgentSummary(application: ApplicationDetailResponse) {
  const agentData = application as ApplicationDetailResponse & {
    agent?: {
      agency_name?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    };
    agent_name?: string | null;
    agent_email?: string | null;
  };

  return {
    agentName:
      agentData.agent?.agency_name ??
      agentData.agent?.name ??
      agentData.agent_name ??
      "N/A",
    agentEmail: agentData.agent?.email ?? agentData.agent_email ?? "N/A",
    agentPhone: agentData.agent?.phone ?? null,
  };
}

export function useApplicationLayoutData(id: string) {
  const query = useApplicationGetQuery(id);
  const application = query.data?.data;
  const stage = application?.current_stage ?? APPLICATION_STAGE.DRAFT;
  const showGs = shouldShowGsRoute(stage);
  const showCoe = shouldShowCoeRoute(stage);

  const navItems: ResolvedNavItem[] = NAV_ITEMS.filter((item) => {
    if (item.requires === "gs" && !showGs) return false;
    if (item.requires === "coe" && !showCoe) return false;
    return true;
  }).map((item) => ({
    key: item.key,
    label: item.label,
    href: item.href(id),
  }));

  if (!application) {
    return {
      ...query,
      application,
      stage,
      showGs,
      showCoe,
      navItems,
      studentName: "N/A",
      courseLabel: "N/A",
      campusLabel: "N/A",
      submittedLabel: "N/A",
      agentName: "N/A",
      agentEmail: "N/A",
      agentPhone: null as string | null,
    };
  }

  const { courseLabel, campusLabel } = getEnrollmentSummary(
    (application.enrollment_data as ApplicationEnrollmentData | null) ?? null,
  );
  const { agentName, agentEmail, agentPhone } = getAgentSummary(application);
  const submittedAt = application.submitted_at ?? application.created_at ?? null;

  return {
    ...query,
    application,
    stage,
    showGs,
    showCoe,
    navItems,
    studentName: getStudentName(application),
    courseLabel,
    campusLabel,
    submittedLabel: submittedAt ? formatUtcToFriendlyLocal(submittedAt) : "N/A",
    agentName,
    agentEmail,
    agentPhone,
  };
}
