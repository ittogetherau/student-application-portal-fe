"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { GraduationCap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useCoursesQuery, useSaveEnrollmentMutation } from "@/hooks/course.hook";
import { useApplicationCreateMutation } from "@/hooks/useApplication.hook";
import { toast } from "react-hot-toast";
import type { Course, Campus, Intake } from "@/service/course.service";

const EnrollmentForm = ({ applicationId }: { applicationId?: string }) => {
  const { goToNext, markStepCompleted } = useApplicationStepStore();
  const { setStepData, getStepData, setApplicationId } = useApplicationFormDataStore();

  const { data: coursesResponse, isLoading: isLoadingCourses, error: coursesError } = useCoursesQuery();
  const { mutateAsync: createApplication, isPending: isCreating } = useApplicationCreateMutation();
  const { mutateAsync: saveEnrollment, isPending: isSaving } = useSaveEnrollmentMutation();

  const courses = (coursesResponse?.data || []) as Course[];

  const [formData, setFormData] = useState({
    courseId: "",
    campusId: "",
    intakeId: "",
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Load initial data from store
  useEffect(() => {
    const savedData = getStepData<any>(0);
    if (savedData) {
      setFormData({
        courseId: savedData.courseId?.toString() || "",
        campusId: savedData.campusId?.toString() || "",
        intakeId: savedData.intakeId?.toString() || "",
      });
    }
  }, [getStepData]);

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id.toString() === formData.courseId);
  }, [courses, formData.courseId]);

  const availableCampuses = useMemo(() => {
    return (selectedCourse?.campuses || []) as Campus[];
  }, [selectedCourse]);

  const availableIntakes = useMemo(() => {
    return (selectedCourse?.intakes || []) as Intake[];
  }, [selectedCourse]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((p) => {
      const newData = { ...p, [field]: value };

      // Reset dependent fields
      if (field === "courseId") {
        newData.campusId = "";
        newData.intakeId = "";
      }

      return newData;
    });
  };

  const handleSaveAndContinue = async () => {
    if (!formData.courseId || !formData.campusId || !formData.intakeId) {
      toast.error("Please complete all required fields");
      return;
    }

    let currentApplicationId = applicationId;

    try {
      // Step 1: Create application draft if it doesn't exist
      if (!currentApplicationId) {
        toast.loading("Creating application draft...", { id: "application-flow" });

        const { DEFAULT_CREATE_PAYLOAD_temp } = await import("@/hooks/useApplication.hook");
        const res = await createApplication(DEFAULT_CREATE_PAYLOAD_temp);
        currentApplicationId = res.application.id;

        // Update store and URL with new application ID
        setApplicationId(currentApplicationId);
        const params = new URLSearchParams(searchParams.toString());
        params.set("id", currentApplicationId);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });

        toast.success("Application draft created", { id: "application-flow" });
      }

      // // Step 2: Save enrollment data to the application
      // toast.loading("Saving enrollment details...", { id: "application-flow" });
      // await saveEnrollment({
      //   applicationId: currentApplicationId as string,
      //   values: {
      //     course: parseInt(formData.courseId),
      //     intake: parseInt(formData.intakeId),
      //     campus: parseInt(formData.campusId),
      //   },
      // });

      // // Step 3: Update local store with enrollment data
      // setStepData(0, {
      //   courseId: parseInt(formData.courseId),
      //   campusId: parseInt(formData.campusId),
      //   intakeId: parseInt(formData.intakeId),
      // });

      // Show success and navigate
      toast.success("Enrollment saved successfully", { id: "application-flow" });
      markStepCompleted(0);

      // Small delay to let the user see the success message
      setTimeout(() => {
        goToNext();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Failed to save enrollment", { id: "application-flow" });
      console.error("Enrollment save error:", error);
    }
  };

  if (isLoadingCourses) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Fetching course catalog...</p>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Failed to Load Courses</h3>
          <p className="text-muted-foreground max-w-sm">
            We encountered an issue while fetching the course list. Please try again.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Loading
        </Button>
      </div>
    );
  }

  const isFormComplete = !!(formData.courseId && formData.campusId && formData.intakeId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/10 shadow-sm overflow-hidden">
        <div className="h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <GraduationCap className="h-6 w-6 text-primary" />
            Select Your Course
          </CardTitle>
          <p className="text-sm text-muted-foreground">Select the course, campus, and intake to proceed.</p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Course <span className="text-destructive">*</span></Label>
              <Select
                value={formData.courseId}
                onValueChange={(v) => handleFieldChange("courseId", v)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Campus <span className="text-destructive">*</span></Label>
              <Select
                value={formData.campusId}
                onValueChange={(v) => handleFieldChange("campusId", v)}
                disabled={!formData.courseId}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={!formData.courseId ? "Select course first" : "Select campus"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCampuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Intake <span className="text-destructive">*</span></Label>
              <Select
                value={formData.intakeId}
                onValueChange={(v) => handleFieldChange("intakeId", v)}
                disabled={!formData.courseId}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={!formData.courseId ? "Select course first" : "Select intake month"} />
                </SelectTrigger>
                <SelectContent>
                  {availableIntakes.map((intake) => (
                    <SelectItem key={intake.id} value={intake.id.toString()}>
                      {intake.intake_name} ({new Date(intake.intake_start).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCourse && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">{selectedCourse.course_name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{selectedCourse.course_title}</p>

                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end p-4 bg-background ">


        <div className="flex items-center gap-4">
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSaving || isCreating || !isFormComplete}
            className="px-8 font-semibold h-11 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isSaving || isCreating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;
