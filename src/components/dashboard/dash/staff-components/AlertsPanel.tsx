"use client";

import { Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface StaffPerformanceItem {
  staff: string;
  underReview: number;
  pendingDecision: number;
  approved: number;
  rejected: number;
}

interface AlertsPanelProps {
  staffData: StaffPerformanceItem[];
}

export function AlertsPanel({ staffData }: AlertsPanelProps) {
  const [dateFilter, setDateFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredData = staffData.filter(
    (item) => staffFilter === "all" || item.staff === staffFilter
  );

  return (
    <div className="bg-card rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
              Staff Performance
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              Applications assigned per officer
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl self-start sm:self-auto ring-1 ring-neutral-200 dark:ring-neutral-700">
            <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-700">
              <Users className="w-4 h-4 text-neutral-500 ml-1" />
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="bg-transparent border-none py-1 pl-1 pr-6 text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="all">All Staff</option>
                {staffData.map((s) => (
                  <option key={s.staff} value={s.staff}>
                    {s.staff}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-neutral-500 ml-1" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none py-1 pl-1 pr-6 text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="today">Today</option>
                <option value="7days">7 Days</option>
                <option value="30days">30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex-1">
        <div className="h-[300px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="staff"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="underReview"
                  stackId="a"
                  fill="#FF7A00"
                  name="Under Review"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="pendingDecision"
                  stackId="a"
                  fill="#FFB800"
                  name="Pending Decision"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="approved"
                  stackId="a"
                  fill="#10B981"
                  name="Approved"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="rejected"
                  stackId="a"
                  fill="#EF4444"
                  name="Rejected"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
