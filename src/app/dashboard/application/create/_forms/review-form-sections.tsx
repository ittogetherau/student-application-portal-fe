/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGalaxySyncDeclarationMutation,
  useGalaxySyncDisabilityMutation,
  useGalaxySyncDocumentsMutation,
  useGalaxySyncEmergencyContactMutation,
  useGalaxySyncEmploymentMutation,
  useGalaxySyncLanguageMutation,
  useGalaxySyncPersonalDetailsMutation,
  useGalaxySyncQualificationsMutation,
  useGalaxySyncSchoolingMutation,
  useGalaxySyncUsiMutation,
} from "@/hooks/galaxy-sync.hook";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDownIcon,
  Contact2,
  FileText,
  GraduationCap,
  HeartPulse,
  Languages,
  Loader2,
  MapPin,
  RefreshCw,
  Shield,
  User2,
} from "lucide-react";
import { toast } from "react-hot-toast";

type Primitive = string | number | boolean | null | undefined;

const GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5";

const toText = (v: Primitive) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

const formatMaybeDate = (v: Primitive) => {
  const s = toText(v);
  if (!s) return "";
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }
  return s;
};

const formatMaybeDateTime = (v: Primitive) => {
  const s = toText(v);
  if (!s) return "";
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return s;
};

const formatMoney = (v: Primitive) => {
  const s = toText(v);
  if (!s) return "";
  const n = Number(s);
  if (!Number.isNaN(n)) return `$${n.toFixed(2)}`;
  return s;
};

function Field({
  icon: Icon,
  label,
  value,
  format,
  mono,
}: {
  icon?: any;
  label: string;
  value: Primitive;
  format?: (v: Primitive) => string;
  mono?: boolean;
}) {
  const text = format ? format(value) : toText(value);
  if (!text) return null;

  return (
    <div className="flex items-start gap-2 px-2 py-1.5">
      <div className="min-w-0">
        <div className="text-xs leading-4 text-muted-foreground">{label}</div>
        <div
          className={[
            "text-sm leading-5 text-foreground break-words",
            mono ? "font-mono" : "",
          ].join(" ")}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function FieldsGrid({ children }: { children: React.ReactNode }) {
  return <div className={GRID}>{children}</div>;
}

function CompactTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {headers.map((header) => (
              <TableHead
                key={header}
                className="h-8 text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y">
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-muted/30">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="py-2 text-sm">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Section({
  value,
  title,
  icon: Icon,
  badge,
  action,
  children,
}: {
  value: string;
  title: string;
  icon?: any;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-md border border-b-0 bg-card"
    >
      <AccordionPrimitive.Header className="flex items-center gap-2">
        <AccordionPrimitive.Trigger className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md px-3 py-2 text-left text-sm font-medium transition-all outline-none hover:no-underline focus-visible:ring-[3px] [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-2">
            {Icon ? (
              <div className="grid h-6 w-6 place-items-center rounded-md border bg-muted/30">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ) : null}
            <span className="text-sm font-semibold">{title}</span>
            {badge ? <div className="ml-1">{badge}</div> : null}
          </div>
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
        {action ? <div className="pr-3">{action}</div> : null}
      </AccordionPrimitive.Header>
      <AccordionContent className="px-3 pb-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="col-span-full space-y-1">{children}</div>;
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function SyncActionButton({
  showSync,
  isStaffOrAdmin,
  onClick,
  isPending,
}: {
  showSync: boolean;
  isStaffOrAdmin: boolean;
  onClick: () => void;
  isPending: boolean;
}) {
  if (!showSync || !isStaffOrAdmin) return null;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 gap-1 px-2 text-xs"
      onClick={onClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      Sync
    </Button>
  );
}

export function EnrollmentSection({
  applicationId,
  enrollmentData,
  showSync,
  isStaffOrAdmin,
}: {
  applicationId: string;
  enrollmentData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  if (!enrollmentData) return null;
  const enrollments = enrollmentData?.enrollments || [];
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() =>
        toast("Enrollment sync is not available yet.", {
          icon: "ℹ️",
        })
      }
      isPending={false}
    />
  );

  return (
    <Section
      value="enrollment"
      title="Enrollment"
      icon={FileText}
      action={action}
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
      </FieldsGrid>

      {enrollments.length ? (
        <Group>
          <CompactTable
            headers={["Course", "Intake Date", "Campus"]}
            rows={enrollments.map((enr: any) => [
              enr.course,
              formatMaybeDate(enr.intakeDate),
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
}: {
  applicationId: string;
  personalDetails: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncPersonalDetails =
    useGalaxySyncPersonalDetailsMutation(applicationId);
  if (!personalDetails) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncPersonalDetails.mutate()}
      isPending={syncPersonalDetails.isPending}
    />
  );

  return (
    <Section value="personal" title="Personal" icon={User2} action={action}>
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
          value={personalDetails.date_of_birth}
          icon={CalendarDays}
          format={formatMaybeDate}
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
          value={personalDetails.passport_expiry}
          icon={CalendarDays}
          format={formatMaybeDate}
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
}: {
  applicationId: string;
  contacts: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncEmergencyContact =
    useGalaxySyncEmergencyContactMutation(applicationId);
  if (!contacts.length) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncEmergencyContact.mutate()}
      isPending={syncEmergencyContact.isPending}
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
}: {
  applicationId: string;
  policy: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  if (!policy) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() =>
        toast("Health cover sync is not available yet.", {
          icon: "",
        })
      }
      isPending={false}
    />
  );

  return (
    <Section
      value="health-cover"
      title="Health Cover"
      icon={HeartPulse}
      action={action}
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
            value={policy.OSHC_start_date}
            icon={CalendarDays}
            format={formatMaybeDate}
          />
          <Field
            label="End Date"
            value={policy.OSHC_end_date}
            icon={CalendarDays}
            format={formatMaybeDate}
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
}: {
  applicationId: string;
  data: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncLanguage = useGalaxySyncLanguageMutation(applicationId);
  if (!data) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncLanguage.mutate()}
      isPending={syncLanguage.isPending}
    />
  );

  const hasAny =
    data.first_language ||
    (data.other_languages && data.other_languages.length > 0) ||
    data.indigenous_status ||
    data.country_of_birth ||
    data.citizenship_status;

  return (
    <Section
      value="language-cultural"
      title="Language & Cultural"
      icon={Languages}
      action={action}
    >
      <FieldsGrid>
        <Field
          label="First Language"
          value={data.first_language}
          icon={Languages}
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
}: {
  applicationId: string;
  data: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncDisability = useGalaxySyncDisabilityMutation(applicationId);
  if (!data) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncDisability.mutate()}
      isPending={syncDisability.isPending}
    />
  );

  return (
    <Section
      value="disability-support"
      title="Disability Support"
      icon={Shield}
      action={action}
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
}: {
  applicationId: string;
  schoolingData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncSchooling = useGalaxySyncSchoolingMutation(applicationId);
  if (!schoolingData) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncSchooling.mutate()}
      isPending={syncSchooling.isPending}
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
}: {
  applicationId: string;
  qualifications: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncQualifications = useGalaxySyncQualificationsMutation(applicationId);
  if (!qualifications.length) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncQualifications.mutate()}
      isPending={syncQualifications.isPending}
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
            formatMaybeDate(qual.completion_date),
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
}: {
  applicationId: string;
  employmentHistory: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncEmployment = useGalaxySyncEmploymentMutation(applicationId);
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
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncEmployment.mutate()}
      isPending={syncEmployment.isPending}
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
              formatMaybeDate(employment.start_date),
              formatMaybeDate(employment.end_date),
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
}: {
  applicationId: string;
  usi: string | null;
  verified: boolean;
  verifiedAt: string | null;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncUsi = useGalaxySyncUsiMutation(applicationId);
  if (!usi) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncUsi.mutate()}
      isPending={syncUsi.isPending}
    />
  );

  return (
    <Section value="usi" title="USI" icon={Shield} action={action}>
      <FieldsGrid>
        <Field label="USI Number" value={usi} icon={Shield} mono />
        <Field label="Verified" value={verified} icon={CheckCircle2} />
        <Field
          label="Verified At"
          value={verifiedAt}
          icon={CalendarDays}
          format={formatMaybeDateTime}
        />
      </FieldsGrid>
    </Section>
  );
}

export function AdditionalServicesSection({
  applicationId,
  additionalServicesData,
  showSync,
  isStaffOrAdmin,
}: {
  applicationId: string;
  additionalServicesData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncDocuments = useGalaxySyncDocumentsMutation(applicationId);
  if (!additionalServicesData) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncDocuments.mutate()}
      isPending={syncDocuments.isPending}
    />
  );

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
        s?.fee != null
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
      action={action}
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
}: {
  applicationId: string;
  responses: any[];
  showSync: boolean;
  isStaffOrAdmin: boolean;
}) {
  const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
  if (!responses.length) return null;
  const action = (
    <SyncActionButton
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      onClick={() => syncDeclaration.mutate()}
      isPending={syncDeclaration.isPending}
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
