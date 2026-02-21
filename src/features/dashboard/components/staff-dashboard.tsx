"use client";

import { useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { normalizeDashboardStatusItems } from "../utils/application-status";
import { useStaffDashboardQuery } from "../hooks/useDashboard.hook";
import {
  AlertsPanel,
  ApplicationOutcomesChart,
  StaffApplicationsTable as ApplicationsTable,
  ApplicationStatusChart as StatusChart,
  StaffWorkloadSection as WorkloadSection,
} from "./staff";
import { Application } from "./staff/StaffApplicationsTable";

const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function StaffDashboard() {
  const [{ start_date: startDateParam, end_date: endDateParam }] =
    useQueryStates({
      start_date: parseAsString,
      end_date: parseAsString,
    });

  const dashboardFilters = useMemo(
    () => ({
      startDate:
        startDateParam && YYYY_MM_DD_REGEX.test(startDateParam)
          ? startDateParam
          : undefined,
      endDate:
        endDateParam && YYYY_MM_DD_REGEX.test(endDateParam)
          ? endDateParam
          : undefined,
    }),
    [endDateParam, startDateParam],
  );

  const hasDistributionDateFilters = Boolean(
    dashboardFilters.startDate || dashboardFilters.endDate,
  );

  const { data: baseDashboardResponse } = useStaffDashboardQuery();
  const { data: distributionFilteredResponse } = useStaffDashboardQuery(
    dashboardFilters,
    { enabled: hasDistributionDateFilters },
  );

  const baseDashboardData = baseDashboardResponse?.data;
  const workload = baseDashboardData?.workload ?? {
    assignedToMe: 0,
    unassigned: 0,
    overdue: 0,
  };
  const statusDistribution =
    (hasDistributionDateFilters
      ? distributionFilteredResponse?.data?.statusDistribution
      : baseDashboardData?.statusDistribution) ?? [];
  const staffPerformance = baseDashboardData?.staffPerformance ?? [];
  const priorityApplications = baseDashboardData?.priorityApplications ?? [];
  const applicationOutcomes = baseDashboardData?.applicationOutcomes ?? {
    reviewed: 0,
    coeIssued: 0,
    rejected: 0,
  };

  const staffStatusDistribution = normalizeDashboardStatusItems(
    statusDistribution.map((item) => ({
      name: item.status,
      value: item.count,
    })),
  );

  const staffPriorityApplications: Application[] = priorityApplications.map(
    (application) => ({
      ...application,
      applicationUuid: application.applicationUuid ?? application.id,
      priority:
        application.priority === "High"
          ? "High"
          : application.priority === "Medium"
            ? "Medium"
            : "Low",
    }),
  );

  return (
    <ContainerLayout className="min-h-screen p-4 bg-background">
      {/* Main Content */}
      <main className="wrapper py-2 space-y-6">
        {/* Workload Section */}
        <section></section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
          <div className="">
            <WorkloadSection workload={workload} />
          </div>
          <div className="min-w-0 col-span-2 h-full">
            <ApplicationOutcomesChart outcomes={applicationOutcomes} />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
          <div className="min-w-0">
            <StatusChart data={staffStatusDistribution} />
          </div>
          <div className="min-w-0">
            <AlertsPanel staffData={staffPerformance} />
          </div>
        </div>

        {/* Applications Table */}
        <div className="rounded-lg overflow-hidden">
          <ApplicationsTable data={staffPriorityApplications} />
        </div>
      </main>
    </ContainerLayout>
  );
}
