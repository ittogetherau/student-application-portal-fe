"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const staffData = [
  {
    staff: "J. Smith",
    underReview: 14,
    pendingDecision: 8,
    approved: 9,
    rejected: 3,
  },
  {
    staff: "M. Jones",
    underReview: 11,
    pendingDecision: 6,
    approved: 12,
    rejected: 4,
  },
  {
    staff: "K. Brown",
    underReview: 9,
    pendingDecision: 7,
    approved: 10,
    rejected: 2,
  },
  {
    staff: "A. Davis",
    underReview: 13,
    pendingDecision: 5,
    approved: 8,
    rejected: 3,
  },
  {
    staff: "R. Wilson",
    underReview: 10,
    pendingDecision: 9,
    approved: 11,
    rejected: 5,
  },
];

export function StaffWorkloadChart() {
  const [staffFilter, setStaffFilter] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredData = staffData.filter(
    (item) => staffFilter === "all" || item.staff === staffFilter,
  );

  return (
    <Card className="shadow-sm border-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-8 border-b border-slate-50">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
            Staff Workload by Status
          </CardTitle>
          <p className="text-xs text-slate-500 font-medium">
            Individual performance and processing metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-slate-400 ml-1.5" />
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer pr-4"
            >
              <option value="all">All Staff Members</option>
              {staffData.map((s) => (
                <option key={s.staff} value={s.staff}>
                  {s.staff}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-8">
        <div className="h-[350px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="staff"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 600, fill: "#64748B" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 600, fill: "#64748B" }}
                />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#64748B",
                  }}
                  iconType="circle"
                />
                <Bar
                  dataKey="underReview"
                  stackId="status"
                  fill="#2563EB"
                  name="Under Review"
                  radius={[0, 0, 0, 0]}
                  barSize={35}
                />
                <Bar
                  dataKey="pendingDecision"
                  stackId="status"
                  fill="#D97706"
                  name="Pending Decision"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="approved"
                  stackId="status"
                  fill="#059669"
                  name="Approved"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="rejected"
                  stackId="status"
                  fill="#DC2626"
                  name="Rejected"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
