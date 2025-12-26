"use client";

import { CheckCircle, Clock, Mail, FileText, Award, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
}

const activities: Activity[] = [
    {
        id: 1,
        type: 'offer',
        title: 'Offer Issued',
        description: 'Emma Wilson received an offer from University of Melbourne',
        time: '2 hours ago',
        icon: Award,
        iconColor: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-900',
    },
    {
        id: 2,
        type: 'status',
        title: 'Application Submitted',
        description: 'Alex Turner\'s application to University of Sydney submitted',
        time: '5 hours ago',
        icon: CheckCircle,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900',
    },
    {
        id: 3,
        type: 'message',
        title: 'New Message',
        description: 'University of Auckland requested additional documents',
        time: '1 day ago',
        icon: Mail,
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-100 dark:bg-purple-900',
    },
    {
        id: 4,
        type: 'document',
        title: 'Document Uploaded',
        description: 'Lisa Park uploaded transcript for McGill University',
        time: '1 day ago',
        icon: FileText,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900',
    },
    {
        id: 5,
        type: 'status',
        title: 'Under Review',
        description: 'James Lee\'s application moved to under review',
        time: '2 days ago',
        icon: Clock,
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-100 dark:bg-amber-900',
    },
];

export function RecentActivity() {
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
