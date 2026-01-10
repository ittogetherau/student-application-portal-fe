"use client";

import { Input } from "@/components/ui/input";
import { Building2, Search } from "lucide-react";
import {
  AlertsPanel,
  StaffApplicationsTable as ApplicationsTable,
  ApplicationStatusChart as StatusChart,
  StaffWorkloadSection as WorkloadSection,
} from "./staff-components";
import type { Application } from "./staff-components/StaffApplicationsTable";
import { staffDashboardData } from "./data/staff-dashboard-data";

const statusColorByName: Record<string, string> = {
  "Under Review": "#FF7A00",
  "Pending Decision": "#FFB800",
  Approved: "#10B981",
  Rejected: "#EF4444",
  Waitlisted: "#8B5CF6",
  Withdrawn: "#6B7280",
};

const staffStatusDistribution = staffDashboardData.statusDistribution.map(
  (item) => ({
    name: item.status,
    value: item.count,
    color: statusColorByName[item.status] ?? "#6B7280",
  })
);

const staffPriorityApplications: Application[] =
  staffDashboardData.priorityApplications.map((application) => ({
    ...application,
    priority:
      application.priority === "High"
        ? "High"
        : application.priority === "Medium"
        ? "Medium"
        : "Low",
  }));

export default function StaffDashboard() {
  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="wrapper py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Building2 className="w-6 h-6 text-primary shrink-0" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
                University Admissions
              </h1>
              <p className="text-sm text-neutral-500 font-medium">
                Application Management Dashboard
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full md:ml-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 transition-colors group-focus-within:text-primary z-10" />
              <Input
                type="text"
                placeholder="Search by ID or Name..."
                className="w-full pl-10 h-12 bg-white dark:bg-neutral-600 border-none rounded-2xl text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 ring-1 ring-neutral-200 dark:ring-neutral-700 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="wrapper py-6 space-y-6">
        {/* Workload Section */}
        <section>
          <WorkloadSection workload={staffDashboardData.workload} />
        </section>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0">
          <div className="min-w-0">
            <StatusChart data={staffStatusDistribution} />
          </div>
          <div className="min-w-0">
            <AlertsPanel staffData={staffDashboardData.staffPerformance} />
          </div>
        </div>

        {/* Applications Table */}
        <div className="rounded-lg overflow-hidden">
          <ApplicationsTable data={staffPriorityApplications} />
        </div>
      </main>
    </div>
  );
}
