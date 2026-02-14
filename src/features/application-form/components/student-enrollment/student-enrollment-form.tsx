"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormRadio } from "@/components/forms/form-radio";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EnrollmentValues } from "@/features/application-form/validations/enrollment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { STUDY_REASON_OPTIONS } from "../../constants/enrollment-constants";
import {
  addWeeksToYmdDateString,
  normalizeDateStringToYmd,
  parseWeeksFromDurationText,
} from "../../constants/enrollment-date-utils";
import {
  useCourseIntakesQuery,
  useCoursesQuery,
  useEnrollmentStepQuery,
  useSaveEnrollmentMutation,
} from "../../hooks/course.hook";
import {
  studentEnrollmentFormSchema,
  type StudentEnrollmentFormValues,
} from "../../utils/student-enrollment-form.validation";
import Link from "next/link";
import { siteRoutes } from "@/shared/constants/site-routes";

const defaultValues: StudentEnrollmentFormValues = {
  preferred_start_date: "",
  advanced_standing_credit: "No",
  number_of_subjects: undefined,
  no_of_weeks: 1,
  course_end_date: "",
  offer_issued_date: "",
  study_reason: "",
  course_actual_fee: 0,
  course_upfront_fee: 0,
  enrollment_fee: 0,
  material_fee: 0,
  inclue_material_fee_in_initial_payment: "No",
  receiving_scholarship: "No",
  scholarship_percentage: undefined,
  work_integrated_learning: "No",
  third_party_provider: "No",
  class_type: "classroom",
  application_request: "",
};

const todayYmd = () => {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

type StudentEnrollmentFormProps = {
  isDialogMode?: boolean;
  applicationId?: string;
  onSubmitSuccess?: () => void;
};

const StudentEnrollmentForm = ({
  isDialogMode = false,
  applicationId,
  onSubmitSuccess,
}: StudentEnrollmentFormProps) => {
  const hasPrefilledRef = useRef(false);
  const hasAutoFilledDatesRef = useRef(false);
  const queryClient = useQueryClient();

  const methods = useForm<StudentEnrollmentFormValues>({
    resolver: zodResolver(studentEnrollmentFormSchema),
    defaultValues: {
      ...defaultValues,
      offer_issued_date: todayYmd(),
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { mutateAsync: saveEnrollment, isPending: isSavingEnrollment } =
    useSaveEnrollmentMutation();
  const { data: enrollmentStepResponse, isLoading: isLoadingEnrollmentStep } =
    useEnrollmentStepQuery(applicationId ?? null);

  const advancedStandingValue = useWatch({
    control: methods.control,
    name: "advanced_standing_credit",
  });
  const receivingScholarshipValue = useWatch({
    control: methods.control,
    name: "receiving_scholarship",
  });

  const enrollmentPayload = useMemo(() => {
    const raw = enrollmentStepResponse?.data?.data;
    if (!raw) return null;

    if (Array.isArray(raw)) {
      return raw[0] as Record<string, unknown> | undefined;
    }

    if (typeof raw !== "object" || raw === null) return null;

    const maybeData = (raw as { data?: unknown }).data;
    if (Array.isArray(maybeData)) {
      return maybeData[0] as Record<string, unknown> | undefined;
    }

    const maybeEnrollments = (raw as { enrollments?: unknown }).enrollments;
    if (Array.isArray(maybeEnrollments)) {
      return maybeEnrollments[0] as Record<string, unknown> | undefined;
    }

    return raw as Record<string, unknown>;
  }, [enrollmentStepResponse]);

  const enrollmentCore = useMemo(() => {
    if (!enrollmentPayload) return null;

    const coerceNumber = (value: unknown) => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return undefined;
    };

    const course = coerceNumber(enrollmentPayload.course);
    const intake = coerceNumber(enrollmentPayload.intake);
    const campus = coerceNumber(enrollmentPayload.campus);

    if (!course || !intake || !campus) return null;

    return {
      course,
      course_name: String(enrollmentPayload.course_name ?? ""),
      intake,
      intake_name: String(enrollmentPayload.intake_name ?? ""),
      campus,
      campus_name: String(enrollmentPayload.campus_name ?? ""),
    };
  }, [enrollmentPayload]);

  const { data: coursesResponse, isLoading: isLoadingCourses } =
    useCoursesQuery(
      enrollmentCore
        ? {
            campus: enrollmentCore.campus,
            include_expired_intakes: true,
            type: 17,
          }
        : undefined,
      { enabled: !!enrollmentCore },
    );
  const courses = coursesResponse?.data ?? [];
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === enrollmentCore?.course),
    [courses, enrollmentCore?.course],
  );

  const { data: intakesResponse, isLoading: isLoadingIntakes } =
    useCourseIntakesQuery(selectedCourse?.course_code, {
      campus: enrollmentCore?.campus ?? null,
      includeExpiredIntakes: 1,
    });
  const intakes = intakesResponse?.data ?? [];
  const selectedIntake = useMemo(
    () => intakes.find((intake) => intake.id === enrollmentCore?.intake),
    [intakes, enrollmentCore?.intake],
  );
  const isFetchingEnrollmentData =
    isLoadingEnrollmentStep ||
    (!!enrollmentCore && (isLoadingCourses || isLoadingIntakes));

  useEffect(() => {
    if (hasPrefilledRef.current || !enrollmentPayload) return;

    const coerceNumber = (value: unknown) => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return undefined;
    };

    const readYesNo = (value: unknown): "Yes" | "No" => {
      const normalized = String(value ?? "")
        .trim()
        .toLowerCase();
      return normalized === "yes" ? "Yes" : "No";
    };

    const readYesNoNa = (value: unknown): "Yes" | "No" | "N/A" => {
      const normalized = String(value ?? "")
        .trim()
        .toLowerCase();
      if (normalized === "yes") return "Yes";
      if (normalized === "na" || normalized === "n/a") return "N/A";
      return "No";
    };

    const classType = String(
      enrollmentPayload.class_type ?? defaultValues.class_type,
    ).toLowerCase();

    methods.reset({
      preferred_start_date: String(
        enrollmentPayload.preferred_start_date ??
          defaultValues.preferred_start_date,
      ),
      advanced_standing_credit: readYesNo(
        enrollmentPayload.advanced_standing_credit ??
          defaultValues.advanced_standing_credit,
      ),
      number_of_subjects: coerceNumber(enrollmentPayload.number_of_subjects),
      no_of_weeks:
        coerceNumber(enrollmentPayload.no_of_weeks) ??
        defaultValues.no_of_weeks,
      course_end_date: String(
        enrollmentPayload.course_end_date ?? defaultValues.course_end_date,
      ),
      offer_issued_date: String(
        enrollmentPayload.offer_issued_date ||
          defaultValues.offer_issued_date ||
          todayYmd(),
      ),
      study_reason: String(
        enrollmentPayload.study_reason ?? defaultValues.study_reason,
      ),
      course_actual_fee:
        coerceNumber(enrollmentPayload.course_actual_fee) ??
        defaultValues.course_actual_fee,
      course_upfront_fee:
        coerceNumber(enrollmentPayload.course_upfront_fee) ??
        defaultValues.course_upfront_fee,
      enrollment_fee:
        coerceNumber(enrollmentPayload.enrollment_fee) ??
        defaultValues.enrollment_fee,
      material_fee:
        coerceNumber(enrollmentPayload.material_fee) ??
        defaultValues.material_fee,
      inclue_material_fee_in_initial_payment: readYesNo(
        enrollmentPayload.inclue_material_fee_in_initial_payment ??
          defaultValues.inclue_material_fee_in_initial_payment,
      ),
      receiving_scholarship: readYesNo(
        enrollmentPayload.receiving_scholarship ??
          defaultValues.receiving_scholarship,
      ),
      scholarship_percentage: coerceNumber(
        enrollmentPayload.scholarship_percentage,
      ),
      work_integrated_learning: readYesNoNa(
        enrollmentPayload.work_integrated_learning ??
          defaultValues.work_integrated_learning,
      ),
      third_party_provider: readYesNoNa(
        enrollmentPayload.third_party_provider ??
          defaultValues.third_party_provider,
      ),
      class_type:
        classType === "hybrid" || classType === "online"
          ? classType
          : "classroom",
      application_request: String(enrollmentPayload.application_request ?? ""),
    });

    hasPrefilledRef.current = true;
  }, [enrollmentPayload, methods]);

  useEffect(() => {
    if (!selectedIntake || hasAutoFilledDatesRef.current) return;

    const intakeStart =
      normalizeDateStringToYmd(selectedIntake.intake_start) ??
      normalizeDateStringToYmd(selectedIntake.class_start_date);
    const intakeEnd =
      normalizeDateStringToYmd(selectedIntake.intake_end) ??
      normalizeDateStringToYmd(selectedIntake.class_end_date);
    const durationWeeks =
      (typeof selectedIntake.intake_duration === "number" &&
      selectedIntake.intake_duration > 0
        ? selectedIntake.intake_duration
        : null) ?? parseWeeksFromDurationText(selectedCourse?.duration_text);
    const derivedEndDate =
      intakeEnd ??
      (intakeStart && durationWeeks
        ? addWeeksToYmdDateString(intakeStart, durationWeeks)
        : null);

    const currentPreferredStartDate = methods.getValues("preferred_start_date");
    const currentCourseEndDate = methods.getValues("course_end_date");
    const currentWeeks = methods.getValues("no_of_weeks");

    if (!currentPreferredStartDate && intakeStart) {
      methods.setValue("preferred_start_date", intakeStart, {
        shouldDirty: false,
      });
    }
    if (!currentCourseEndDate && derivedEndDate) {
      methods.setValue("course_end_date", derivedEndDate, {
        shouldDirty: false,
      });
    }
    if (
      (!currentWeeks || currentWeeks <= 1) &&
      typeof durationWeeks === "number" &&
      durationWeeks > 0
    ) {
      methods.setValue("no_of_weeks", durationWeeks, {
        shouldDirty: false,
      });
    }

    hasAutoFilledDatesRef.current = true;
  }, [selectedCourse?.duration_text, selectedIntake, methods]);

  const onSubmit = async (values: StudentEnrollmentFormValues) => {
    if (!applicationId) {
      toast.error("Missing application reference.");
      return;
    }

    if (!enrollmentCore) {
      toast.error("Enrollment course/intake/campus details are missing.");
      return;
    }

    const toYesNoApi = (value: "Yes" | "No"): "yes" | "no" =>
      value === "Yes" ? "yes" : "no";
    const toYesNoNaApi = (value: "Yes" | "No" | "N/A"): "yes" | "no" | "na" => {
      if (value === "Yes") return "yes";
      if (value === "N/A") return "na";
      return "no";
    };

    const payload: EnrollmentValues = {
      course: enrollmentCore.course,
      course_name: enrollmentCore.course_name,
      intake: enrollmentCore.intake,
      intake_name: enrollmentCore.intake_name,
      campus: enrollmentCore.campus,
      campus_name: enrollmentCore.campus_name,
      preferred_start_date: values.preferred_start_date,
      advanced_standing_credit: toYesNoApi(values.advanced_standing_credit),
      no_of_weeks: Number(values.no_of_weeks),
      course_end_date: values.course_end_date,
      offer_issued_date: values.offer_issued_date,
      study_reason: values.study_reason,
      course_actual_fee: Number(values.course_actual_fee),
      course_upfront_fee: Number(values.course_upfront_fee),
      enrollment_fee: Number(values.enrollment_fee),
      material_fee: Number(values.material_fee),
      inclue_material_fee_in_initial_payment: toYesNoApi(
        values.inclue_material_fee_in_initial_payment,
      ),
      receiving_scholarship: toYesNoApi(values.receiving_scholarship),
      work_integrated_learning: toYesNoNaApi(values.work_integrated_learning),
      third_party_provider: toYesNoNaApi(values.third_party_provider),
      class_type: values.class_type,
      application_request: values.application_request,
      ...(values.advanced_standing_credit === "Yes"
        ? { number_of_subjects: Number(values.number_of_subjects) }
        : {}),
      ...(values.receiving_scholarship === "Yes"
        ? { scholarship_percentage: Number(values.scholarship_percentage) }
        : {}),
    };

    await saveEnrollment({ applicationId, values: payload });
    await queryClient.invalidateQueries({
      queryKey: ["application-get", applicationId],
    });
    toast.success("Enrollment details updated successfully.");
    onSubmitSuccess?.();
  };

  const renderButtonRow = () => (
    <div className="flex items-center gap-2">
      {applicationId && (
        <Link href={siteRoutes.dashboard.application.edit(applicationId)}>
          <Button variant={"outline"}>Edit Enrollment Data</Button>
        </Link>
      )}

      <Button type="submit" disabled={methods.formState.isSubmitting}>
        {methods.formState.isSubmitting || isSavingEnrollment ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
  return (
    <FormProvider {...methods}>
      <form
        className={isDialogMode ? "flex h-full min-h-0 flex-col" : "space-y-4"}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div
          className={
            isDialogMode
              ? "flex-1 min-h-0 space-y-4 overflow-y-auto pr-1"
              : "space-y-4"
          }
        >
          {enrollmentCore ? (
            <div className="rounded-md border bg-muted/20 p-4 text-sm">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Course</p>
                  <p className="font-medium">
                    {selectedCourse?.course_name ||
                      enrollmentCore.course_name ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Intake</p>
                  <p className="font-medium">
                    {selectedIntake?.intake_name ||
                      enrollmentCore.intake_name ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Campus</p>
                  <p className="font-medium">
                    {selectedCourse?.campuses.find(
                      (campus) => campus.id === enrollmentCore.campus,
                    )?.name ||
                      enrollmentCore.campus_name ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {selectedCourse?.duration_text ||
                      (methods.getValues("no_of_weeks")
                        ? `${methods.getValues("no_of_weeks")} weeks`
                        : "-")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Intake Start</p>
                  <p className="font-medium">
                    {selectedIntake?.intake_start ||
                      selectedIntake?.class_start_date ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Intake End</p>
                  <p className="font-medium">
                    {selectedIntake?.intake_end ||
                      selectedIntake?.class_end_date ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {isFetchingEnrollmentData ? (
            <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching enrollment details...
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="preferred_start_date"
              label="Preferred Start Date *"
              type="date"
              disabled
            />
            <FormInput
              name="no_of_weeks"
              label="No. of Weeks *"
              type="number"
              disabled
            />
            <FormInput
              name="course_end_date"
              label="Course End Date *"
              type="date"
              disabled
            />
            <FormInput
              name="offer_issued_date"
              label="Offer Issued Date *"
              type="date"
              disabled
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
              <div className="space-y-2">
                <Label>How many subject are you calming for credit? *</Label>
                <Controller
                  name="number_of_subjects"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={typeof value === "number" ? String(value) : ""}
                      onValueChange={(v) => onChange(Number(v))}
                    >
                      <SelectTrigger>
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
                Third-Party Providers engaged by college to deliver / support
                the course Application Request *
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
        </div>

        {isDialogMode ? (
          <DialogFooter className="sticky bottom-0 border-t bg-background pt-3">
            {renderButtonRow()}
          </DialogFooter>
        ) : (
          <div className="flex justify-end">{renderButtonRow()}</div>
        )}
      </form>
    </FormProvider>
  );
};

export default StudentEnrollmentForm;
