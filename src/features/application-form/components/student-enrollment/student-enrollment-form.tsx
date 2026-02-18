"use client";

import Link from "next/link";
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
import { siteRoutes } from "@/shared/constants/site-routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { STUDY_REASON_OPTIONS } from "../../constants/enrollment-constants";
import {
  addWeeksToYmdDateString,
  normalizeDateStringToYmd,
  parseWeeksFromDurationText,
} from "../../constants/enrollment-date-utils";
import { useSaveEnrollmentMutation } from "../../hooks/course.hook";
import {
  studentEnrollmentFormSchema,
  type StudentEnrollmentFormValues,
} from "../../utils/student-enrollment-form.validation";

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

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

type StudentEnrollmentFormProps = {
  isDialogMode?: boolean;
  applicationId?: string;
  onSubmitSuccess?: (payload?: EnrollmentValues) => void;
  initialData?: unknown;
  selectedCore?: {
    course: number;
    intake: number;
    campus: number;
    course_name?: string;
    intake_name?: string;
    campus_name?: string;
    course_duration_text?: string;
    intake_start?: string | null;
    intake_end?: string | null;
    class_start_date?: string | null;
    class_end_date?: string | null;
    intake_duration?: number | string | null;
  } | null;
};

const StudentEnrollmentForm = ({
  isDialogMode = false,
  applicationId,
  onSubmitSuccess,
  initialData,
  selectedCore = null,
}: StudentEnrollmentFormProps) => {
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

  const advancedStandingValue = useWatch({
    control: methods.control,
    name: "advanced_standing_credit",
  });
  const receivingScholarshipValue = useWatch({
    control: methods.control,
    name: "receiving_scholarship",
  });

  const enrollmentCore = useMemo(() => {
    if (!selectedCore) return null;
    return {
      course: selectedCore.course,
      course_name: selectedCore.course_name ?? "",
      intake: selectedCore.intake,
      intake_name: selectedCore.intake_name ?? "",
      campus: selectedCore.campus,
      campus_name: selectedCore.campus_name ?? "",
      course_duration_text: selectedCore.course_duration_text ?? "",
      intake_start: selectedCore.intake_start ?? null,
      intake_end: selectedCore.intake_end ?? null,
      class_start_date: selectedCore.class_start_date ?? null,
      class_end_date: selectedCore.class_end_date ?? null,
      intake_duration: selectedCore.intake_duration ?? null,
    };
  }, [selectedCore]);

  useEffect(() => {
    if (!initialData || typeof initialData !== "object" || Array.isArray(initialData)) {
      return;
    }

    const raw = initialData as Record<string, unknown>;
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

    const classTypeRaw = String(raw.class_type ?? defaultValues.class_type).toLowerCase();
    const classType =
      classTypeRaw === "hybrid" || classTypeRaw === "online"
        ? classTypeRaw
        : "classroom";

    methods.reset({
      preferred_start_date:
        typeof raw.preferred_start_date === "string"
          ? raw.preferred_start_date
          : defaultValues.preferred_start_date,
      advanced_standing_credit: readYesNo(raw.advanced_standing_credit),
      number_of_subjects: toNumber(raw.number_of_subjects) ?? undefined,
      no_of_weeks: toNumber(raw.no_of_weeks) ?? defaultValues.no_of_weeks,
      course_end_date:
        typeof raw.course_end_date === "string"
          ? raw.course_end_date
          : defaultValues.course_end_date,
      offer_issued_date:
        typeof raw.offer_issued_date === "string" && raw.offer_issued_date
          ? raw.offer_issued_date
          : todayYmd(),
      study_reason:
        typeof raw.study_reason === "string"
          ? raw.study_reason
          : defaultValues.study_reason,
      course_actual_fee:
        toNumber(raw.course_actual_fee) ?? defaultValues.course_actual_fee,
      course_upfront_fee:
        toNumber(raw.course_upfront_fee) ?? defaultValues.course_upfront_fee,
      enrollment_fee: toNumber(raw.enrollment_fee) ?? defaultValues.enrollment_fee,
      material_fee: toNumber(raw.material_fee) ?? defaultValues.material_fee,
      inclue_material_fee_in_initial_payment: readYesNo(
        raw.inclue_material_fee_in_initial_payment,
      ),
      receiving_scholarship: readYesNo(raw.receiving_scholarship),
      scholarship_percentage: toNumber(raw.scholarship_percentage) ?? undefined,
      work_integrated_learning: readYesNoNa(raw.work_integrated_learning),
      third_party_provider: readYesNoNa(raw.third_party_provider),
      class_type: classType,
      application_request:
        typeof raw.application_request === "string" ? raw.application_request : "",
    });
  }, [initialData, methods]);

  useEffect(() => {
    if (!enrollmentCore) return;

    const intakeStart =
      normalizeDateStringToYmd(enrollmentCore.intake_start) ??
      normalizeDateStringToYmd(enrollmentCore.class_start_date);
    const intakeEnd =
      normalizeDateStringToYmd(enrollmentCore.intake_end) ??
      normalizeDateStringToYmd(enrollmentCore.class_end_date);
    const intakeDurationWeeks =
      typeof enrollmentCore.intake_duration === "number" &&
      enrollmentCore.intake_duration > 0
        ? enrollmentCore.intake_duration
        : toNumber(enrollmentCore.intake_duration);
    const durationWeeks =
      intakeDurationWeeks &&
      Number.isFinite(intakeDurationWeeks) &&
      intakeDurationWeeks > 0
        ? intakeDurationWeeks
        : parseWeeksFromDurationText(enrollmentCore.course_duration_text);
    const derivedEndDate =
      intakeEnd ??
      (intakeStart && durationWeeks
        ? addWeeksToYmdDateString(intakeStart, durationWeeks)
        : null);

    // Keep existing values from initialData when intake dates are unavailable.
    if (intakeStart) {
      methods.setValue("preferred_start_date", intakeStart, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
    if (derivedEndDate) {
      methods.setValue("course_end_date", derivedEndDate, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
    if (durationWeeks && durationWeeks > 0) {
      methods.setValue("no_of_weeks", durationWeeks, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [enrollmentCore, methods]);

  const onSubmit = async (values: StudentEnrollmentFormValues) => {
    if (!applicationId) {
      toast.error("Missing application reference.");
      return;
    }

    if (!enrollmentCore) {
      toast.error("Select course, intake and campus first.");
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
    onSubmitSuccess?.(payload);
  };

  const renderButtonRow = () => (
    <div className="flex items-center gap-2">
      {applicationId && isDialogMode && (
        <Link href={siteRoutes.dashboard.application.edit(applicationId)}>
          <Button variant="outline">Edit Enrollment Data</Button>
        </Link>
      )}

      <Button
        type="submit"
        disabled={!enrollmentCore || methods.formState.isSubmitting}
      >
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
                  <p className="font-medium">{enrollmentCore.course_name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Intake</p>
                  <p className="font-medium">{enrollmentCore.intake_name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Campus</p>
                  <p className="font-medium">{enrollmentCore.campus_name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {enrollmentCore.course_duration_text ||
                      `${methods.getValues("no_of_weeks")} weeks`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Intake Start</p>
                  <p className="font-medium">
                    {enrollmentCore.intake_start ||
                      enrollmentCore.class_start_date ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Intake End</p>
                  <p className="font-medium">
                    {enrollmentCore.intake_end ||
                      enrollmentCore.class_end_date ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Select course, campus and intake in the parent form first.
            </div>
          )}

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
