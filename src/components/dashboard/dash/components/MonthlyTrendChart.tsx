"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export interface MonthlyTrend {
  month: string;
  submitted: number;
  rejected: number;
  offerIssued: number;
  coeIssued: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  //   const [showFilter, setShowFilter] = useState(false);
  //   const [selectedRange, setSelectedRange] = useState("Last 6 Months");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Submission Trends</CardTitle>
          <div className="relative">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilter(!showFilter)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {selectedRange}
              <ChevronDown className="w-4 h-4" />
            </Button> */}
            {/* {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border border-border py-2 z-10">
                {[
                  "Last 3 Months",
                  "Last 6 Months",
                  "Last 12 Months",
                  "All Time",
                ].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedRange(range);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                      selectedRange === range
                        ? "text-primary font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )} */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} iconType="rect" />
                <Bar
                  type="monotone"
                  dataKey="submitted"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="#3b82f6"
                  name="Submitted"
                />
                <Bar
                  type="monotone"
                  dataKey="rejected"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="#ef4444"
                  name="Application Rejected"
                />
                <Bar
                  type="monotone"
                  dataKey="offerIssued"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  name="Offer Issued"
                />
                <Bar
                  type="monotone"
                  dataKey="coeIssued"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#8b5cf6"
                  name="COE Issued"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
