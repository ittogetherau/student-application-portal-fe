/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCoursesQuery,
  useSaveEnrollmentMutation,
} from "@/hooks/course.hook";
import {
  DEFAULT_CREATE_PAYLOAD_temp,
  useApplicationCreateMutation,
} from "@/hooks/useApplication.hook";
import type { Campus, Intake } from "@/service/course.service";
import { useApplicationFormDataStore } from "@/store/useApplicationFormData.store";
import { useApplicationStepStore } from "@/store/useApplicationStep.store";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const EnrollmentForm = ({ applicationId }: { applicationId?: string }) => {
  const { goToNext, markStepCompleted } = useApplicationStepStore();
  const { setStepData, setApplicationId, _hasHydrated } =
    useApplicationFormDataStore();
  const storedStepData = useApplicationFormDataStore(
    (state) => state.stepData[0]
  );

  const {
    data: coursesResponse,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useCoursesQuery();

  const { mutateAsync: createApplication, isPending: isCreating } =
    useApplicationCreateMutation();
  const { mutateAsync: saveEnrollment, isPending: isSaving } =
    useSaveEnrollmentMutation();

  const courses = coursesResponse?.data ?? [];

  const [formData, setFormData] = useState({
    courseId: "",
    intakeId: "",
    campusId: "",
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFormComplete =
    formData.courseId !== "" &&
    formData.intakeId !== "" &&
    formData.campusId !== "";

  /* ---------- restore saved step ---------- */
  useEffect(() => {
    if (!_hasHydrated) return;

    const saved = storedStepData as
      | {
          courseId?: number;
          intakeId?: number;
          campusId?: number;
          course?: number;
          intake?: number;
          campus?: number;
        }
      | undefined;
    if (!saved) return;

    const courseId = (saved as { courseId?: number }).courseId ?? saved.course;
    const intakeId = (saved as { intakeId?: number }).intakeId ?? saved.intake;
    const campusId = (saved as { campusId?: number }).campusId ?? saved.campus;

    setFormData({
      courseId: courseId?.toString() ?? "",
      intakeId: intakeId?.toString() ?? "",
      campusId: campusId?.toString() ?? "",
    });
  }, [storedStepData, _hasHydrated]);

  /* ---------- auto-save to store ---------- */
  useEffect(() => {
    if (!_hasHydrated || !isFormComplete) return;

    const timeoutId = setTimeout(() => {
      setStepData(0, {
        courseId: Number(formData.courseId),
        intakeId: Number(formData.intakeId),
        campusId: Number(formData.campusId),
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, setStepData, _hasHydrated, isFormComplete]);

  /* ---------- deterministic updates ---------- */
  const handleFieldChange = (
    field: "courseId" | "intakeId" | "campusId",
    value: string
  ) => {
    setFormData((prev) => {
      if (field === "courseId") {
        return { courseId: value, intakeId: "", campusId: "" };
      }

      if (field === "intakeId") {
        return { ...prev, intakeId: value, campusId: "" };
      }

      return { ...prev, [field]: value };
    });
  };

  /* ---------- derived entities ---------- */
  const selectedCourse = courses.find(
    (c) => String(c.id) === formData.courseId
  );

  const selectedIntake = useMemo(
    () =>
      selectedCourse?.intakes?.find((i) => String(i.id) === formData.intakeId),
    [selectedCourse, formData.intakeId]
  );

  const selectedCampus = useMemo(
    () =>
      selectedCourse?.campuses?.find((c) => String(c.id) === formData.campusId),
    [selectedCourse, formData.campusId]
  );

  const availableIntakes: Intake[] = selectedCourse?.intakes ?? [];
  const availableCampuses: Campus[] = selectedCourse?.campuses ?? [];

  /* ---------- save flow ---------- */
  const handleSaveAndContinue = async () => {
    if (!isFormComplete) {
      toast.error("Please complete all required fields");
      return;
    }

    let currentApplicationId = applicationId;

    try {
      if (!currentApplicationId) {
        toast.loading("Creating application draft...", {
          id: "application-flow",
        });

        const res = await createApplication(DEFAULT_CREATE_PAYLOAD_temp);
        currentApplicationId = res.application.id;

        setApplicationId(currentApplicationId);

        const params = new URLSearchParams(searchParams.toString());
        params.set("id", currentApplicationId);
        router.replace(`${pathname}?${params.toString()}`, {
          scroll: false,
        });
      }

      toast.loading("Saving enrollment...", { id: "application-flow" });

      await saveEnrollment({
        applicationId: currentApplicationId!,
        values: {
          course: Number(formData.courseId),
          course_name: selectedCourse?.course_name ?? "",
          intake: Number(formData.intakeId),
          intake_name: selectedIntake?.intake_name ?? "",
          campus: Number(formData.campusId),
          campus_name: selectedCampus?.name ?? "",
        },
      });

      setStepData(0, {
        courseId: Number(formData.courseId),
        intakeId: Number(formData.intakeId),
        campusId: Number(formData.campusId),
      });

      toast.success("Enrollment saved", { id: "application-flow" });
      markStepCompleted(0);
      goToNext();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save enrollment", {
        id: "application-flow",
      });
    }
  };

  /* ---------- loading / error ---------- */
  if (isLoadingCourses) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 border rounded-lg">
      <div className="grid-cols-3 grid gap-4">
        {/* Course */}
        <div className="space-y-2">
          <Label>Course *</Label>
          <Select
            value={formData.courseId}
            onValueChange={(v) => handleFieldChange("courseId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Intake */}
        <div className="space-y-2">
          <Label>Intake *</Label>
          <Select
            value={formData.intakeId}
            onValueChange={(v) => handleFieldChange("intakeId", v)}
            disabled={!formData.courseId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select intake" />
            </SelectTrigger>
            <SelectContent>
              {availableIntakes.map((i) => (
                <SelectItem key={i.id} value={String(i.id)}>
                  {i.intake_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campus */}
        <div className="space-y-2">
          <Label>Campus *</Label>
          <Select
            value={formData.campusId}
            onValueChange={(v) => handleFieldChange("campusId", v)}
            disabled={!formData.intakeId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campus" />
            </SelectTrigger>
            <SelectContent>
              {availableCampuses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveAndContinue}
          disabled={isSaving || isCreating}
        >
          {isSaving || isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Save & Continue
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnrollmentForm;
