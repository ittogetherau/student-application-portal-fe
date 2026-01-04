"use client";

import {
  AlertCircle,
  FileText,
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
import { RecentActivity } from "./components/RecentActivity";
import { StatusDonutChart } from "./components/StatusDonutChart";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
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
          <KPICard
            title="Total Applications"
            value={170}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100/50 dark:bg-blue-900/20"
            trend={{ value: 12, isPositive: true }}
          />
          <KPICard
            title="In Progress"
            value={28}
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100/50 dark:bg-amber-900/20"
            trend={{ value: 5, isPositive: false }}
          />
          <KPICard
            title="Offers Issued"
            value={42}
            icon={Users}
            iconColor="text-green-600"
            iconBgColor="bg-green-100/50 dark:bg-green-900/20"
            trend={{ value: 18, isPositive: true }}
          />
          <KPICard
            title="Action Required"
            value={4}
            icon={AlertCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100/50 dark:bg-red-900/20"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StatusDonutChart />
          <MonthlyTrendChart />
        </div>

        {/* Pending Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PendingActions />
          <RecentActivity />
        </div>

        {/* Applications Table */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-w-0">
          <ApplicationsTable />
        </section>

        {/* Draft Applications */}
        <DraftApplications />
      </main>
    </div>
  );
}
