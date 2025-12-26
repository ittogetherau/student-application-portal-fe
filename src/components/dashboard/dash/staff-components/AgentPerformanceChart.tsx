"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { agent: 'GlobalEdu Partners', applications: 234, acceptanceRate: 78.2 },
    { agent: 'StudyAbroad Connect', applications: 189, acceptanceRate: 71.5 },
    { agent: 'International Gateway', applications: 167, acceptanceRate: 82.1 },
    { agent: 'Elite Education', applications: 145, acceptanceRate: 68.9 },
    { agent: 'Future Leaders', applications: 132, acceptanceRate: 75.8 },
    { agent: 'Academic Bridge', applications: 98, acceptanceRate: 73.4 },
];

export function AgentPerformanceChart() {
    const getBarColor = (acceptanceRate: number) => {
        if (acceptanceRate >= 80) return '#10b981'; // green
        if (acceptanceRate >= 75) return '#3b82f6'; // blue
        if (acceptanceRate >= 70) return '#f59e0b'; // amber
        return '#ef4444'; // red
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" />
                        <YAxis dataKey="agent" type="category" tick={{ fontSize: 12 }} width={110} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="applications" name="Applications">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.acceptanceRate)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <span className="text-muted-foreground">≥80% acceptance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span className="text-muted-foreground">75-79% acceptance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded" />
                        <span className="text-muted-foreground">70-74% acceptance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded" />
                        <span className="text-muted-foreground">&lt;70% acceptance</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
