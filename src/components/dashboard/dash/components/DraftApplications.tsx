"use client";

import { FileText, Edit3, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DraftApplication {
    id: string;
    studentName: string;
    university: string;
    program: string;
    lastEdited: string;
    completionPercent: number;
}

const draftApplications: DraftApplication[] = [
    {
        id: 'DRF-001',
        studentName: 'Emma Thompson',
        university: 'University of Melbourne',
        program: 'Master of Business Administration',
        lastEdited: '2 hours ago',
        completionPercent: 75
    },
    {
        id: 'DRF-002',
        studentName: 'James Wilson',
        university: 'University of Sydney',
        program: 'Bachelor of Computer Science',
        lastEdited: '1 day ago',
        completionPercent: 45
    },
    {
        id: 'DRF-003',
        studentName: 'Sophia Chen',
        university: 'Australian National University',
        program: 'Master of Data Science',
        lastEdited: '3 days ago',
        completionPercent: 90
    },
    {
        id: 'DRF-004',
        studentName: 'Oliver Martinez',
        university: 'University of Queensland',
        program: 'Bachelor of Engineering (Civil)',
        lastEdited: '5 days ago',
        completionPercent: 30
    },
    {
        id: 'DRF-005',
        studentName: 'Ava Singh',
        university: 'Monash University',
        program: 'Master of Public Health',
        lastEdited: '1 week ago',
        completionPercent: 60
    }
];

export function DraftApplications() {
    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle>Draft Applications</CardTitle>
                            <CardDescription>{draftApplications.length} applications in progress</CardDescription>
                        </div>
                    </div>
                    <Button>
                        + New Draft
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {draftApplications.map((draft) => (
                        <div key={draft.id} className="p-6 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold">{draft.studentName}</h3>
                                        <Badge variant="secondary">
                                            {draft.id}
                                        </Badge>
                                    </div>
                                    <p className="text-sm mb-1">{draft.university}</p>
                                    <p className="text-sm text-muted-foreground mb-3">{draft.program}</p>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            Last edited {draft.lastEdited}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${draft.completionPercent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium">{draft.completionPercent}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon">
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {draftApplications.length === 0 && (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No draft applications</p>
                        <p className="text-sm text-muted-foreground mt-1">Start a new application to see it here</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
