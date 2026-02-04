import { ApiService } from "@/service/base.service";
import { resolveServiceCall } from "@/service/service-helpers";
import type { ServiceResponse } from "@/shared/types/service";

export interface StaffDashboardWorkload {
  assignedToMe: number;
  unassigned: number;
  overdue: number;
}

export interface StaffDashboardStatusDistributionItem {
  status: string;
  count: number;
}

export interface StaffDashboardPerformanceItem {
  staff: string;
  underReview: number;
  pendingDecision: number;
  approved: number;
  rejected: number;
}

export interface StaffDashboardPriorityApplication {
  id: string;
  studentName: string;
  program: string;
  intake: string;
  agent: string;
  status: string;
  priority: "High" | "Medium" | "Low";
  daysInReview: number;
  assignedTo: string;
}

export interface StaffDashboardResponse {
  workload: StaffDashboardWorkload;
  statusDistribution: StaffDashboardStatusDistributionItem[];
  staffPerformance: StaffDashboardPerformanceItem[];
  priorityApplications: StaffDashboardPriorityApplication[];
}

export interface AgentDashboardKpiTrend {
  value: number;
  isPositive: boolean;
}

export interface AgentDashboardKpi {
  key: string;
  title: string;
  value: number;
  trend?: AgentDashboardKpiTrend;
}

export interface AgentDashboardStatusBreakdownItem {
  status: string;
  count: number;
}

export interface AgentDashboardMonthlyTrendItem {
  month: string;
  submitted: number;
  rejected: number;
  offerIssued: number;
  coeIssued: number;
}

export interface AgentDashboardPendingAction {
  id?: number | string;
  type: string;
  title: string;
  description: string;
  priority?: "high" | "medium" | "low";
  actionLabel?: string;
  student?: string;
  applicationId?: string;
  university?: string;
  deadline?: string;
  universityComment?: string;
}

export interface AgentDashboardRecentActivity {
  id: number | string;
  type: string;
  title: string;
  description: string;
  time: string;
}

export interface AgentDashboardApplication {
  id: string;
  student: string;
  university: string;
  program: string;
  status: string;
  deadline: string;
  submittedDate: string;
}

export interface AgentDashboardDraftApplication {
  id: string;
  applicationUuid?: string;
  studentName: string;
  university: string;
  program: string;
  lastEdited: string;
  completionPercent: number;
}

export interface AgentDashboardResponse {
  kpis: AgentDashboardKpi[];
  statusBreakdown: AgentDashboardStatusBreakdownItem[];
  monthlyTrends: AgentDashboardMonthlyTrendItem[];
  pendingActions: AgentDashboardPendingAction[];
  recentActivity: AgentDashboardRecentActivity[];
  applications: AgentDashboardApplication[];
  draftApplications: AgentDashboardDraftApplication[];
}

class DashboardService extends ApiService {
  getAgentDashboard(): Promise<ServiceResponse<AgentDashboardResponse>> {
    return resolveServiceCall<AgentDashboardResponse>(
      () => this.get("agents/dashboard", true),
      "Agent dashboard fetched.",
      "Failed to fetch agent dashboard",
    );
  }

  getStaffDashboard(): Promise<ServiceResponse<StaffDashboardResponse>> {
    return resolveServiceCall<StaffDashboardResponse>(
      () => this.get("staff/dashboard", true),
      "Staff dashboard fetched.",
      "Failed to fetch staff dashboard",
    );
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
