/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campus, Intake } from "@/service/course.service";
import {
  DEFAULT_CREATE_PAYLOAD_temp,
  useApplicationCreateMutation,
} from "@/shared/hooks/use-applications";
import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import {
  defaultEnrollmentFormValues,
  enrollmentFormSchema,
  type EnrollmentFormValues,
} from "@/features/application-form/utils/validations/enrollment";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  useCoursesQuery,
  useSaveEnrollmentMutation,
} from "../../hooks/course.hook";
import { useApplicationFormDataStore } from "../../store/use-application-form-data.store";
import { useApplicationStepStore } from "../../store/use-application-step.store";

const STUDY_REASON_OPTIONS = [
  { value: "01", label: "01 -To get a job (Job related)" },
  { value: "02", label: "02 -To develop my existing business (Job related)" },
  { value: "03", label: "03 -To start my own business (Job related)" },
  { value: "04", label: "04 -To try for a different career (Job related)" },
  { value: "05", label: "05 -To get a better job or promotion (Job related)" },
  { value: "06", label: "06 -It was a requirement of my job (Job related)" },
  { value: "07", label: "07 -I wanted extra skills for my job (Job related)" },
  {
    value: "08",
    label: "08 -To get into another course of study (Further study)",
  },
  { value: "11", label: "11 -Other reasons (Other)" },
  {
    value: "12",
    label: "12 -For personal interest or self-development (Other)",
  },
  { value: "@@", label: "@@ -Not specified" },
];

const parseWeeksFromDurationText = (durationText?: string) => {
  if (!durationText) return null;
  const parts = durationText.trim().split(/\s+/);
  const weeksRaw = parts[0];
  const unitRaw = parts[1]?.toLowerCase();
  if (!weeksRaw) return null;
  if (unitRaw && unitRaw !== "week" && unitRaw !== "weeks") return null;
  const weeks = Number.parseInt(weeksRaw, 10);
  if (!Number.isFinite(weeks) || weeks <= 0) return null;
  return weeks;
};

const parseStartDateToUtcDate = (input: string) => {
  const value = input.trim();

  // Supports: 25/03/2024 (DD/MM/YYYY)
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (![year, month, day].every(Number.isFinite)) return null;
    return new Date(Date.UTC(year, month - 1, day));
  }

  // Supports: 2024-03-25 (YYYY-MM-DD)
  const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (![year, month, day].every(Number.isFinite)) return null;
    return new Date(Date.UTC(year, month - 1, day));
  }

  return null;
};

const formatDateLikeInput = (original: string, date: Date) => {
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");

  if (original.includes("/")) return `${dd}/${mm}/${yyyy}`;
  return `${yyyy}-${mm}-${dd}`;
};

const addWeeksToDateString = (startDateRaw: string, weeks: number) => {
  const startDate = parseStartDateToUtcDate(startDateRaw);
  if (!startDate) return null;

  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + weeks * 7);
  return formatDateLikeInput(startDateRaw, endDate);
};

const normalizeYesNo = (value: unknown) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value !== "string") return value;
  const lower = value.trim().toLowerCase();
  if (lower === "yes" || lower === "y" || lower === "true") return "Yes";
  if (lower === "no" || lower === "n" || lower === "false") return "No";
  return value;
};

const normalizeYesNoNa = (value: unknown) => {
  const normalized = normalizeYesNo(value);
  if (normalized !== value) return normalized;
  if (typeof value !== "string") return value;
  const lower = value.trim().toLowerCase();
  if (lower === "na" || lower === "n/a") return "N/A";
  return value;
};

const EnrollmentForm = ({ applicationId }: { applicationId?: string }) => {
  const { goToNext, markStepCompleted, clearStepDirty } =
    useApplicationStepStore();
  const { setApplicationId, _hasHydrated } = useApplicationFormDataStore();

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

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const methods = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      ...defaultEnrollmentFormValues,
      offer_issued_date: todayIso,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasRestoredRef = useRef(false);

  const { saveOnSubmit } = useFormPersistence({
    applicationId: applicationId ?? "draft",
    stepId: 0,
    form: methods,
    enabled: true,
    onDataLoaded: (data) => {
      if (hasRestoredRef.current) return;

      const saved = data as unknown as {
        courseId?: number;
        intakeId?: number;
        campusId?: number;
        course?: number;
        intake?: number;
        campus?: number;
      };

      const legacyCourse = saved.courseId ?? saved.course;
      const legacyIntake = saved.intakeId ?? saved.intake;
      const legacyCampus = saved.campusId ?? saved.campus;

      if (legacyCourse && !methods.getValues("course")) {
        methods.setValue("course", legacyCourse, { shouldDirty: false });
      }
      if (legacyIntake && !methods.getValues("intake")) {
        methods.setValue("intake", legacyIntake, { shouldDirty: false });
      }
      if (legacyCampus && !methods.getValues("campus")) {
        methods.setValue("campus", legacyCampus, { shouldDirty: false });
      }

      const adv = normalizeYesNo(
        (saved as Record<string, unknown>).advanced_standing_credit,
      );
      if ((adv === "Yes" || adv === "No") && methods.getValues("advanced_standing_credit") !== adv) {
        methods.setValue("advanced_standing_credit", adv, { shouldDirty: false });
      }

      const includeMat = normalizeYesNo(
        (saved as Record<string, unknown>).include_material_fee_in_initial_payment,
      );
      if ((includeMat === "Yes" || includeMat === "No") && methods.getValues("include_material_fee_in_initial_payment") !== includeMat) {
        methods.setValue("include_material_fee_in_initial_payment", includeMat, { shouldDirty: false });
      }

      const scholarship = normalizeYesNo(
        (saved as Record<string, unknown>).receiving_scholarship_bursary,
      );
      if ((scholarship === "Yes" || scholarship === "No") && methods.getValues("receiving_scholarship_bursary") !== scholarship) {
        methods.setValue("receiving_scholarship_bursary", scholarship, { shouldDirty: false });
      }

      const wil = normalizeYesNoNa(
        (saved as Record<string, unknown>).wil_requirements,
      );
      if ((wil === "Yes" || wil === "No" || wil === "N/A") && methods.getValues("wil_requirements") !== wil) {
        methods.setValue("wil_requirements", wil, { shouldDirty: false });
      }

      const thirdParty = normalizeYesNoNa(
        (saved as Record<string, unknown>).third_party_providers_application_request,
      );
      if ((thirdParty === "Yes" || thirdParty === "No" || thirdParty === "N/A") && methods.getValues("third_party_providers_application_request") !== thirdParty) {
        methods.setValue("third_party_providers_application_request", thirdParty, { shouldDirty: false });
      }

      hasRestoredRef.current = true;
    },
  });

  const { watch, setValue, resetField, clearErrors } = methods;
  const courseValue = watch("course");
  const intakeValue = watch("intake");
  const campusValue = watch("campus");
  const advancedStandingValue = watch("advanced_standing_credit");

  /* ---------- deterministic updates ---------- */
  const handleFieldChange = (
    field: "course" | "intake" | "campus",
    value: string,
  ) => {
    if (field === "course") {
      setValue("course", Number(value), { shouldDirty: true });
      resetField("intake", { defaultValue: undefined });
      resetField("campus", { defaultValue: undefined });
      clearErrors(["course", "intake", "campus"]);
      return;
    }

    if (field === "intake") {
      setValue("intake", Number(value), { shouldDirty: true });
      resetField("campus", { defaultValue: undefined });
      clearErrors(["intake", "campus"]);
      return;
    }

    setValue("campus", Number(value), { shouldDirty: true });
    clearErrors("campus");
  };

  /* ---------- derived entities ---------- */
  const selectedCourse = courses.find((c) => c.id === courseValue);

  const selectedIntake = useMemo(
    () => selectedCourse?.intakes?.find((i) => i.id === intakeValue),
    [selectedCourse, intakeValue],
  );

  const selectedCampus = useMemo(
    () => selectedIntake?.campuses?.find((c) => c.id === campusValue),
    [selectedIntake, campusValue],
  );

  const availableIntakes: Intake[] = selectedCourse?.intakes ?? [];
  const availableCampuses: Campus[] = selectedIntake?.campuses ?? [];

  const intakeEndDate = useMemo(() => {
    if (!selectedIntake?.intake_start) return null;
    const weeks = parseWeeksFromDurationText(selectedCourse?.duration_text);
    if (!weeks) return null;
    return addWeeksToDateString(selectedIntake.intake_start, weeks);
  }, [selectedCourse?.duration_text, selectedIntake?.intake_start]);

  useEffect(() => {
    if (advancedStandingValue !== "Yes") {
      setValue("credit_subject_count", undefined, { shouldDirty: true });
      clearErrors("credit_subject_count");
    }
  }, [advancedStandingValue, clearErrors, setValue]);

  /* ---------- save flow ---------- */
  const onSubmit = async (values: EnrollmentFormValues) => {
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
          course: Number(values.course),
          course_name: selectedCourse?.course_name ?? "",
          intake: Number(values.intake),
          intake_name: selectedIntake?.intake_name ?? "",
          campus: Number(values.campus),
          campus_name: selectedCampus?.name ?? "",

          advanced_standing_credit: values.advanced_standing_credit,
          credit_subject_count:
            values.advanced_standing_credit === "Yes"
              ? values.credit_subject_count
              : undefined,

          offer_issued_date: values.offer_issued_date,
          study_reason: values.study_reason,
          course_actual_fee: values.course_actual_fee as number,
          course_upfront_fee: values.course_upfront_fee as number,
          enrollment_fee: values.enrollment_fee as number,
          material_fee: values.material_fee as number,
          include_material_fee_in_initial_payment:
            values.include_material_fee_in_initial_payment,
          receiving_scholarship_bursary: values.receiving_scholarship_bursary,
          wil_requirements: values.wil_requirements,
          third_party_providers_application_request:
            values.third_party_providers_application_request,
          application_request: values.application_request?.trim() || undefined,
        },
      });

      saveOnSubmit(values);

      toast.success("Enrollment saved", { id: "application-flow" });
      methods.reset(methods.getValues());
      clearStepDirty(0);
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
    <FormProvider {...methods}>
      <form className="space-y-4" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-8 p-4 border rounded-lg">
          <div className="grid-cols-3 grid gap-4">
            {/* Course */}
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
                  Duration: {selectedCourse?.duration_text}
                </p>
              )}
              {methods.formState.errors.course?.message && (
                <p className="text-sm text-red-500">
                  {methods.formState.errors.course.message as string}
                </p>
              )}
            </div>

            {/* Intake */}
            <div className="space-y-2">
              <Label>Intake *</Label>
              <Controller
                name="intake"
                control={methods.control}
                render={({ field: { value } }) => (
                  <Select
                    value={value ? String(value) : ""}
                    onValueChange={(v) => handleFieldChange("intake", v)}
                    disabled={!courseValue}
                  >
                    <SelectTrigger
                      aria-invalid={!!methods.formState.errors.intake}
                    >
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

            {/* Campus */}
            <div className="space-y-2">
              <Label>Campus *</Label>
              <Controller
                name="campus"
                control={methods.control}
                render={({ field: { value } }) => (
                  <Select
                    value={value ? String(value) : ""}
                    onValueChange={(v) => handleFieldChange("campus", v)}
                    disabled={!intakeValue}
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
          </div>

          <div className="pt-2 space-y-6">
            <div className="space-y-2">
              <Label>Are you applying for advanced standing/ credit? *</Label>
              <FormRadio
                name="advanced_standing_credit"
                label=""
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />
            </div>

            {advancedStandingValue === "Yes" && (
              <div className="space-y-2 max-w-sm">
                <Label>How many subject are you calming for credit? *</Label>
                <Controller
                  name="credit_subject_count"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={typeof value === "number" ? String(value) : ""}
                      onValueChange={(v) => onChange(Number(v))}
                    >
                      <SelectTrigger
                        aria-invalid={
                          !!methods.formState.errors.credit_subject_count
                        }
                      >
                        <SelectValue placeholder="Select (1-12)" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (count) => (
                            <SelectItem key={count} value={String(count)}>
                              {count}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {methods.formState.errors.credit_subject_count?.message && (
                  <p className="text-sm text-red-500">
                    {
                      methods.formState.errors.credit_subject_count
                        .message as string
                    }
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="offer_issued_date"
                label="Offer Issued Date *"
                type="date"
              />

              <FormSelect
                name="study_reason"
                label="Study Reason *"
                options={STUDY_REASON_OPTIONS}
              />

              <FormInput
                name="course_actual_fee"
                label="Course Actual Fee *"
                type="number"
              />
              <FormInput
                name="course_upfront_fee"
                label="Course Upfront Fee *"
                type="number"
              />
              <FormInput
                name="enrollment_fee"
                label="Enrollment Fee *"
                type="number"
              />
              <FormInput
                name="material_fee"
                label="Material Fee *"
                type="number"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Include material fee in initial payment? *</Label>
              <FormRadio
                name="include_material_fee_in_initial_payment"
                label=""
                options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
              />
              </div>

              <div className="space-y-2">
                <Label>Are you receiving any scholarship/bursary ? *</Label>
              <FormRadio
                name="receiving_scholarship_bursary"
                label=""
                options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
              />
              </div>

              <div className="space-y-2">
                <Label>Work Integrated Learning (WIL) Requirements *</Label>
              <FormRadio
                name="wil_requirements"
                label=""
                options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                    { value: "N/A", label: "N/A" },
                  ]}
              />
              </div>

              <div className="space-y-2">
                <Label>
                  Third-Party Providers engaged by college to deliver / support
                  the course Application Request *
                </Label>
              <FormRadio
                name="third_party_providers_application_request"
                label=""
                options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                    { value: "N/A", label: "N/A" },
                  ]}
              />
              </div>

              <FormTextarea
                name="application_request"
                label="Application Request"
                placeholder="Enter request (optional)"
              />
            </div>
          </div>
        </div>

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
      </form>
    </FormProvider>
  );
};

export default EnrollmentForm;
