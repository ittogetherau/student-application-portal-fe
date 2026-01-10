"use client";

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Activity {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                        {activities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div key={activity.id} className="relative flex gap-4">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${activity.iconBg} flex items-center justify-center z-10`}>
                                        <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium">{activity.title}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
