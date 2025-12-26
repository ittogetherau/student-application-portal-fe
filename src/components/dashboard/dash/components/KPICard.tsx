"use client";

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface KPICardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    iconColor: string;
    iconBgColor: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function KPICard({ title, value, icon: Icon, iconColor, iconBgColor, trend }: KPICardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-muted-foreground text-[10px] uppercase font-medium mb-1 tracking-wider">{title}</p>
                        <p className="text-2xl font-medium">{value}</p>
                        {trend && (
                            <div className="flex items-center gap-1 mt-2">
                                <span className={`text-[10px] items-center flex gap-0.5 px-2 py-0.5 rounded-full font-medium ${trend.isPositive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                                </span>
                                <span className="text-xs text-muted-foreground">vs last month</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg ${iconBgColor}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
