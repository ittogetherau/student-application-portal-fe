"use client";

import { useMemo, useSyncExternalStore } from "react";
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

interface ApplicationOutcomesChartProps {
  outcomes: {
    reviewed: number;
    coeIssued: number;
    rejected: number;
  };
}

export function ApplicationOutcomesChart({
  outcomes,
}: ApplicationOutcomesChartProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const chartData = useMemo(
    () => [
      {
        name: "Applicaiton Recieved",
        value: outcomes.reviewed,
        color: "#3B82F6",
      },
      {
        name: "COE Issued",
        value: outcomes.coeIssued,
        color: "#10B981",
      },
      {
        name: "Application Rejected",
        value: outcomes.rejected,
        color: "#EF4444",
      },
    ],
    [outcomes.coeIssued, outcomes.rejected, outcomes.reviewed],
  );

  const totalOutcomes =
    outcomes.reviewed + outcomes.coeIssued + outcomes.rejected;

  return (
    <div className="bg-card rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm overflow-hidden h-full">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
            Application Outcomes
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Reviewed, COE issued, and rejected applications
          </p>
        </div>
        <div className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          Total: {totalOutcomes}
        </div>
      </div>

      <div className="h-[300px] w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                {chartData.map((entry, index) => (
                  <Cell
                    key={`outcome-cell-${index}`}
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
