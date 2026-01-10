"use client";

import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteRoutes } from "@/constants/site-routes";
import Link from "next/link";
import { ApplicationsTable } from "./components/ApplicationsTable";
import { DraftApplications } from "./components/DraftApplications";
import { KPICard } from "./components/KPICard";
import { MonthlyTrendChart } from "./components/MonthlyTrendChart";
import { PendingActions } from "./components/PendingActions";
import type { PendingAction } from "./components/PendingActions";
import { RecentActivity } from "./components/RecentActivity";
import { StatusDonutChart } from "./components/StatusDonutChart";
import { agentDashboardData } from "./data/agent-dashboard-data";

const kpiStyleByKey: Record<
  string,
  { icon: typeof FileText; iconColor: string; iconBgColor: string }
> = {
  totalApplications: {
    icon: FileText,
    iconColor: "text-blue-600",
    iconBgColor: "bg-blue-100/50 dark:bg-blue-900/20",
  },
  inProgress: {
    icon: TrendingUp,
    iconColor: "text-amber-600",
    iconBgColor: "bg-amber-100/50 dark:bg-amber-900/20",
  },
  offersIssued: {
    icon: Users,
    iconColor: "text-green-600",
    iconBgColor: "bg-green-100/50 dark:bg-green-900/20",
  },
  actionRequired: {
    icon: AlertCircle,
    iconColor: "text-red-600",
    iconBgColor: "bg-red-100/50 dark:bg-red-900/20",
  },
};

const defaultKpiStyle = {
  icon: FileText,
  iconColor: "text-neutral-600",
  iconBgColor: "bg-neutral-100 dark:bg-neutral-800",
};

const statusColorByName: Record<string, string> = {
  Draft: "#9CA3AF",
  Submitted: "#3B82F6",
  "Under Review": "#8B5CF6",
  "Offer Issued": "#10B981",
  Accepted: "#059669",
  Rejected: "#EF4444",
};

const applicationStatusClassByName: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  Submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400",
  "Under Review":
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400",
  "Offer Issued":
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
  Accepted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400",
};

const defaultApplicationStatusClass =
  "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";

const activityStyleByType: Record<
  string,
  { icon: typeof FileText; iconColor: string; iconBg: string }
> = {
  offer_issued: {
    icon: Award,
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900",
  },
  application_submitted: {
    icon: CheckCircle,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900",
  },
  message: {
    icon: Mail,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900",
  },
  document_uploaded: {
    icon: FileText,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900",
  },
  under_review: {
    icon: Clock,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900",
  },
};

const defaultActivityStyle = {
  icon: FileText,
  iconColor: "text-neutral-600 dark:text-neutral-400",
  iconBg: "bg-neutral-100 dark:bg-neutral-800",
};

const agentKpis = agentDashboardData.kpis.map((kpi) => ({
  ...kpi,
  ...(kpiStyleByKey[kpi.key] ?? defaultKpiStyle),
}));

const agentStatusBreakdown = agentDashboardData.statusBreakdown.map((item) => ({
  name: item.status,
  value: item.count,
  color: statusColorByName[item.status] ?? "#6B7280",
}));

const agentRecentActivity = agentDashboardData.recentActivity.map((activity) => {
  const style = activityStyleByType[activity.type] ?? defaultActivityStyle;
  return {
    ...activity,
    ...style,
  };
});

const agentPendingActions: PendingAction[] =
  agentDashboardData.pendingActions.map((action) => ({
    ...action,
    type: action.type === "document" ? "document" : "request",
    priority:
      action.priority === "high"
        ? "high"
        : action.priority === "medium"
        ? "medium"
        : "low",
  }));

const agentApplications = agentDashboardData.applications.map((application) => ({
  ...application,
  statusColor:
    applicationStatusClassByName[application.status] ??
    defaultApplicationStatusClass,
}));

export default function AgentDashboard() {
  return (
    <div className="bg-background p-4">
      {/* Dashboard Header */}
      <div className="bg-white/40 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800">
        <div className="wrapper py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-primary shrink-0" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
                  Agent Portal
                </h1>
                <p className="text-sm text-neutral-500 font-medium">
                  Manage your student applications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-2xl w-full md:ml-auto justify-end">
              <div className="relative group flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder="Search Applications..."
                  className="w-full pl-10 h-12 bg-white dark:bg-neutral-800 border-none rounded-2xl text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 ring-1 ring-neutral-200 dark:ring-neutral-700 outline-none"
                />
              </div>
              <Link href={siteRoutes.dashboard.application.create}>
                <Button className="gap-2 h-12 px-6 rounded-2xl font-medium shadow-sm shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Plus className="h-4 w-4" />
                  New Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="wrapper py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agentKpis.map((kpi) => (
            <KPICard
              key={kpi.key}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              iconColor={kpi.iconColor}
              iconBgColor={kpi.iconBgColor}
              trend={kpi.trend}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StatusDonutChart data={agentStatusBreakdown} />
          <MonthlyTrendChart data={agentDashboardData.monthlyTrends} />
        </div>

        {/* Pending Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PendingActions pendingActions={agentPendingActions} />
          <RecentActivity activities={agentRecentActivity} />
        </div>

        {/* Applications Table */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-w-0">
          <ApplicationsTable data={agentApplications} />
        </section>

        {/* Draft Applications */}
        <DraftApplications
          draftApplications={agentDashboardData.draftApplications}
        />
      </main>
    </div>
  );
}
