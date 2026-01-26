"use client";

import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ApplicationStatusItem {
  name: string;
  value: number;
  color: string;
}

interface ApplicationStatusChartProps {
  data: ApplicationStatusItem[];
}

export function ApplicationStatusChart({ data }: ApplicationStatusChartProps) {
  const [dateFilter, setDateFilter] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm overflow-hidden h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
            Application Distribution
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Status breakdown for current intake
          </p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl self-start sm:self-auto ring-1 ring-neutral-200 dark:ring-neutral-700">
          <Calendar className="w-4 h-4 text-neutral-500 ml-2" />
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
      <div className="h-[300px] w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="name"
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
                cursor={{ fill: "var(--primary)", opacity: 0.05 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="value" name="Applications" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
