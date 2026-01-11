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

const data = [
  {
    program: "Computer Science",
    fall2025: 145,
    spring2025: 89,
    summer2025: 34,
  },
  { program: "Business Admin", fall2025: 132, spring2025: 78, summer2025: 45 },
  { program: "Engineering", fall2025: 98, spring2025: 67, summer2025: 28 },
  { program: "Medicine", fall2025: 87, spring2025: 54, summer2025: 12 },
  { program: "Law", fall2025: 76, spring2025: 43, summer2025: 18 },
  { program: "Arts & Design", fall2025: 65, spring2025: 38, summer2025: 22 },
];

export function ProgramIntakeChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Applications by Program & Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="program"
                  tick={{ fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fall2025" fill="#3b82f6" name="Fall 2025" />
                <Bar dataKey="spring2025" fill="#10b981" name="Spring 2025" />
                <Bar dataKey="summer2025" fill="#f59e0b" name="Summer 2025" />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
