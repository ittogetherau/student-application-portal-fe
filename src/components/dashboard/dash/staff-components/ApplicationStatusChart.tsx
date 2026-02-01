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
