/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { useGalaxySyncEnrollmentMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
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

export function EnrollmentSection(props: {
  applicationId: string;
  enrollmentData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const { applicationId, enrollmentData, showSync, isStaffOrAdmin, syncMeta } =
    props;
  const queryClient = useQueryClient();
  const syncEnrollment = useGalaxySyncEnrollmentMutation(applicationId);
  if (!enrollmentData) return null;
  const enrollments = enrollmentData?.enrollments || [];
  const invalidateApplication = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-get", applicationId],
    });
    queryClient.invalidateQueries({ queryKey: ["application-list"] });
  };
  const syncNote = (
    <SyncMetadataNote
      syncMeta={syncMeta}
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
    />
  );

  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() =>
        syncEnrollment.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncEnrollment.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
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
              ? formatUtcToFriendlyLocal(String(enrollmentData.offer_signed_at))
              : null
          }
          icon={CalendarDays}
        />
        <Field
          label="Fee Received At"
          value={
            enrollmentData.fee_received_at
              ? formatUtcToFriendlyLocal(String(enrollmentData.fee_received_at))
              : null
          }
          icon={CalendarDays}
        />
        <Field
          label="COE Uploaded At"
          value={
            enrollmentData.coe_uploaded_at
              ? formatUtcToFriendlyLocal(String(enrollmentData.coe_uploaded_at))
              : null
          }
          icon={CalendarDays}
        />
      </FieldsGrid>

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
  );
}
