"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddCourseModal from "./add-course-modal";

interface EnrollmentManagementViewProps {
    onBack: () => void;
}

const EnrollmentManagementView = ({ onBack }: EnrollmentManagementViewProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data for the table
    const enrollmentCourses = [
        {
            id: "4389",
            course: "Bachelor of Business- Major In Hospitality",
            attempt: "1",
            campus: "CIHE Parramatta Campus",
            intakeDate: "23/03/2026",
            studyPeriod: "23/03/2026 To 18/03/2029",
            courseLength: "156 Weeks",
            tuitionFee: "$ 1200",
            status: "In Applica...",
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-2"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="font-medium text-sm sm:text-base">Back to Application</span>
                </Button>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-muted/60 overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 px-6 pt-7 border-b border-muted/30">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold tracking-tight">Enrollment Course</CardTitle>
                        <p className="text-[13px] text-muted-foreground">Manage and view all enrolled courses for this applicant.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm transition-all font-semibold">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Enrolled Course
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full">
                        <div className="overflow-x-auto pb-2 custom-scrollbar">
                            <Table className="min-w-[1000px] lg:min-w-full">
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30 transition-colors border-b-muted/40">
                                        <TableHead className="w-[80px] pl-6 font-bold text-foreground text-[12px] uppercase tracking-wider">ID</TableHead>
                                        <TableHead className="min-w-[200px] max-w-[300px] font-bold text-foreground text-[12px] uppercase tracking-wider">COURSE</TableHead>
                                        <TableHead className="font-bold text-foreground text-center text-[12px] uppercase tracking-wider px-2">ATTEMPT</TableHead>
                                        <TableHead className="min-w-[150px] font-bold text-foreground text-[12px] uppercase tracking-wider">CAMPUS</TableHead>
                                        <TableHead className="min-w-[100px] font-bold text-foreground text-[12px] uppercase tracking-wider">INTAKE DATE</TableHead>
                                        <TableHead className="min-w-[150px] font-bold text-foreground text-[12px] uppercase tracking-wider">STUDY PERIOD</TableHead>
                                        <TableHead className="min-w-[120px] font-bold text-foreground text-[12px] uppercase tracking-wider">COURSE LENGTH</TableHead>
                                        <TableHead className="min-w-[100px] font-bold text-foreground text-[12px] uppercase tracking-wider">TUITION FEE</TableHead>
                                        <TableHead className="font-bold text-foreground text-[12px] uppercase tracking-wider">STATUS</TableHead>
                                        <TableHead className="text-right pr-6 font-bold text-foreground text-[12px] uppercase tracking-wider">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrollmentCourses.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/5 transition-colors border-b-muted/30">
                                            <TableCell className="pl-6 font-medium text-muted-foreground text-[13px] py-4">{item.id}</TableCell>
                                            <TableCell className="font-bold text-[14px] text-foreground py-4 line-clamp-3 leading-tight max-w-[300px] whitespace-normal">
                                                {item.course}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-medium text-center py-4">{item.attempt}</TableCell>
                                            <TableCell className="text-muted-foreground font-medium py-4 text-[13px]">{item.campus}</TableCell>
                                            <TableCell className="text-muted-foreground font-medium py-4 text-[13px]">{item.intakeDate}</TableCell>
                                            <TableCell className="text-muted-foreground font-medium py-4 text-[13px] whitespace-nowrap">{item.studyPeriod}</TableCell>
                                            <TableCell className="text-muted-foreground font-medium py-4 text-[13px]">{item.courseLength}</TableCell>
                                            <TableCell className="font-bold text-primary py-4">{item.tuitionFee}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap uppercase tracking-tighter">
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5 transition-all">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default EnrollmentManagementView;
