/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormPersistence } from "@/features/application-form/hooks/use-form-persistence.hook";
import type { EnrollmentValues } from "@/features/application-form/utils/validations/enrollment";
import { Campus, Intake } from "@/service/course.service";
import { USER_ROLE } from "@/shared/constants/types";
import {
  DEFAULT_CREATE_PAYLOAD_temp,
  useApplicationCreateMutation,
} from "@/shared/hooks/use-applications";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import {
  useCoursesQuery,
  useSaveEnrollmentMutation,
} from "../../hooks/course.hook";
import { useApplicationStepQuery } from "../../hooks/use-application-steps.hook";
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

const toApiYesNo = (value: "Yes" | "No") => (value === "Yes" ? "yes" : "no");
const toApiYesNoNa = (value: "Yes" | "No" | "N/A") =>
  value === "N/A" ? "na" : toApiYesNo(value);

const coerceYesNo = (value: unknown) => {
  const normalized = normalizeYesNo(value);
  return normalized === "Yes" || normalized === "No" ? normalized : null;
};

const coerceYesNoNa = (value: unknown) => {
  const normalized = normalizeYesNoNa(value);
  return normalized === "Yes" || normalized === "No" || normalized === "N/A"
    ? normalized
    : null;
};

const coerceClassType = (value: unknown) =>
  value === "classroom" || value === "hybrid" || value === "online"
    ? value
    : null;

const yesNoSchema = z.enum(["Yes", "No"], {
  message: "Please select Yes or No",
});
const yesNoNaSchema = z.enum(["Yes", "No", "N/A"], {
  message: "Please select Yes, No, or N/A",
});
const classTypeSchema = z.enum(["classroom", "hybrid", "online"]);

const requiredSelectId = (message: string) =>
  z
    .number()
    .int()
    .min(1, message)
    .optional()
    .refine((value) => value !== undefined, message);

const requiredNonNegativeNumber = (message: string) =>
  z
    .number()
    .min(0, "Must be 0 or more")
    .optional()
    .refine((value) => value !== undefined, message);

const staffEnrollmentFormSchema = z
  .object({
    course: requiredSelectId("Please select a course"),
    intake: requiredSelectId("Please select an intake"),
    campus: requiredSelectId("Please select a campus"),

    preferred_start_date: z.string().min(1, "Preferred start date is required"),
    advanced_standing_credit: yesNoSchema,
    number_of_subjects: z
      .number()
      .int()
      .min(1, "Please select number of subjects")
      .max(12, "Please select number of subjects")
      .optional(),
    no_of_weeks: z.number().int().min(1, "Number of weeks is required"),
    course_end_date: z.string().min(1, "Course end date is required"),

    offer_issued_date: z.string().min(1, "Offer issued date is required"),

    study_reason: z.enum(
      ["01", "02", "03", "04", "05", "06", "07", "08", "11", "12", "@@"],
      { message: "Please select a study reason" },
    ),

    course_actual_fee: requiredNonNegativeNumber(
      "Course actual fee is required",
    ),
    course_upfront_fee: requiredNonNegativeNumber(
      "Course upfront fee is required",
    ),
    enrollment_fee: requiredNonNegativeNumber("Enrollment fee is required"),
    material_fee: requiredNonNegativeNumber("Material fee is required"),

    inclue_material_fee_in_initial_payment: yesNoSchema,
    receiving_scholarship: yesNoSchema,
    scholarship_percentage: z.number().min(0).max(100).optional(),
    work_integrated_learning: yesNoNaSchema,
    third_party_provider: yesNoNaSchema,
    class_type: classTypeSchema,

    application_request: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.advanced_standing_credit === "Yes" && !data.number_of_subjects) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select number of subjects",
        path: ["number_of_subjects"],
      });
    }

    if (
      data.receiving_scholarship === "Yes" &&
      data.scholarship_percentage == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scholarship percentage is required",
        path: ["scholarship_percentage"],
      });
    }
  });

const agentEnrollmentFormSchema = z
  .object({
    course: requiredSelectId("Please select a course"),
    intake: requiredSelectId("Please select an intake"),
    campus: requiredSelectId("Please select a campus"),
    advanced_standing_credit: yesNoSchema,
    number_of_subjects: z
      .number()
      .int()
      .min(1, "Please select number of subjects")
      .max(12, "Please select number of subjects")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.advanced_standing_credit === "Yes" && !data.number_of_subjects) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select number of subjects",
        path: ["number_of_subjects"],
      });
    }
  });

type StaffEnrollmentFormValues = z.infer<typeof staffEnrollmentFormSchema>;
type AgentEnrollmentFormValues = z.infer<typeof agentEnrollmentFormSchema>;
type EnrollmentFormValues =
  | StaffEnrollmentFormValues
  | AgentEnrollmentFormValues;

const staffDefaultValues: Omit<StaffEnrollmentFormValues, "offer_issued_date"> =
  {
    course: undefined,
    intake: undefined,
    campus: undefined,
    preferred_start_date: "",
    advanced_standing_credit: "No",
    number_of_subjects: undefined,
    no_of_weeks: undefined as unknown as number,
    course_end_date: "",
    study_reason: "@@",
    course_actual_fee: undefined,
    course_upfront_fee: undefined,
    enrollment_fee: undefined,
    material_fee: undefined,
    inclue_material_fee_in_initial_payment: "No",
    receiving_scholarship: "No",
    scholarship_percentage: undefined,
    work_integrated_learning: "No",
    third_party_provider: "No",
    class_type: "classroom",
    application_request: "",
  };

const EnrollmentFormInner = ({
  applicationId,
  isAgent,
}: {
  applicationId?: string;
  isAgent: boolean;
}) => {
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
    resolver: zodResolver(
      isAgent ? agentEnrollmentFormSchema : staffEnrollmentFormSchema,
    ),
    defaultValues: isAgent
      ? {
          course: undefined,
          intake: undefined,
          campus: undefined,
          advanced_standing_credit: "No",
          number_of_subjects: undefined,
        }
      : {
          ...staffDefaultValues,
          offer_issued_date: todayIso,
        },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasRestoredRef = useRef(false);

  useApplicationStepQuery(applicationId ?? null, 0);

  const { saveOnSubmit } = useFormPersistence({
    applicationId: applicationId ?? "draft",
    stepId: 0,
    form: methods,
    enabled: true,
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

      const coerceId = (value?: number | string) => {
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim().length > 0) {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) return parsed;
        }
        return undefined;
      };

      const legacyCourse = coerceId(saved.courseId ?? saved.course_id ?? saved.course);
      const legacyIntake = coerceId(saved.intakeId ?? saved.intake_id ?? saved.intake);
      const legacyCampus = coerceId(saved.campusId ?? saved.campus_id ?? saved.campus);

      const currentCourse = coerceId(
        methods.getValues("course") as unknown as number | string | undefined,
      );
      const currentIntake = coerceId(
        methods.getValues("intake") as unknown as number | string | undefined,
      );
      const currentCampus = coerceId(
        methods.getValues("campus") as unknown as number | string | undefined,
      );

      if (legacyCourse && currentCourse !== legacyCourse) {
        methods.setValue("course", legacyCourse, { shouldDirty: false });
      }
      if (legacyIntake && currentIntake !== legacyIntake) {
        methods.setValue("intake", legacyIntake, { shouldDirty: false });
      }
      if (legacyCampus && currentCampus !== legacyCampus) {
        methods.setValue("campus", legacyCampus, { shouldDirty: false });
      }

      const adv = normalizeYesNo(
        (saved as Record<string, unknown>).advanced_standing_credit,
      );
      if (
        (adv === "Yes" || adv === "No") &&
        methods.getValues("advanced_standing_credit") !== adv
      ) {
        methods.setValue("advanced_standing_credit", adv, {
          shouldDirty: false,
        });
      }

      const preferredStart =
        (saved as Record<string, unknown>).preferred_start_date ??
        (saved as Record<string, unknown>).intake_start;
      if (
        typeof preferredStart === "string" &&
        preferredStart.length > 0 &&
        methods.getValues("preferred_start_date") !== preferredStart
      ) {
        methods.setValue("preferred_start_date", preferredStart, {
          shouldDirty: false,
        });
      }

      const subjectCount =
        (saved as Record<string, unknown>).number_of_subjects ??
        (saved as Record<string, unknown>).credit_subject_count;
      if (typeof subjectCount === "number" && Number.isFinite(subjectCount)) {
        methods.setValue("number_of_subjects", subjectCount, {
          shouldDirty: false,
        });
      }

      const noOfWeeks = (saved as Record<string, unknown>).no_of_weeks;
      if (typeof noOfWeeks === "number" && Number.isFinite(noOfWeeks)) {
        methods.setValue("no_of_weeks", noOfWeeks, { shouldDirty: false });
      }

      const courseEnd = (saved as Record<string, unknown>).course_end_date;
      if (typeof courseEnd === "string" && courseEnd.length > 0) {
        methods.setValue("course_end_date", courseEnd, { shouldDirty: false });
      }

      const includeMatValue = coerceYesNo(
        (saved as Record<string, unknown>)
          .inclue_material_fee_in_initial_payment ??
          (saved as Record<string, unknown>)
            .include_material_fee_in_initial_payment,
      );
      if (
        includeMatValue &&
        methods.getValues("inclue_material_fee_in_initial_payment") !==
          includeMatValue
      ) {
        methods.setValue(
          "inclue_material_fee_in_initial_payment",
          includeMatValue,
          {
            shouldDirty: false,
          },
        );
      }

      const scholarshipValue = coerceYesNo(
        (saved as Record<string, unknown>).receiving_scholarship ??
          (saved as Record<string, unknown>).receiving_scholarship_bursary,
      );
      if (
        scholarshipValue &&
        methods.getValues("receiving_scholarship") !== scholarshipValue
      ) {
        methods.setValue("receiving_scholarship", scholarshipValue, {
          shouldDirty: false,
        });
      }

      const scholarshipPercentage = (saved as Record<string, unknown>)
        .scholarship_percentage;
      if (
        typeof scholarshipPercentage === "number" &&
        Number.isFinite(scholarshipPercentage)
      ) {
        methods.setValue("scholarship_percentage", scholarshipPercentage, {
          shouldDirty: false,
        });
      }

      const wilValue = coerceYesNoNa(
        (saved as Record<string, unknown>).work_integrated_learning ??
          (saved as Record<string, unknown>).wil_requirements,
      );
      if (
        wilValue &&
        methods.getValues("work_integrated_learning") !== wilValue
      ) {
        methods.setValue("work_integrated_learning", wilValue, {
          shouldDirty: false,
        });
      }

      const thirdPartyValue = coerceYesNoNa(
        (saved as Record<string, unknown>).third_party_provider ??
          (saved as Record<string, unknown>)
            .third_party_providers_application_request,
      );
      if (
        thirdPartyValue &&
        methods.getValues("third_party_provider") !== thirdPartyValue
      ) {
        methods.setValue("third_party_provider", thirdPartyValue, {
          shouldDirty: false,
        });
      }

      const classType = coerceClassType(
        (saved as Record<string, unknown>).class_type,
      );
      if (classType && methods.getValues("class_type") !== classType) {
        methods.setValue("class_type", classType, { shouldDirty: false });
      }

      hasRestoredRef.current = true;
    },
  });

  const { watch, setValue, resetField, clearErrors } = methods;
  const courseValue = watch("course");
  const intakeValue = watch("intake");
  const campusValue = watch("campus");
  const advancedStandingValue = watch("advanced_standing_credit");
  const receivingScholarshipValue = watch("receiving_scholarship");

  /* ---------- deterministic updates ---------- */
  const handleFieldChange = (
    field: "course" | "intake" | "campus",
    value: string,
  ) => {
    const coerceId = (val: unknown) => {
      if (typeof val === "number" && Number.isFinite(val)) return val;
      if (typeof val === "string" && val.trim().length > 0) {
        const parsed = Number(val);
        if (Number.isFinite(parsed)) return parsed;
      }
      return undefined;
    };

    const nextId = coerceId(value);
    if (!nextId || nextId <= 0) return;

    const currentCourse = coerceId(methods.getValues("course"));
    const currentIntake = coerceId(methods.getValues("intake"));
    const currentCampus = coerceId(methods.getValues("campus"));

    if (field === "course") {
      setValue("course", nextId, { shouldDirty: true });

      const nextCourse = courses.find((c) => c.id === nextId);
      const intakeStillValid = !!(
        nextCourse &&
        currentIntake &&
        nextCourse.intakes?.some((i) => i.id === currentIntake)
      );

      if (!intakeStillValid) {
        resetField("intake", { defaultValue: undefined });
        resetField("campus", { defaultValue: undefined });
      } else {
        const nextIntake = nextCourse?.intakes?.find(
          (i) => i.id === currentIntake,
        );
        const campusStillValid = !!(
          nextIntake &&
          currentCampus &&
          nextIntake.campuses?.some((c) => c.id === currentCampus)
        );
        if (!campusStillValid) {
          resetField("campus", { defaultValue: undefined });
        }
      }

      clearErrors(["course", "intake", "campus"]);
      return;
    }

    if (field === "intake") {
      if (!currentCourse) return;

      setValue("intake", nextId, { shouldDirty: true });

      const currentCourseEntity = courses.find((c) => c.id === currentCourse);
      const nextIntake = currentCourseEntity?.intakes?.find(
        (i) => i.id === nextId,
      );
      const campusStillValid = !!(
        nextIntake &&
        currentCampus &&
        nextIntake.campuses?.some((c) => c.id === currentCampus)
      );
      if (!campusStillValid) {
        resetField("campus", { defaultValue: undefined });
      }

      clearErrors(["intake", "campus"]);
      return;
    }

    if (!currentIntake) return;

    setValue("campus", nextId, { shouldDirty: true });
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
      setValue("number_of_subjects", undefined, { shouldDirty: true });
      clearErrors("number_of_subjects");
    }
  }, [advancedStandingValue, clearErrors, setValue]);

  useEffect(() => {
    const startDate = selectedIntake?.intake_start ?? "";
    if (startDate) {
      setValue("preferred_start_date", startDate, { shouldDirty: true });
    }

    const weeks =
      parseWeeksFromDurationText(selectedCourse?.duration_text) ?? undefined;
    if (weeks) {
      setValue("no_of_weeks", weeks, { shouldDirty: true });
    }

    if (intakeEndDate) {
      setValue("course_end_date", intakeEndDate, { shouldDirty: true });
    }
  }, [
    intakeEndDate,
    selectedCourse?.duration_text,
    selectedIntake?.intake_start,
    setValue,
  ]);

  useEffect(() => {
    if (receivingScholarshipValue !== "Yes") {
      setValue("scholarship_percentage", undefined, { shouldDirty: true });
      clearErrors("scholarship_percentage");
    }
  }, [clearErrors, receivingScholarshipValue, setValue]);

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

      const commonPayload = {
        course: Number(values.course),
        course_name: selectedCourse?.course_name ?? "",
        intake: Number(values.intake),
        intake_name: selectedIntake?.intake_name ?? "",
        campus: Number(values.campus),
        campus_name: selectedCampus?.name ?? "",
        advanced_standing_credit: toApiYesNo(values.advanced_standing_credit),
        number_of_subjects:
          values.advanced_standing_credit === "Yes"
            ? values.number_of_subjects
            : undefined,
      };

      const staffValues = values as StaffEnrollmentFormValues;

      const payload: EnrollmentValues = isAgent
        ? (commonPayload as EnrollmentValues)
        : ({
            ...commonPayload,
            preferred_start_date: staffValues.preferred_start_date,
            no_of_weeks: staffValues.no_of_weeks,
            course_end_date: staffValues.course_end_date,
            offer_issued_date: staffValues.offer_issued_date,
            study_reason: staffValues.study_reason,
            course_actual_fee: staffValues.course_actual_fee as number,
            course_upfront_fee: staffValues.course_upfront_fee as number,
            enrollment_fee: staffValues.enrollment_fee as number,
            material_fee: staffValues.material_fee as number,
            inclue_material_fee_in_initial_payment: toApiYesNo(
              staffValues.inclue_material_fee_in_initial_payment,
            ),
            receiving_scholarship: toApiYesNo(
              staffValues.receiving_scholarship,
            ),
            scholarship_percentage:
              staffValues.receiving_scholarship === "Yes"
                ? staffValues.scholarship_percentage
                : undefined,
            work_integrated_learning: toApiYesNoNa(
              staffValues.work_integrated_learning,
            ),
            third_party_provider: toApiYesNoNa(
              staffValues.third_party_provider,
            ),
            class_type: staffValues.class_type,
            application_request:
              staffValues.application_request?.trim() || undefined,
          } as EnrollmentValues);

      await saveEnrollment({
        applicationId: currentApplicationId!,
        values: payload,
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
                  name="number_of_subjects"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={typeof value === "number" ? String(value) : ""}
                      onValueChange={(v) => onChange(Number(v))}
                    >
                      <SelectTrigger
                        aria-invalid={
                          !!methods.formState.errors.number_of_subjects
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
                {methods.formState.errors.number_of_subjects?.message && (
                  <p className="text-sm text-red-500">
                    {
                      methods.formState.errors.number_of_subjects
                        .message as string
                    }
                  </p>
                )}
              </div>
            )}

            {!isAgent && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    name="preferred_start_date"
                    label="Preferred Start Date *"
                    disabled={true}
                  />
                  <FormInput
                    name="no_of_weeks"
                    label="No. of Weeks *"
                    type="number"
                    disabled={true}
                  />
                  <FormInput
                    name="course_end_date"
                    label="Course End Date *"
                    disabled={true}
                  />

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
                      name="inclue_material_fee_in_initial_payment"
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
                      name="receiving_scholarship"
                      label=""
                      options={[
                        { value: "Yes", label: "Yes" },
                        { value: "No", label: "No" },
                      ]}
                    />
                  </div>

                  {receivingScholarshipValue === "Yes" && (
                    <FormInput
                      name="scholarship_percentage"
                      label="Scholarship Percentage *"
                      type="number"
                    />
                  )}

                  <div className="space-y-2">
                    <Label>Work Integrated Learning (WIL) Requirements *</Label>
                    <FormRadio
                      name="work_integrated_learning"
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
                      Third-Party Providers engaged by college to deliver /
                      support the course Application Request *
                    </Label>
                    <FormRadio
                      name="third_party_provider"
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

                  <div className="md:grid md:grid-cols-2">
                    <FormSelect
                      name="class_type"
                      label="Class Type *"
                      options={[
                        { value: "classroom", label: "Classroom" },
                        { value: "hybrid", label: "Hybrid" },
                        { value: "online", label: "Online" },
                      ]}
                    />
                  </div>
                </div>
              </>
            )}
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

const EnrollmentForm = ({ applicationId }: { applicationId?: string }) => {
  const { data: session, status } = useSession();
  const isAgent = session?.user?.role === USER_ROLE.AGENT;

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <EnrollmentFormInner applicationId={applicationId} isAgent={isAgent} />
  );
};

export default EnrollmentForm;
