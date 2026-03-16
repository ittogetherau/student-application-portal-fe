/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentEnrollmentForm from "@/features/application-form/components/student-enrollment/student-enrollment-form";
import { getUnhandledReviewEntries } from "@/features/application-form/components/review-sections/review-utils";
import { CompactTable } from "@/features/application-form/components/sync-review/compact-table";
import {
  Field,
  FieldsGrid,
  formatMoney,
} from "@/features/application-form/components/sync-review/field";
import {
  Group,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import {
  useCourseIntakesQuery,
  useCoursesQuery,
} from "@/features/application-form/hooks/course.hook";
import { useApplicationEnrollGalaxyCourseMutation } from "@/shared/hooks/use-applications";
import {
  formatClassType,
  formatYesNo,
  formatYesNoNa,
} from "@/features/application-form/constants/formatters";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { useMemo, useState } from "react";

const toId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    return toId(record.id ?? record.value ?? null);
  }
  return null;
};

export function EnrollmentSection(props: {
  applicationId: string;
  enrollmentData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  canManageEnrollment?: boolean;
  syncMeta?: SyncMetadataItem | null;
  showRequestChange?: boolean;
}) {
  const {
    applicationId,
    enrollmentData,
    showSync,
    isStaffOrAdmin,
    canManageEnrollment = false,
    syncMeta,
    showRequestChange,
  } = props;
  const queryClient = useQueryClient();
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const syncEnrollment =
    useApplicationEnrollGalaxyCourseMutation(applicationId);
  const resolvedEnrollmentData = useMemo(
    () => enrollmentData ?? {},
    [enrollmentData],
  );
  const selectedCourseId = toId(
    resolvedEnrollmentData.course_id ??
      resolvedEnrollmentData.courseId ??
      resolvedEnrollmentData.course,
  );
  const selectedIntakeId = toId(
    resolvedEnrollmentData.intake_id ??
      resolvedEnrollmentData.intakeId ??
      resolvedEnrollmentData.intake,
  );
  const selectedCampusId = toId(
    resolvedEnrollmentData.campus_id ??
      resolvedEnrollmentData.campusId ??
      resolvedEnrollmentData.campus,
  );
  const enrollments = enrollmentData?.enrollments || [];
  const { data: coursesResponse } = useCoursesQuery();
  const courses = useMemo(
    () => coursesResponse?.data ?? [],
    [coursesResponse?.data],
  );
  const selectedCourseFromQuery = useMemo(() => {
    if (!selectedCourseId) return null;
    return (
      courses.find((course) => toId(course.id) === selectedCourseId) ?? null
    );
  }, [courses, selectedCourseId]);

  const { data: intakesResponse } = useCourseIntakesQuery(
    selectedCourseFromQuery?.course_code,
    selectedCampusId ? { campus: selectedCampusId } : undefined,
  );
  const selectedIntakeFromQuery = useMemo(() => {
    if (!selectedIntakeId) return null;
    const intakes = intakesResponse?.data ?? [];
    return (
      intakes.find((intake) => toId(intake.id) === selectedIntakeId) ?? null
    );
  }, [intakesResponse?.data, selectedIntakeId]);

  const selectedCampusFromQuery = useMemo(() => {
    if (!selectedCourseFromQuery || !selectedCampusId) return null;
    return (
      selectedCourseFromQuery.campuses?.find(
        (campus) => toId(campus.id) === selectedCampusId,
      ) ?? null
    );
  }, [selectedCourseFromQuery, selectedCampusId]);

  const selectedCore = useMemo(() => {
    const course = selectedCourseId;
    const intake = selectedIntakeId;
    const campus = selectedCampusId;

    if (!course || !intake || !campus) return null;

    return {
      course,
      intake,
      campus,
      course_code: selectedCourseFromQuery?.course_code ?? "",
      course_name:
        selectedCourseFromQuery?.course_name ??
        resolvedEnrollmentData.course_name ??
        resolvedEnrollmentData.courseName ??
        "",
      major:
        resolvedEnrollmentData.major ??
        resolvedEnrollmentData.major_name ??
        resolvedEnrollmentData.majorName ??
        "",
      major_id:
        resolvedEnrollmentData.major_id ??
        resolvedEnrollmentData.majorId ??
        null,
      intake_name:
        selectedIntakeFromQuery?.intake_name ??
        resolvedEnrollmentData.intake_name ??
        resolvedEnrollmentData.intakeName ??
        "",
      campus_name:
        selectedCampusFromQuery?.name ??
        resolvedEnrollmentData.campus_name ??
        resolvedEnrollmentData.campusName ??
        "",
      course_duration_text:
        selectedCourseFromQuery?.duration_text ??
        resolvedEnrollmentData.course_duration_text ??
        resolvedEnrollmentData.duration_text ??
        "",
      intake_start:
        selectedIntakeFromQuery?.intake_start ??
        resolvedEnrollmentData.intake_start ??
        resolvedEnrollmentData.class_start_date ??
        resolvedEnrollmentData.preferred_start_date ??
        null,
      intake_end:
        selectedIntakeFromQuery?.intake_end ??
        resolvedEnrollmentData.intake_end ??
        resolvedEnrollmentData.class_end_date ??
        resolvedEnrollmentData.course_end_date ??
        null,
      class_start_date:
        selectedIntakeFromQuery?.class_start_date ??
        resolvedEnrollmentData.class_start_date ??
        null,
      class_end_date:
        selectedIntakeFromQuery?.class_end_date ??
        resolvedEnrollmentData.class_end_date ??
        null,
      intake_duration:
        selectedIntakeFromQuery?.intake_duration ??
        resolvedEnrollmentData.intake_duration ??
        resolvedEnrollmentData.no_of_weeks ??
        null,
    };
  }, [
    resolvedEnrollmentData,
    selectedCampusFromQuery?.name,
    selectedCampusId,
    selectedCourseFromQuery?.course_code,
    selectedCourseFromQuery?.course_name,
    selectedCourseFromQuery?.duration_text,
    selectedCourseId,
    selectedIntakeFromQuery?.class_end_date,
    selectedIntakeFromQuery?.class_start_date,
    selectedIntakeFromQuery?.intake_duration,
    selectedIntakeFromQuery?.intake_end,
    selectedIntakeFromQuery?.intake_name,
    selectedIntakeFromQuery?.intake_start,
    selectedIntakeId,
  ]);
  if (!enrollmentData) return null;

  const invalidateApplication = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-get", applicationId],
    });
    queryClient.invalidateQueries({ queryKey: ["application-list"] });
  };
  const syncNote = (
    <SyncMetadataNote
      applicationId={applicationId}
      syncMeta={syncMeta}
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      showRequestChange={showRequestChange}
    />
  );

  const action = (
    <div className="flex items-center gap-2">
      {canManageEnrollment && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => setIsEnrollmentDialogOpen(true)}
        >
          Manage Enrollment
        </Button>
      )}

      <SyncActionButton
        showSync={showSync}
        isStaffOrAdmin={isStaffOrAdmin}
        onClick={() =>
          syncEnrollment.mutate(undefined, { onSettled: invalidateApplication })
        }
        isPending={syncEnrollment.isPending}
        syncMeta={syncMeta}
      />
    </div>
  );
  const extraEntries = getUnhandledReviewEntries(enrollmentData, [
    "campus",
    "campus_name",
    "course",
    "course_name",
    "major",
    "major_id",
    "intake",
    "intake_name",
    "preferred_start_date",
    "course_end_date",
    "no_of_weeks",
    "offer_issued_date",
    "study_reason",
    "class_type",
    "advanced_standing_credit",
    "number_of_subjects",
    "receiving_scholarship",
    "scholarship_percentage",
    "inclue_material_fee_in_initial_payment",
    "work_integrated_learning",
    "third_party_provider",
    "course_actual_fee",
    "calculated_no_of_weeks",
    "course_upfront_fee",
    "enrollment_fee",
    "material_fee",
    "application_request",
    "status",
    "offer_signed_at",
    "fee_received_at",
    "coe_uploaded_at",
    "enrollments",
  ], {
    defaultIcon: FileText,
  });

  return (
    <>
      <Section
        value="enrollment"
        title="Enrollment"
        icon={FileText}
        action={action}
        footer={syncNote}
      >
        <FieldsGrid>
          <Field
            label="Campus"
            value={enrollmentData.campus_name ?? enrollmentData.campus}
            icon={MapPin}
          />
          <Field
            label="Course"
            value={enrollmentData.course_name ?? enrollmentData.course}
            icon={GraduationCap}
          />
          <Field
            label="Major"
            value={enrollmentData.major}
            icon={GraduationCap}
          />
          <Field
            label="Intake"
            value={enrollmentData.intake_name ?? enrollmentData.intake}
            icon={CalendarDays}
          />
          <Field
            label="Preferred Start Date"
            value={enrollmentData.preferred_start_date}
            icon={CalendarDays}
          />
          <Field
            label="Course End Date"
            value={enrollmentData.course_end_date}
            icon={CalendarDays}
          />
          <Field
            label="No. of Weeks"
            value={enrollmentData.no_of_weeks}
            icon={CalendarDays}
          />
          <Field
            label="Offer Issued Date"
            value={enrollmentData.offer_issued_date}
            icon={CalendarDays}
          />
          <Field
            label="Study Reason"
            value={enrollmentData.study_reason}
            icon={ClipboardCheck}
          />
          <Field
            label="Class Type"
            value={enrollmentData.class_type}
            icon={Briefcase}
            format={formatClassType}
          />
          <Field
            label="Advanced Standing / Credit"
            value={enrollmentData.advanced_standing_credit}
            icon={CheckCircle2}
            format={formatYesNo}
          />
          <Field
            label="No. of Subjects"
            value={enrollmentData.number_of_subjects}
            icon={GraduationCap}
          />
          <Field
            label="Receiving Scholarship"
            value={enrollmentData.receiving_scholarship}
            icon={CheckCircle2}
            format={formatYesNo}
          />
          <Field
            label="Scholarship %"
            value={enrollmentData.scholarship_percentage}
            icon={CheckCircle2}
          />
          <Field
            label="Include Material Fee in Initial Payment"
            value={enrollmentData.inclue_material_fee_in_initial_payment}
            icon={CheckCircle2}
            format={formatYesNo}
          />
          <Field
            label="WIL Requirements"
            value={enrollmentData.work_integrated_learning}
            icon={CheckCircle2}
            format={formatYesNoNa}
          />
          <Field
            label="Third Party Provider"
            value={enrollmentData.third_party_provider}
            icon={CheckCircle2}
            format={formatYesNoNa}
          />
          <Field
            label="Course Actual Fee"
            value={enrollmentData.course_actual_fee}
            icon={FileText}
            format={formatMoney}
          />
          <Field
            label="Course Upfront Fee"
            value={enrollmentData.course_upfront_fee}
            icon={FileText}
            format={formatMoney}
          />
          <Field
            label="Enrollment Fee"
            value={enrollmentData.enrollment_fee}
            icon={FileText}
            format={formatMoney}
          />
          <Field
            label="Material Fee"
            value={enrollmentData.material_fee}
            icon={FileText}
            format={formatMoney}
          />
          <Field
            label="Application Request"
            value={enrollmentData.application_request}
            icon={FileText}
          />
          <Field label="Status" value={enrollmentData.status} icon={FileText} />
          <Field
            label="Offer Signed At"
            value={
              enrollmentData.offer_signed_at
                ? formatUtcToFriendlyLocal(
                    String(enrollmentData.offer_signed_at),
                  )
                : null
            }
            icon={CalendarDays}
          />
          <Field
            label="Fee Received At"
            value={
              enrollmentData.fee_received_at
                ? formatUtcToFriendlyLocal(
                    String(enrollmentData.fee_received_at),
                  )
                : null
            }
            icon={CalendarDays}
          />
          <Field
            label="COE Uploaded At"
            value={
              enrollmentData.coe_uploaded_at
                ? formatUtcToFriendlyLocal(
                    String(enrollmentData.coe_uploaded_at),
                  )
                : null
            }
            icon={CalendarDays}
          />
        </FieldsGrid>

        {extraEntries.length ? (
          <FieldsGrid>
            {extraEntries.map((entry) => (
              <Field
                key={entry.key}
                label={entry.label}
                value={entry.value}
                icon={entry.icon}
                format={entry.format}
                mono={entry.mono}
              />
            ))}
          </FieldsGrid>
        ) : null}

        {enrollments.length ? (
          <Group>
            <CompactTable
              headers={["Course", "Intake Date", "Campus"]}
              rows={enrollments.map((enr: any) => [
                enr.course,
                enr.intakeDate
                  ? formatUtcToFriendlyLocal(String(enr.intakeDate))
                  : "",
                enr.campus,
              ])}
            />
          </Group>
        ) : null}
      </Section>

      <Dialog
        open={isEnrollmentDialogOpen}
        onOpenChange={setIsEnrollmentDialogOpen}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0">
          <div className="flex h-[90vh] max-h-[90vh] flex-col">
            <DialogHeader className="border-b px-6 py-4">
              <DialogTitle>Manage Enrollment</DialogTitle>
              <DialogDescription>
                Update enrollment details for this application.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
              <StudentEnrollmentForm
                isDialogMode
                applicationId={applicationId}
                initialData={enrollmentData}
                selectedCore={selectedCore}
                onSubmitSuccess={() => {
                  invalidateApplication();
                  setIsEnrollmentDialogOpen(false);
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
