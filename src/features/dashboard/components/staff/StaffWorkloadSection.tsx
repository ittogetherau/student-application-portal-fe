"use client";

import { Users, Clock, Timer } from "lucide-react";

interface WorkloadItemProps {
  label: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

function WorkloadItem({ label, count, color, icon }: WorkloadItemProps) {
  return (
    <div className="bg-card rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 transition-all hover:shadow-md hover:border-primary/20 group">
      <div className="flex items-center gap-4">
        <div
          className={`${color} p-2.5 rounded-xl transition-transform group-hover:scale-110`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium truncate">
            {label}
          </p>
          <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
            {count}
          </p>
        </div>
      </div>
    </div>
  );
}

interface StaffWorkloadSectionProps {
  workload: {
    assignedToMe: number;
    unassigned: number;
    overdue: number;
  };
}

export function StaffWorkloadSection({ workload }: StaffWorkloadSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
          My Workload
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <WorkloadItem
          label="Assigned to Me"
          count={workload.assignedToMe}
          color="bg-primary/10 text-primary"
          icon={<Users className="w-5 h-5" />}
        />
        <WorkloadItem
          label="Unassigned"
          count={workload.unassigned}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          icon={<Clock className="w-5 h-5" />}
        />
        <WorkloadItem
          label="Overdue (>5 days)"
          count={workload.overdue}
          color="bg-red-500/10 text-red-600 dark:text-red-400"
          icon={<Timer className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}
