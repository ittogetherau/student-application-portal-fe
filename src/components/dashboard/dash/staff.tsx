"use client";

import { Building2, Search, Clock, FileText, Users, CircleCheck, TrendingUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    StaffKPICard as KPICard,
    StaffWorkloadSection as WorkloadSection,
    ApplicationStatusChart as StatusChart,
    ProgramIntakeChart,
    AgentPerformanceChart,
    StaffApplicationsTable as ApplicationsTable,
    AlertsPanel
} from './staff-components';

export default function StaffDashboard() {
    return (
        <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
            {/* Dashboard Header */}
            <div className="bg-white/40 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800">
                <div className="wrapper py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Building2 className="w-8 h-8 text-primary shrink-0" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">University Admissions</h1>
                                <p className="text-sm text-neutral-500 font-medium">Application Management Dashboard</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md w-full md:ml-auto">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 transition-colors group-focus-within:text-primary z-10" />
                                <Input
                                    type="text"
                                    placeholder="Search by ID or Name..."
                                    className="w-full pl-10 h-12 bg-white dark:bg-neutral-800 border-none rounded-2xl text-sm shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 ring-1 ring-neutral-200 dark:ring-neutral-700 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="wrapper py-8 space-y-8">
                {/* Workload Section */}
                <section>
                    <WorkloadSection />
                </section>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-w-0">
                    <div className="min-w-0">
                        <StatusChart />
                    </div>
                    <div className="min-w-0">
                        <AlertsPanel />
                    </div>
                </div>

                {/* Applications Table */}
                <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-w-0">
                    <ApplicationsTable />
                </section>


            </main>
        </div>
    );
}
