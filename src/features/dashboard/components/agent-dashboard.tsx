"use client";

import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAgentDashboardQuery } from "../hooks/useDashboard.hook";
import { normalizeDashboardStatusItems } from "../utils/application-status";
import { ApplicationsTable } from "./agent/ApplicationsTable";
import { DraftApplications } from "./agent/DraftApplications";
import { KPICard } from "./agent/KPICard";
import { MonthlyTrendChart } from "./agent/MonthlyTrendChart";
import type { PendingAction } from "./agent/PendingActions";
import { PendingActions } from "./agent/PendingActions";
import { RecentActivity } from "./agent/RecentActivity";
import { StatusDonutChart } from "./agent/StatusDonutChart";
import ContainerLayout from "@/components/ui-kit/layout/container-layout";

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

export default function AgentDashboard() {
  const { data } = useAgentDashboardQuery();
  const dashboardData = data?.data;
  const kpis = dashboardData?.kpis ?? [];
  const statusBreakdown = dashboardData?.statusBreakdown ?? [];
  const recentActivity = dashboardData?.recentActivity ?? [];
  const pendingActions = dashboardData?.pendingActions ?? [];
  const applications = dashboardData?.applications ?? [];
  const monthlyTrends = dashboardData?.monthlyTrends ?? [];
  const draftApplications = (dashboardData?.draftApplications ?? []).map(
    (draft) => ({
      ...draft,
      applicationUuid: draft.applicationUuid ?? draft.id,
    }),
  );

  const agentKpis = kpis.map((kpi) => ({
    ...kpi,
    ...(kpiStyleByKey[kpi.key] ?? defaultKpiStyle),
  }));

  const agentStatusBreakdown = normalizeDashboardStatusItems(
    statusBreakdown.map((item) => ({
      name: item.status,
      value: item.count,
    })),
  );

  const agentRecentActivity = recentActivity.map((activity, index) => {
    const style = activityStyleByType[activity.type] ?? defaultActivityStyle;
    return {
      ...activity,
      id: Number(activity.id ?? index),
      ...style,
    };
  });

  const agentPendingActions: PendingAction[] = pendingActions.map((action) => ({
    id: Number(action.id ?? 0),
    type: action.type === "document" ? "document" : "request",
    title: action.title ?? "Action required",
    student: action.student ?? "N/A",
    applicationId: action.applicationId ?? "N/A",
    university: action.university ?? "N/A",
    deadline: action.deadline ?? "N/A",
    priority:
      action.priority === "high"
        ? "high"
        : action.priority === "medium"
          ? "medium"
          : "low",
    universityComment: action.universityComment ?? action.description ?? "",
  }));

  const agentApplications = applications;

  return (
    <ContainerLayout className="p-4">
      <main className="space-y-8">
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
          <MonthlyTrendChart data={monthlyTrends} />
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
        <DraftApplications draftApplications={draftApplications} />
      </main>
    </ContainerLayout>
  );
}
