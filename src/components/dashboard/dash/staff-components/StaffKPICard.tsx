"use client";

import { LucideIcon } from 'lucide-react';

interface StaffKPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    iconColor?: string;
}

export function StaffKPICard({ title, value, icon: Icon, iconColor = 'bg-primary/10 text-primary', trend }: StaffKPICardProps) {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/20 group">
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm font-medium truncate">{title}</p>
                    <h3 className="text-xl sm:text-2xl font-medium text-neutral-900 dark:text-neutral-100 mt-1 tracking-tight">{value}</h3>

                    {trend && (
                        <div className="flex items-center mt-2">
                            <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                {trend.value}
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-2.5 rounded-xl ${iconColor} shrink-0 ml-3 transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
            </div>
        </div>
    );
}
