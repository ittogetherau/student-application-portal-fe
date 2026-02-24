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
  addWeeksToYmdDateString,
  parseWeeksFromDurationText,
} from "@/features/application-form/constants/enrollment-date-utils";
import {
  useCourseIntakesQuery,
  useCoursesQuery,
  useSaveEnrollmentMutation,
} from "@/features/application-form/hooks/course.hook";
import { useApplicationStepQuery } from "@/features/application-form/hooks/use-application-steps.hook";
import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import { useApplicationFormDataStore } from "@/features/application-form/store/use-application-form-data.store";
import { useApplicationStepStore } from "@/features/application-form/store/use-application-step.store";
import type { EnrollmentValues } from "@/features/application-form/validations/enrollment";
import { APPLICATION_STAGE } from "@/shared/constants/types";
import {
  DEFAULT_CREATE_PAYLOAD_temp,
  useApplicationCreateMutation,
  useApplicationGetQuery,
} from "@/shared/hooks/use-applications";
import { useRoleFlags } from "@/shared/hooks/use-role-flags";
import { cn } from "@/shared/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import StudentEnrollmentForm from "../student-enrollment/student-enrollment-form";

const requiredSelectId = (message: string) =>
  z
    .number()
    .int()
    .min(1, message)
    .optional()
    .refine((value) => value !== undefined, message);

const enrollmentCoreSchema = z.object({
  course: requiredSelectId("Please select a course"),
  intake: requiredSelectId("Please select an intake"),
  campus: requiredSelectId("Please select a campus"),
});

type EnrollmentCoreFormValues = z.infer<typeof enrollmentCoreSchema>;

const toId = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const MIN_INTAKE_START_YEAR = new Date().getFullYear();

type CampusIntakeToken = "melbourne" | "paramatta" | null;

const getCampusIntakeToken = (
  campusName?: string | null,
): CampusIntakeToken => {
  const normalizedName = campusName?.toLowerCase() ?? "";
  if (normalizedName.includes("melbourne")) return "melbourne";
  if (
    normalizedName.includes("paramatta") ||
    normalizedName.includes("parramatta")
  ) {
    return "paramatta";
  }
  return null;
};

const matchesBitCampusIntake = (
  intakeName: string | undefined,
  campusToken: CampusIntakeToken,
): boolean => {
  if (!campusToken) return true;
  const normalizedIntakeName = intakeName?.toLowerCase() ?? "";
  if (campusToken === "melbourne") {
    return normalizedIntakeName.includes("melbourne");
  }
  return (
    normalizedIntakeName.includes("paramatta") ||
    normalizedIntakeName.includes("parramatta")
  );
};

const EnrollmentForm = ({ applicationId }: { applicationId?: string }) => {
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [resolvedApplicationId, setResolvedApplicationId] = useState<
    string | undefined
  >(applicationId);

  const { goToNext, markStepCompleted, clearStepDirty } =
    useApplicationStepStore();
  const setApplicationId = useApplicationFormDataStore(
    (state) => state.setApplicationId,
  );
  const setStepData = useApplicationFormDataStore((state) => state.setStepData);
  const persistedEnrollmentData = useApplicationFormDataStore(
    (state) => state.stepData[0],
  );
  const currentApplicationId = resolvedApplicationId ?? applicationId;
  const { isStaffOrAdmin } = useRoleFlags();
  const { data: applicationResponse } = useApplicationGetQuery(
    currentApplicationId ?? null,
  );
  const currentStage = applicationResponse?.data?.current_stage;
  const shouldShowManageEnrollment =
    !!currentApplicationId &&
    isStaffOrAdmin &&
    currentStage !== APPLICATION_STAGE.DRAFT;

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

  const methods = useForm<EnrollmentCoreFormValues>({
    resolver: zodResolver(enrollmentCoreSchema),
    defaultValues: {
      course: undefined,
      intake: undefined,
      campus: undefined,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (applicationId && applicationId !== resolvedApplicationId) {
      setResolvedApplicationId(applicationId);
    }
  }, [applicationId, resolvedApplicationId]);

  useApplicationStepQuery(currentApplicationId ?? null, 0);

  useFormPersistence({
    applicationId: currentApplicationId ?? null,
    stepId: 0,
    form: methods,
    enabled: true,
    autoSave: false,
    onDataLoaded: (data) => {
      if (hasRestoredRef.current) return;

      const saved = data as unknown as {
        courseId?: number | string;
        intakeId?: number | string;
        campusId?: number | string;
        course_id?: number | string;
        intake_id?: number | string;
        campus_id?: number | string;
        course?: number | string;
        intake?: number | string;
        campus?: number | string;
      };

      const legacyCourse = toId(
        saved.courseId ?? saved.course_id ?? saved.course,
      );
      const legacyIntake = toId(
        saved.intakeId ?? saved.intake_id ?? saved.intake,
      );
      const legacyCampus = toId(
        saved.campusId ?? saved.campus_id ?? saved.campus,
      );

      if (legacyCourse) {
        methods.setValue("course", legacyCourse, { shouldDirty: false });
      }
      if (legacyIntake) {
        methods.setValue("intake", legacyIntake, { shouldDirty: false });
      }
      if (legacyCampus) {
        methods.setValue("campus", legacyCampus, { shouldDirty: false });
      }

      hasRestoredRef.current = true;
    },
  });

  const { setValue, resetField, clearErrors } = methods;
  const courseValue = useWatch({ control: methods.control, name: "course" });
  const intakeValue = useWatch({ control: methods.control, name: "intake" });
  const campusValue = useWatch({ control: methods.control, name: "campus" });
  const selectedCourseId = toId(courseValue);
  const selectedCourse = useMemo(
    () =>
      courses.find((course) => toId(course.id) === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const {
    data: intakesResponse,
    isLoading: isLoadingIntakes,
    isFetching: isFetchingIntakes,
    error: intakesError,
  } = useCourseIntakesQuery(selectedCourse?.course_code, {
    campus: campusValue,
  });

  const isBitCourse =
    (selectedCourse?.course_code ?? "").trim().toUpperCase() === "BIT";
  const selectedCampusName = useMemo(() => {
    if (!selectedCourseId) return "";
    const course = courses.find((item) => toId(item.id) === selectedCourseId);
    const campus = course?.campuses?.find(
      (item) => toId(item.id) === toId(campusValue),
    );
    return campus?.name ?? "";
  }, [campusValue, courses, selectedCourseId]);
  const selectedCampusToken = useMemo(
    () => getCampusIntakeToken(selectedCampusName),
    [selectedCampusName],
  );

  const availableIntakes = useMemo(
    () =>
      (intakesResponse?.data ?? []).filter((intake) => {
        const intakeYear = toId(intake.intake_year);
        if (intakeYear === undefined || intakeYear < MIN_INTAKE_START_YEAR) {
          return false;
        }

        if (!isBitCourse) return true;
        return matchesBitCampusIntake(intake.intake_name, selectedCampusToken);
      }),
    [intakesResponse?.data, isBitCourse, selectedCampusToken],
  );

  const availableCampuses = useMemo(() => {
    if (!selectedCourseId) return [];
    const course = courses.find((item) => toId(item.id) === selectedCourseId);
    return course?.campuses ?? [];
  }, [courses, selectedCourseId]);

  const canFetchIntakes = !!courseValue && !!campusValue;
  const isIntakesLoading =
    canFetchIntakes && (isLoadingIntakes || isFetchingIntakes);
  const hasIntakes = availableIntakes.length > 0;
  const intakePlaceholder = !courseValue
    ? "Select course first"
    : !campusValue
      ? "Select campus first"
      : isIntakesLoading
        ? "Loading intakes..."
        : hasIntakes
          ? "Select intake"
          : "No intakes available";

  useEffect(() => {
    if (!canFetchIntakes || isIntakesLoading) return;
    const currentIntake = toId(intakeValue);
    if (!currentIntake) return;

    const intakeStillValid = availableIntakes.some(
      (intake) => toId(intake.id) === currentIntake,
    );
    if (!intakeStillValid) {
      resetField("intake", { defaultValue: undefined });
    }
  }, [
    availableIntakes,
    canFetchIntakes,
    intakeValue,
    isIntakesLoading,
    resetField,
  ]);

  const handleFieldChange = (
    field: "course" | "intake" | "campus",
    value: string,
  ) => {
    const nextId = toId(value);
    if (!nextId || nextId <= 0) return;

    const currentCourse = toId(methods.getValues("course"));
    const currentIntake = toId(methods.getValues("intake"));
    const currentCampus = toId(methods.getValues("campus"));

    if (field === "course") {
      setValue("course", nextId, { shouldDirty: true });

      if (currentCourse !== nextId) {
        resetField("intake", { defaultValue: undefined });
        resetField("campus", { defaultValue: undefined });
        clearErrors(["course", "intake", "campus"]);
        return;
      }

      const intakeStillValid = !!(
        currentIntake &&
        availableIntakes.some((intake) => toId(intake.id) === currentIntake)
      );
      if (!intakeStillValid) {
        resetField("intake", { defaultValue: undefined });
      }

      const campusStillValid = !!(
        currentCampus &&
        availableCampuses.some((campus) => toId(campus.id) === currentCampus)
      );
      if (!campusStillValid) {
        resetField("campus", { defaultValue: undefined });
      }

      clearErrors(["course", "intake", "campus"]);
      return;
    }

    if (field === "intake") {
      if (!currentCourse) return;
      setValue("intake", nextId, { shouldDirty: true });
      clearErrors(["intake", "campus"]);
      return;
    }

    if (!currentCourse) return;

    if (currentCampus !== nextId) {
      resetField("intake", { defaultValue: undefined });
    }
    setValue("campus", nextId, { shouldDirty: true });
    clearErrors(["campus", "intake"]);
  };

  const selectedIntake = useMemo(
    () =>
      availableIntakes.find((intake) => toId(intake.id) === toId(intakeValue)),
    [availableIntakes, intakeValue],
  );
  const selectedCampus = useMemo(
    () =>
      availableCampuses.find((campus) => toId(campus.id) === toId(campusValue)),
    [availableCampuses, campusValue],
  );

  const intakeEndDate = (() => {
    if (!selectedIntake?.intake_start) return null;
    const weeks = parseWeeksFromDurationText(selectedCourse?.duration_text);
    if (!weeks) return null;
    return addWeeksToYmdDateString(selectedIntake.intake_start, weeks);
  })();

  const ensureApplicationId = async () => {
    if (currentApplicationId) return currentApplicationId;

    toast.loading("Creating application draft...", {
      id: "application-flow",
    });

    const res = await createApplication(DEFAULT_CREATE_PAYLOAD_temp);
    const createdId = res.application.id;

    setResolvedApplicationId(createdId);
    setApplicationId(createdId);

    const params = new URLSearchParams(searchParams.toString());
    params.set("id", createdId);
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });

    toast.dismiss("application-flow");
    return createdId;
  };

  const onSubmit = async (values: EnrollmentCoreFormValues) => {
    try {
      const ensuredApplicationId = await ensureApplicationId();

      toast.loading("Saving enrollment...", { id: "application-flow" });

      const payload: EnrollmentValues = {
        course: Number(values.course),
        course_name: selectedCourse?.course_name ?? "",
        intake: Number(values.intake),
        intake_name: selectedIntake?.intake_name ?? "",
        campus: Number(values.campus),
        campus_name:
          selectedCourse?.campuses?.find(
            (campus) => toId(campus.id) === toId(values.campus),
          )?.name ?? "",
        advanced_standing_credit: "no",
      };

      await saveEnrollment({
        applicationId: ensuredApplicationId,
        values: payload,
      });

      const existingData =
        persistedEnrollmentData &&
        typeof persistedEnrollmentData === "object" &&
        !Array.isArray(persistedEnrollmentData)
          ? (persistedEnrollmentData as Record<string, unknown>)
          : {};

      setStepData(0, {
        ...existingData,
        ...payload,
      });

      toast.success("Enrollment saved", { id: "application-flow" });
      methods.reset(values);
      clearStepDirty(0);
      markStepCompleted(0);
      goToNext();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save enrollment";
      toast.error(message, {
        id: "application-flow",
      });
    }
  };

  const handleManagedEnrollmentSuccess = (savedPayload?: EnrollmentValues) => {
    if (savedPayload) {
      setStepData(0, savedPayload);
    }
    setIsEnrollmentDialogOpen(false);
    clearStepDirty(0);
    markStepCompleted(0);
    goToNext();
  };

  const handleManageEnrollmentClick = async () => {
    if (isEnrollmentDialogOpen) {
      setIsEnrollmentDialogOpen(false);
      return;
    }

    try {
      await ensureApplicationId();
      setIsEnrollmentDialogOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to prepare enrollment management.";
      toast.error(message, { id: "application-flow" });
    }
  };

  if (isLoadingCourses) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (coursesError || intakesError) {
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
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className={cn("space-y-8 p-4 border rounded-lg mb-6")}>
          <div className="grid-cols-3 grid gap-4">
            <div className="space-y-2">
              <Label>Course *</Label>
              <Controller
                name="course"
                control={methods.control}
                render={({ field: { value } }) => (
                  <Select
                    value={value ? String(value) : ""}
                    onValueChange={(v) => handleFieldChange("course", v)}
                  >
                    <SelectTrigger
                      aria-invalid={!!methods.formState.errors.course}
                    >
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
                )}
              />

              {selectedCourse && (
                <p className="text-sm text-muted-foreground">
                  Duration: {selectedCourse.duration_text}
                </p>
              )}
              {methods.formState.errors.course?.message && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.course.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Campus *</Label>
              <Controller
                name="campus"
                control={methods.control}
                render={({ field: { value } }) => (
                  <Select
                    value={value ? String(value) : ""}
                    onValueChange={(v) => handleFieldChange("campus", v)}
                    disabled={!courseValue}
                  >
                    <SelectTrigger
                      aria-invalid={!!methods.formState.errors.campus}
                    >
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
                )}
              />
              {methods.formState.errors.campus?.message && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.campus.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Intake *</Label>
              <Controller
                name="intake"
                control={methods.control}
                render={({ field: { value } }) => (
                  <Select
                    value={value ? String(value) : ""}
                    onValueChange={(v) => handleFieldChange("intake", v)}
                    disabled={!courseValue || !campusValue || isIntakesLoading}
                  >
                    <SelectTrigger
                      aria-invalid={!!methods.formState.errors.intake}
                    >
                      <SelectValue placeholder={intakePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {!courseValue || !campusValue ? (
                        <SelectItem value="__intake-prereq__" disabled>
                          Select course and campus first
                        </SelectItem>
                      ) : isIntakesLoading ? (
                        <SelectItem value="__intake-loading__" disabled>
                          Loading intakes...
                        </SelectItem>
                      ) : !hasIntakes ? (
                        <SelectItem value="__intake-empty__" disabled>
                          No intakes available
                        </SelectItem>
                      ) : (
                        availableIntakes.map((i) => (
                          <SelectItem key={i.id} value={String(i.id)}>
                            {i.intake_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {selectedIntake && (
                <p className="text-sm text-muted-foreground">
                  Starts: {selectedIntake.intake_start}
                  <br />
                  Ends: {intakeEndDate ?? "-"}
                </p>
              )}

              {methods.formState.errors.intake?.message && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.intake.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        {shouldShowManageEnrollment && (
          <div className="mb-4 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManageEnrollmentClick}
              disabled={isCreating}
            >
              {isEnrollmentDialogOpen
                ? "Close Enrollment Management"
                : "Manage Enrollment"}
            </Button>
          </div>
        )}

        {!isEnrollmentDialogOpen && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || isCreating}>
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
        )}
      </form>

      {isEnrollmentDialogOpen && (
        <div className="mt-6">
          <StudentEnrollmentForm
            applicationId={currentApplicationId}
            initialData={persistedEnrollmentData}
            selectedCore={
              selectedCourse && selectedIntake && selectedCampus
                ? {
                    course: Number(selectedCourse.id),
                    course_name: selectedCourse.course_name,
                    intake: Number(selectedIntake.id),
                    intake_name: selectedIntake.intake_name,
                    campus: Number(selectedCampus.id),
                    campus_name: selectedCampus.name,
                    course_duration_text: selectedCourse.duration_text,
                    intake_start: selectedIntake.intake_start,
                    intake_end: selectedIntake.intake_end,
                    class_start_date: selectedIntake.class_start_date,
                    class_end_date: selectedIntake.class_end_date,
                    intake_duration: selectedIntake.intake_duration,
                  }
                : null
            }
            onSubmitSuccess={handleManagedEnrollmentSuccess}
          />
        </div>
      )}
    </FormProvider>
  );
};

export default EnrollmentForm;
