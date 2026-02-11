/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
  Contact2,
  FileText,
  GraduationCap,
  HeartPulse,
  Languages,
  MapPin,
  Shield,
  User2,
} from "lucide-react";
import {
  useGalaxySyncDeclarationMutation,
  useGalaxySyncDisabilityMutation,
  useGalaxySyncEmergencyContactMutation,
  useGalaxySyncEmploymentMutation,
  useGalaxySyncLanguageMutation,
  useGalaxySyncOshcMutation,
  useGalaxySyncPersonalDetailsMutation,
  useGalaxySyncQualificationsMutation,
  useGalaxySyncSchoolingMutation,
  useGalaxySyncUsiMutation,
} from "../../hooks/galaxy-sync.hook";
import { CompactTable } from "../sync-review/compact-table";
import { Field, FieldsGrid, formatMoney, toText } from "../sync-review/field";
import { EmptyNote, Group, Section } from "../sync-review/section";
import { SyncActionButton } from "../sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "../sync-review/sync-metadata-note";

export function EnrollmentSection(props: {
  applicationId: string;
  enrollmentData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const { enrollmentData, showSync, isStaffOrAdmin, syncMeta } = props;
  // const syncEnrollment = useGalaxySyncEnrollmentMutation(applicationId);
  if (!enrollmentData) return null;
  const enrollments = enrollmentData?.enrollments || [];
  const syncNote = (
    <SyncMetadataNote
      syncMeta={syncMeta}
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
    />
  );

  // const action = (
  //   <SyncActionButton
  //     showSync={showSync}
  //     isStaffOrAdmin={isStaffOrAdmin}
  //     onClick={() => syncEnrollment.mutate()}
  //     isPending={syncEnrollment.isPending}
  //     syncMeta={syncMeta}
  //   />
  // );

  return (
    <Section
      value="enrollment"
      title="Enrollment"
      icon={FileText}
      action={<></>}
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
          format={(v) => {
            const s = toText(v);
            if (!s) return "";
            return s
              .split(/[\s_-]+/g)
              .filter(Boolean)
              .map((p) => p[0]?.toUpperCase() + p.slice(1))
              .join(" ");
          }}
        />
        <Field
          label="Advanced Standing / Credit"
          value={enrollmentData.advanced_standing_credit}
          icon={CheckCircle2}
          format={(v) => {
            const s = toText(v);
            if (!s) return "";
            const lower = s.toLowerCase();
            if (lower === "yes") return "Yes";
            if (lower === "no") return "No";
            return s;
          }}
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
          format={(v) => {
            const s = toText(v);
            if (!s) return "";
            const lower = s.toLowerCase();
            if (lower === "yes") return "Yes";
            if (lower === "no") return "No";
            return s;
          }}
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
          format={(v) => {
            const s = toText(v);
            if (!s) return "";
            const lower = s.toLowerCase();
            if (lower === "yes") return "Yes";
            if (lower === "no") return "No";
            return s;
          }}
        />
        <Field
          label="WIL Requirements"
          value={enrollmentData.work_integrated_learning}
          icon={CheckCircle2}
          format={(v) => {
            const s = toText(v);
            if (!s) return "";
            const lower = s.toLowerCase();
            if (lower === "yes") return "Yes";
            if (lower === "no") return "No";
            if (lower === "na" || lower === "n/a") return "N/A";
            return s;
          }}
        />
        <Field
          label="Third Party Provider"
          value={enrollmentData.third_party_provider}
          icon={CheckCircle2}
          format={(v) => {
            const s = toText(v);
            if (!s) return "";
            const lower = s.toLowerCase();
            if (lower === "yes") return "Yes";
            if (lower === "no") return "No";
            if (lower === "na" || lower === "n/a") return "N/A";
            return s;
          }}
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
        <Field
          label="Status"
          value={enrollmentData.status}
          icon={FileText}
        />
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

export function PersonalDetailsSection({
  applicationId,
  personalDetails,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  personalDetails: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncPersonalDetails =
    useGalaxySyncPersonalDetailsMutation(applicationId);
  if (!personalDetails) return null;
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
        syncPersonalDetails.mutate(undefined, {
          onSettled: invalidateApplication,
        })
      }
      isPending={syncPersonalDetails.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="personal"
      title="Personal"
      icon={User2}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field
          label="Given Name"
          value={personalDetails.given_name}
          icon={User2}
        />
        <Field
          label="Middle Name"
          value={personalDetails.middle_name}
          icon={User2}
        />
        <Field
          label="Family Name"
          value={personalDetails.family_name}
          icon={User2}
        />
        <Field label="Email" value={personalDetails.email} icon={Contact2} />
        <Field
          label="Phone"
          value={personalDetails.phone}
          icon={Contact2}
          mono
        />
        <Field
          label="Date of Birth"
          value={
            personalDetails.date_of_birth
              ? formatUtcToFriendlyLocal(personalDetails.date_of_birth)
              : null
          }
          icon={CalendarDays}
        />
        <Field label="Gender" value={personalDetails.gender} icon={User2} />
        <Field
          label="Street Address"
          value={personalDetails.street_name}
          icon={MapPin}
        />
        <Field label="Suburb" value={personalDetails.suburb} icon={MapPin} />
        <Field label="State" value={personalDetails.state} icon={MapPin} />
        <Field
          label="Postcode"
          value={personalDetails.postcode}
          icon={MapPin}
          mono
        />
        <Field label="Country" value={personalDetails.country} icon={MapPin} />
        <Field
          label="Nationality"
          value={personalDetails.nationality}
          icon={Shield}
        />
        <Field
          label="Country of Birth"
          value={personalDetails.country_of_birth}
          icon={MapPin}
        />
        <Field
          label="Passport Number"
          value={personalDetails.passport_number}
          icon={Shield}
          mono
        />
        <Field
          label="Passport Expiry"
          value={
            personalDetails.passport_expiry
              ? formatUtcToFriendlyLocal(personalDetails.passport_expiry)
              : null
          }
          icon={CalendarDays}
        />
      </FieldsGrid>
    </Section>
  );
}

export function EmergencyContactsSection({
  applicationId,
  contacts,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  contacts: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncEmergencyContact =
    useGalaxySyncEmergencyContactMutation(applicationId);
  if (!contacts.length) return null;
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
        syncEmergencyContact.mutate(undefined, {
          onSettled: invalidateApplication,
        })
      }
      isPending={syncEmergencyContact.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="emergency-contacts"
      title="Emergency Contacts"
      icon={Contact2}
      action={action}
      badge={
        <Badge variant="secondary" className="text-[11px]">
          {contacts.length}
        </Badge>
      }
      footer={syncNote}
    >
      <Group>
        <CompactTable
          headers={["Name", "Relationship", "Phone", "Email", "Primary"]}
          rows={contacts.map((contact: any) => [
            contact.name,
            contact.relationship,
            contact.phone,
            contact.email,
            contact.is_primary ? (
              <Badge key="primary" variant="secondary" className="text-[11px]">
                Primary
              </Badge>
            ) : (
              ""
            ),
          ])}
        />
      </Group>
    </Section>
  );
}

export function HealthCoverSection({
  applicationId,
  policy,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  policy: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncOshc = useGalaxySyncOshcMutation(applicationId);
  if (!policy) return null;
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
        syncOshc.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncOshc.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="health-cover"
      title="Health Cover"
      icon={HeartPulse}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field label="Arrange OSHC" value={policy.arrange_OSHC} icon={Shield} />
      </FieldsGrid>

      {policy.arrange_OSHC ? (
        <FieldsGrid>
          <Field
            label="Provider"
            value={policy.OSHC_provider}
            icon={HeartPulse}
          />
          <Field
            label="Coverage Type"
            value={policy.OSHC_type}
            icon={FileText}
          />
          <Field
            label="Start Date"
            value={
              policy.OSHC_start_date
                ? formatUtcToFriendlyLocal(policy.OSHC_start_date)
                : null
            }
            icon={CalendarDays}
          />
          <Field
            label="End Date"
            value={
              policy.OSHC_end_date
                ? formatUtcToFriendlyLocal(policy.OSHC_end_date)
                : null
            }
            icon={CalendarDays}
          />
          <Field
            label="Duration"
            value={policy.OSHC_duration}
            icon={CalendarDays}
          />
          <Field
            label="Fee"
            value={policy.OSHC_fee}
            icon={FileText}
            format={formatMoney}
          />
        </FieldsGrid>
      ) : (
        <EmptyNote>OSHC will not be arranged.</EmptyNote>
      )}
    </Section>
  );
}

export function LanguageCulturalSection({
  applicationId,
  data,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  data: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncLanguage = useGalaxySyncLanguageMutation(applicationId);
  if (!data) return null;
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
        syncLanguage.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncLanguage.isPending}
      syncMeta={syncMeta}
    />
  );

  const aboriginalOrIslander =
    data.is_aus_aboriginal_or_islander ?? data.aboriginal_torres_strait ?? null;

  const hasAny =
    aboriginalOrIslander ||
    data.is_english_main_language ||
    data.main_language ||
    data.english_speaking_proficiency ||
    data.english_instruction_previous_studies ||
    data.completed_english_test ||
    data.english_test_type ||
    data.english_test_date ||
    data.english_test_score ||
    data.first_language ||
    data.english_proficiency ||
    (data.other_languages && data.other_languages.length > 0) ||
    data.indigenous_status ||
    data.country_of_birth ||
    data.citizenship_status ||
    data.visa_type ||
    data.visa_expiry;

  return (
    <Section
      value="language-cultural"
      title="Language & Cultural"
      icon={Languages}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field
          label="Aboriginal/Torres Strait"
          value={aboriginalOrIslander}
          icon={Shield}
        />
        <Field
          label="English Main Language"
          value={data.is_english_main_language}
          icon={Languages}
        />
        <Field
          label="Main Language"
          value={data.main_language ?? data.first_language}
          icon={Languages}
        />
        <Field
          label="English Proficiency"
          value={data.english_speaking_proficiency ?? data.english_proficiency}
          icon={Languages}
        />
        <Field
          label="English Instruction (Previous Studies)"
          value={data.english_instruction_previous_studies}
          icon={Languages}
        />
        <Field
          label="Completed English Test"
          value={data.completed_english_test}
          icon={FileText}
        />
        <Field
          label="English Test Type"
          value={data.english_test_type}
          icon={FileText}
        />
        <Field
          label="English Test Date"
          value={data.english_test_date}
          icon={CalendarDays}
        />
        <Field
          label="English Test (Overall)"
          value={data.english_test_overall ?? data.english_test_score}
          icon={FileText}
        />
        <Field
          label="English Test (Listening)"
          value={data.english_test_listening}
          icon={FileText}
        />
        <Field
          label="English Test (Reading)"
          value={data.english_test_reading}
          icon={FileText}
        />
        <Field
          label="English Test (Writing)"
          value={data.english_test_writing}
          icon={FileText}
        />
        <Field
          label="English Test (Speaking)"
          value={data.english_test_speaking}
          icon={FileText}
        />
        <Field
          label="Other Languages"
          value={
            data.other_languages?.length
              ? data.other_languages.join(", ")
              : null
          }
          icon={Languages}
        />
        <Field
          label="Indigenous Status"
          value={data.indigenous_status}
          icon={Shield}
        />
        <Field
          label="Country of Birth"
          value={data.country_of_birth}
          icon={MapPin}
        />
        <Field
          label="Citizenship Status"
          value={data.citizenship_status}
          icon={Shield}
        />
        <Field label="Visa Type" value={data.visa_type} icon={Shield} />
        <Field
          label="Visa Expiry"
          value={data.visa_expiry}
          icon={CalendarDays}
        />
      </FieldsGrid>

      {!hasAny && (
        <EmptyNote>No language or cultural information provided.</EmptyNote>
      )}
    </Section>
  );
}

export function DisabilitySupportSection({
  applicationId,
  data,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  data: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncDisability = useGalaxySyncDisabilityMutation(applicationId);
  if (!data) return null;
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
        syncDisability.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncDisability.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="disability-support"
      title="Disability Support"
      icon={Shield}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field
          label="Has Disability"
          value={data.has_disability}
          icon={Shield}
        />
      </FieldsGrid>
      {data.has_disability ? (
        <FieldsGrid>
          <Field
            label="Details"
            value={data.disability_details}
            icon={FileText}
          />
          <Field
            label="Support Required"
            value={data.support_required}
            icon={FileText}
          />
          <Field
            label="Documentation"
            value={data.documentation_status}
            icon={FileText}
          />
        </FieldsGrid>
      ) : null}
    </Section>
  );
}

export function SchoolingSection({
  applicationId,
  schoolingData,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  schoolingData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncSchooling = useGalaxySyncSchoolingMutation(applicationId);
  if (!schoolingData) return null;
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
        syncSchooling.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncSchooling.isPending}
      syncMeta={syncMeta}
    />
  );

  const schoolingEntries =
    schoolingData?.entries && Array.isArray(schoolingData.entries)
      ? schoolingData.entries
      : Array.isArray(schoolingData)
        ? schoolingData
        : null;

  return (
    <Section
      value="schooling"
      title="Schooling"
      icon={GraduationCap}
      action={action}
      footer={syncNote}
    >
      {schoolingEntries?.length ? (
        <Group>
          <CompactTable
            headers={[
              "Institution",
              "Country",
              "Field",
              "Level",
              "Start",
              "End",
              "Result",
              "Current",
            ]}
            rows={schoolingEntries.map((school: any) => [
              school.institution,
              school.country,
              school.field_of_study,
              school.qualification_level,
              school.start_year,
              school.end_year,
              school.result,
              toText(school.currently_attending),
            ])}
          />
        </Group>
      ) : typeof schoolingData === "object" && schoolingData !== null ? (
        <FieldsGrid>
          {Object.entries(schoolingData).map(([key, value]) => (
            <Field
              key={key}
              label={key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              value={String(value)}
              icon={FileText}
            />
          ))}
        </FieldsGrid>
      ) : (
        <EmptyNote>No schooling history available.</EmptyNote>
      )}
    </Section>
  );
}

export function QualificationsSection({
  applicationId,
  qualifications,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  qualifications: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncQualifications = useGalaxySyncQualificationsMutation(applicationId);
  if (!qualifications.length) return null;
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
        syncQualifications.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncQualifications.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="qualifications"
      title="Qualifications"
      icon={GraduationCap}
      action={action}
      badge={
        <Badge variant="secondary" className="text-[11px]">
          {qualifications.length}
        </Badge>
      }
      footer={syncNote}
    >
      <Group>
        <CompactTable
          headers={[
            "Name",
            "Institution",
            "Field",
            "Completion",
            "Grade",
            "Certificate No.",
          ]}
          rows={qualifications.map((qual: any) => [
            qual.qualification_name,
            qual.institution,
            qual.field_of_study,
            qual.completion_date
              ? formatUtcToFriendlyLocal(String(qual.completion_date))
              : "",
            qual.grade,
            qual.certificate_number,
          ])}
        />
      </Group>
    </Section>
  );
}

export function EmploymentSection({
  applicationId,
  employmentHistory,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  employmentHistory: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncEmployment = useGalaxySyncEmploymentMutation(applicationId);
  const invalidateApplication = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-get", applicationId],
    });
    queryClient.invalidateQueries({ queryKey: ["application-list"] });
  };
  const employmentArray = Array.isArray(employmentHistory)
    ? employmentHistory
    : employmentHistory?.entries || [];
  const employmentStatus =
    typeof employmentHistory === "object" &&
    employmentHistory &&
    "employment_status" in employmentHistory
      ? (employmentHistory as any).employment_status
      : null;

  if (!employmentArray.length && !employmentStatus) return null;
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
        syncEmployment.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncEmployment.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="employment"
      title="Employment"
      icon={Briefcase}
      action={action}
      badge={
        <Badge variant="secondary" className="text-[11px]">
          {employmentArray.length}
        </Badge>
      }
      footer={syncNote}
    >
      {employmentStatus ? (
        <FieldsGrid>
          <Field
            label="Employment Status"
            value={employmentStatus}
            icon={Briefcase}
          />
        </FieldsGrid>
      ) : null}

      {employmentArray.length ? (
        <Group>
          <CompactTable
            headers={[
              "Employer",
              "Role",
              "Industry",
              "Start",
              "End",
              "Responsibilities",
              "Current",
            ]}
            rows={employmentArray.map((employment: any) => [
              employment.employer,
              employment.role,
              employment.industry,
              employment.start_date
                ? formatUtcToFriendlyLocal(String(employment.start_date))
                : "",
              employment.end_date
                ? formatUtcToFriendlyLocal(String(employment.end_date))
                : "",
              employment.responsibilities,
              toText(employment.is_current),
            ])}
          />
        </Group>
      ) : null}
    </Section>
  );
}

export function UsiSection({
  applicationId,
  usi,
  verified,
  verifiedAt,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  usi: string | null;
  verified: boolean;
  verifiedAt: string | null;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncUsi = useGalaxySyncUsiMutation(applicationId);
  if (!usi) return null;
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
        syncUsi.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncUsi.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="usi"
      title="USI"
      icon={Shield}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field label="USI Number" value={usi} icon={Shield} mono />
        <Field label="Verified" value={verified} icon={CheckCircle2} />
        <Field
          label="Verified At"
          value={verifiedAt ? formatUtcToFriendlyLocal(verifiedAt) : null}
          icon={CalendarDays}
        />
      </FieldsGrid>
    </Section>
  );
}

export function AdditionalServicesSection({
  additionalServicesData,
}: {
  applicationId: string;
  additionalServicesData: any;
}) {
  if (!additionalServicesData) return null;

  const additionalServicesRaw = Array.isArray(additionalServicesData)
    ? additionalServicesData
    : additionalServicesData?.services || [];

  const additionalServices = (additionalServicesRaw || [])
    .filter((s: any) => s && (s.selected === true || s.selected === undefined))
    .filter(
      (s: any) =>
        !!toText(s?.name) ||
        !!toText(s?.service_id) ||
        !!toText(s?.description) ||
        s?.fee != null,
    );

  const additionalTotal =
    additionalServicesData?.total_additional_fees?.parsedValue ??
    additionalServicesData?.total_additional_fees?.source ??
    null;

  const additionalRequested =
    additionalServicesData?.request_additional_services ?? null;

  const hasServices =
    (Array.isArray(additionalServicesData) &&
      additionalServicesData.length > 0) ||
    (typeof additionalServicesData === "object" &&
      "services" in additionalServicesData &&
      Array.isArray(additionalServicesData.services) &&
      additionalServicesData.services.length > 0);

  if (!hasServices) return null;

  return (
    <Section
      value="additional-services"
      title="Additional Services"
      icon={FileText}
    >
      <FieldsGrid>
        <Field
          label="Requested"
          value={additionalRequested}
          icon={CheckCircle2}
        />
        <Field
          label="Total Additional Fees"
          value={additionalTotal}
          icon={FileText}
          format={formatMoney}
        />
      </FieldsGrid>

      {additionalServices.length === 0 ? (
        <EmptyNote>No additional services selected.</EmptyNote>
      ) : (
        <Group>
          <CompactTable
            headers={["Name", "Service ID", "Description", "Fee"]}
            rows={additionalServices.map((service: any) => [
              service.name,
              service.service_id,
              service.description,
              formatMoney(service.fee),
            ])}
          />
        </Group>
      )}
    </Section>
  );
}

export function SurveySection({
  applicationId,
  responses,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  responses: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
  if (!responses.length) return null;
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
        syncDeclaration.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncDeclaration.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="survey"
      title="Survey"
      icon={FileText}
      action={action}
      badge={
        <Badge variant="secondary" className="text-[11px]">
          {responses.length}
        </Badge>
      }
      footer={syncNote}
    >
      <Group>
        {responses.map((resp: any, index: number) => (
          <div key={index} className="col-span-full space-y-1">
            <Badge variant="outline" className="text-[11px]">
              Response {index + 1}
            </Badge>
            <CompactTable
              headers={["Field", "Value"]}
              rows={Object.entries(resp).map(([key, value]) => [
                key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                String(value),
              ])}
            />
          </div>
        ))}
      </Group>
    </Section>
  );
}
