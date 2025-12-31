"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, GraduationCap } from "lucide-react";
import { useApplicationFormContext } from "@/contexts/ApplicationFormContext";
import ApplicationStepHeader from "./application-step-header";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useApplicationStepMutations } from "@/hooks/useApplicationSteps.hook";
import { Loader2 } from "lucide-react";

export interface Enrollment {
    id: string;
    course: string;
    attempt: number;
    campus: string;
    intakeDate: string;
    studyPeriod: string;
    courseLength: string;
    tuitionFee: string;
    status: string;
}

export interface EnrollmentStepData {
    agentId: string;
    campus: string;
    courseType: string;
    intakeYear: string;
    course: string;
    preferredStartDate: string;
    enrollments: Enrollment[];
}

export default function EnrollmentManagementView() {
    const { getStepData, saveStepData, goToNext, markStepCompleted } =
        useApplicationFormContext();
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId");
    const stepId = 0;
    const enrollmentMutation = useApplicationStepMutations(applicationId)[stepId];

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [formData, setFormData] = useState({
        agentId: "",
        campus: "",
        courseType: "",
        intakeYear: "",
        course: "",
        preferredStartDate: "",
    });

    // Load initial data
    useEffect(() => {
        const data = getStepData<EnrollmentStepData>(stepId);
        if (data) {
            setEnrollments(data.enrollments || []);
            setFormData({
                agentId: data.agentId || "",
                campus: data.campus || "",
                courseType: data.courseType || "",
                intakeYear: data.intakeYear || "",
                course: data.course || "",
                preferredStartDate: data.preferredStartDate || "",
            });
        }
    }, [getStepData]);

    const handleFieldChange = (field: string, value: string) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        // For auto-saving the form fields
        saveStepData(stepId, { ...newFormData, enrollments });
    };

    const handleAddCourse = () => {
        if (!formData.course || !formData.campus || !formData.preferredStartDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        const newEnrollment: Enrollment = {
            id: `ENR-${Date.now()}`,
            course: formData.course,
            attempt: enrollments.length + 1,
            campus: formData.campus,
            intakeDate: formData.preferredStartDate,
            studyPeriod: `${formData.intakeYear}-${parseInt(formData.intakeYear) + 1
                }`,
            courseLength: "2 years",
            tuitionFee: "$25,000",
            status: "Pending",
        };

        const newEnrollments = [...enrollments, newEnrollment];
        setEnrollments(newEnrollments);

        const updatedData = { ...formData, enrollments: newEnrollments };
        saveStepData(stepId, updatedData);

        toast.success("Course added successfully");

        // Reset specific form fields
        setFormData({
            ...formData,
            course: "",
            preferredStartDate: "",
        });
    };

    const handleDeleteEnrollment = (id: string) => {
        const newEnrollments = enrollments.filter((e) => e.id !== id);
        setEnrollments(newEnrollments);
        saveStepData(stepId, { ...formData, enrollments: newEnrollments });
        toast.success("Course removed");
    };

    const handleSaveAndContinue = () => {
        if (enrollments.length === 0) {
            toast.error("Please add at least one course enrollment");
            return;
        }

        const payload = { ...formData, enrollments };
        if (applicationId) {
            enrollmentMutation.mutate(payload);
        } else {
            markStepCompleted(stepId);
            goToNext();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Add Course Form */}
            <Card className="border-muted/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-4 border-b bg-muted/30">
                    <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Add a Course
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        {/* Apply Under Agent */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="agentId"
                                className="text-sm font-medium text-foreground/80"
                            >
                                Apply Under Agent
                            </Label>
                            <Select
                                value={formData.agentId}
                                onValueChange={(value) => handleFieldChange("agentId", value)}
                            >
                                <SelectTrigger
                                    id="agentId"
                                    className="h-10 bg-background/50 border-muted"
                                >
                                    <SelectValue placeholder="Select agent..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="agent-1">John Agent (AG001)</SelectItem>
                                    <SelectItem value="agent-2">Sarah Agent (AG002)</SelectItem>
                                    <SelectItem value="agent-3">Mike Agent (AG003)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Which Campus */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="campus"
                                className="text-sm font-medium text-foreground/80"
                            >
                                Which Campus
                            </Label>
                            <Select
                                value={formData.campus}
                                onValueChange={(value) => handleFieldChange("campus", value)}
                            >
                                <SelectTrigger
                                    id="campus"
                                    className="h-10 bg-background/50 border-muted"
                                >
                                    <SelectValue placeholder="Select campus..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CIHE Parramatta Campus">
                                        CIHE Parramatta Campus
                                    </SelectItem>
                                    <SelectItem value="CIHE Sydney Campus">
                                        CIHE Sydney Campus
                                    </SelectItem>
                                    <SelectItem value="CIHE Melbourne Campus">
                                        CIHE Melbourne Campus
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Course Type */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="courseType"
                                className="text-sm font-medium text-foreground/80"
                            >
                                Course Type
                            </Label>
                            <Select
                                value={formData.courseType}
                                onValueChange={(value) => handleFieldChange("courseType", value)}
                            >
                                <SelectTrigger
                                    id="courseType"
                                    className="h-10 bg-background/50 border-muted"
                                >
                                    <SelectValue placeholder="Select course type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HigherEd">HigherEd</SelectItem>
                                    <SelectItem value="VET">VET</SelectItem>
                                    <SelectItem value="ELICOS">ELICOS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Intake Year */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="intakeYear"
                                className="text-sm font-medium text-foreground/80"
                            >
                                Intake Year
                            </Label>
                            <Select
                                value={formData.intakeYear}
                                onValueChange={(value) => handleFieldChange("intakeYear", value)}
                            >
                                <SelectTrigger
                                    id="intakeYear"
                                    className="h-10 bg-background/50 border-muted"
                                >
                                    <SelectValue placeholder="Select intake year..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Select Course */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="course"
                                className="text-sm font-medium text-foreground/80"
                            >
                                Select Course
                            </Label>
                            <Select
                                value={formData.course}
                                onValueChange={(value) => handleFieldChange("course", value)}
                            >
                                <SelectTrigger
                                    id="course"
                                    className="h-10 bg-background/50 border-muted"
                                >
                                    <SelectValue placeholder="Select course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bachelor of Business">
                                        Bachelor of Business
                                    </SelectItem>
                                    <SelectItem value="Bachelor of IT">Bachelor of IT</SelectItem>
                                    <SelectItem value="Master of Business Administration">
                                        Master of Business Administration
                                    </SelectItem>
                                    <SelectItem value="Diploma of Accounting">
                                        Diploma of Accounting
                                    </SelectItem>
                                    <SelectItem value="Certificate IV in Business">
                                        Certificate IV in Business
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Preferred Start Date */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="preferredStartDate"
                                className="text-sm font-medium text-foreground/80"
                            >
                                Preferred Start Date
                            </Label>
                            <Input
                                id="preferredStartDate"
                                type="date"
                                className="h-10 bg-background/50 border-muted"
                                value={formData.preferredStartDate}
                                onChange={(e) =>
                                    handleFieldChange("preferredStartDate", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleAddCourse}
                            size="default"
                            className="gap-2 px-6 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <Plus className="h-4 w-4" />
                            Add Course
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Enrollments Table */}
            {enrollments.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">
                            Current Enrollments
                        </h2>
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                            {enrollments.length} {enrollments.length === 1 ? 'Course' : 'Courses'}
                        </Badge>
                    </div>
                    <div className="rounded-xl border border-muted/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="h-12 font-semibold">COURSE</TableHead>
                                    <TableHead className="h-12 font-semibold">ATTEMPT</TableHead>
                                    <TableHead className="h-12 font-semibold">CAMPUS</TableHead>
                                    <TableHead className="h-12 font-semibold">
                                        INTAKE DATE
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold">
                                        TUITION FEE
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold">STATUS</TableHead>
                                    <TableHead className="h-12 font-semibold text-right">
                                        ACTION
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.map((enrollment) => (
                                    <TableRow
                                        key={enrollment.id}
                                        className="hover:bg-muted/20 transition-colors"
                                    >
                                        <TableCell className="py-4 font-medium">
                                            {enrollment.course}
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                {enrollment.attempt}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4">{enrollment.campus}</TableCell>
                                        <TableCell className="py-4 text-muted-foreground">
                                            {enrollment.intakeDate}
                                        </TableCell>
                                        <TableCell className="py-4 font-mono text-sm">
                                            {enrollment.tuitionFee}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200"
                                            >
                                                {enrollment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-muted transition-colors"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-colors"
                                                    onClick={() => handleDeleteEnrollment(enrollment.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <ApplicationStepHeader className="mt-8 pt-8 border-t border-muted/60">
                <Button
                    onClick={handleSaveAndContinue}
                    disabled={enrollmentMutation.isPending}
                    className="gap-2 px-8 shadow-md hover:shadow-lg transition-all duration-300 ml-auto"
                >
                    {enrollmentMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save & Next"
                    )}
                </Button>
            </ApplicationStepHeader>
        </div>
    );
}