"use client";

import ContainerLayout from "@/components/ui-kit/layout/container-layout";
import { useStaffDashboardQuery } from "../hooks/useDashboard.hook";
import {
  AlertsPanel,
  StaffApplicationsTable as ApplicationsTable,
  ApplicationStatusChart as StatusChart,
  StaffWorkloadSection as WorkloadSection,
} from "./staff";
import { Application } from "./staff/StaffApplicationsTable";

const statusColorByName: Record<string, string> = {
  "Under Review": "#FF7A00",
  "Pending Decision": "#FFB800",
  Approved: "#10B981",
  Rejected: "#EF4444",
  Waitlisted: "#8B5CF6",
  Withdrawn: "#6B7280",
};

export default function StaffDashboard() {
  const { data } = useStaffDashboardQuery();
  const dashboardData = data?.data;
  const workload = dashboardData?.workload ?? {
    assignedToMe: 0,
    unassigned: 0,
    overdue: 0,
  };
  const statusDistribution = dashboardData?.statusDistribution ?? [];
  const staffPerformance = dashboardData?.staffPerformance ?? [];
  const priorityApplications = dashboardData?.priorityApplications ?? [];

  const staffStatusDistribution = statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
    color: statusColorByName[item.status] ?? "#6B7280",
  }));

  const staffPriorityApplications: Application[] = priorityApplications.map(
    (application) => ({
      ...application,
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
        <section>
          <WorkloadSection workload={workload} />
        </section>

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
