/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useApplicationGetQuery,
  useApplicationSubmitMutation,
} from "@/hooks/useApplication.hook";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Contact2,
  FileText,
  GraduationCap,
  HeartPulse,
  Languages,
  Loader2,
  MapPin,
  Shield,
  User2,
} from "lucide-react";
import { useMemo } from "react";

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
      {/* {Icon ? (
        <div className="mt-0.5 shrink-0 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
      ) : null} */}
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
  children,
}: {
  value: string;
  title: string;
  icon?: any;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-md border border-b-0 bg-card"
    >
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          {Icon ? (
            <div className="grid h-6 w-6 place-items-center rounded-md border bg-muted/30">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          ) : null}
          <span className="text-sm font-semibold">{title}</span>
          {badge ? <div className="ml-1">{badge}</div> : null}
        </div>
      </AccordionTrigger>
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

const ReviewForm = ({
  applicationId,
  showDetails = false,
}: {
  applicationId: string;
  showDetails: boolean;
}) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useApplicationGetQuery(applicationId);
  const submitApplication = useApplicationSubmitMutation(applicationId);

  const application = response?.data;

  const stageBadge = useMemo(() => {
    const stage = application?.current_stage;
    if (!stage) return null;
    return (
      <Badge
        variant={stage === "draft" ? "secondary" : "default"}
        className="text-[11px]"
      >
        {stage}
      </Badge>
    );
  }, [application?.current_stage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4">
        <p className="text-destructive">Failed to load application.</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-md border bg-muted/30 p-4">
        <p className="text-muted-foreground">No application data available.</p>
      </div>
    );
  }

  const enrollmentData: any = application.enrollment_data;
  const enrollments = enrollmentData?.enrollments || [];

  const emergencyContacts = application.emergency_contacts || [];

  const schoolingData: any = application.schooling_history;
  const schoolingEntries =
    schoolingData?.entries && Array.isArray(schoolingData.entries)
      ? schoolingData.entries
      : Array.isArray(schoolingData)
      ? schoolingData
      : null;

  const qualificationsArray = Array.isArray(application.qualifications)
    ? application.qualifications
    : (application.qualifications as any)?.qualifications || [];

  const employmentArray = Array.isArray(application.employment_history)
    ? application.employment_history
    : (application.employment_history as any)?.entries || [];

  const employmentStatus =
    typeof application.employment_history === "object" &&
    application.employment_history &&
    "employment_status" in application.employment_history
      ? (application.employment_history as any).employment_status
      : null;

  const additionalServicesRaw = Array.isArray(application.additional_services)
    ? application.additional_services
    : (application.additional_services as any)?.services || [];

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
    (application.additional_services as any)?.total_additional_fees
      ?.parsedValue ??
    (application.additional_services as any)?.total_additional_fees?.source ??
    null;

  const additionalRequested =
    (application.additional_services as any)?.request_additional_services ??
    null;

  const sections = useMemo(() => {
    const values: string[] = [];
    if (enrollmentData) values.push("enrollment");
    if (application.personal_details) values.push("personal");
    if (emergencyContacts.length) values.push("emergency-contacts");
    if (application.health_cover_policy) values.push("health-cover");
    if (application.language_cultural_data) values.push("language-cultural");
    if (application.disability_support) values.push("disability-support");
    if (application.schooling_history) values.push("schooling");
    if (qualificationsArray.length) values.push("qualifications");
    if (employmentArray.length || employmentStatus) values.push("employment");
    if (application.usi) values.push("usi");
    if (
      application.additional_services &&
      ((Array.isArray(application.additional_services) &&
        application.additional_services.length > 0) ||
        (typeof application.additional_services === "object" &&
          "services" in application.additional_services &&
          Array.isArray((application.additional_services as any).services) &&
          (application.additional_services as any).services.length > 0))
    ) {
      values.push("additional-services");
    }
    if (application.survey_responses?.length) values.push("survey");
    return values;
  }, [
    application.additional_services,
    application.disability_support,
    application.health_cover_policy,
    application.language_cultural_data,
    application.personal_details,
    application.schooling_history,
    application.survey_responses,
    application.usi,
    emergencyContacts.length,
    employmentArray.length,
    employmentStatus,
    enrollmentData,
    qualificationsArray.length,
  ]);

  const defaultOpenValues = useMemo(() => {
    const values: string[] = [];
    if (sections.includes("enrollment")) values.push("enrollment");
    if (sections.includes("personal")) values.push("personal");
    if (!values.length && sections.length) values.push(sections[0]);
    return values.length ? values : undefined;
  }, [sections]);

  return (
    <div className="space-y-2">
      {showDetails ? (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold leading-6">
                Review application
              </h3>
              {stageBadge}
            </div>
            <p className="text-sm text-muted-foreground">
              Verify details before submission.
            </p>
          </div>
        </div>
      ) : null}

      <Accordion
        type="multiple"
        defaultValue={defaultOpenValues}
        className="space-y-2"
      >
        {enrollmentData ? (
          <Section value="enrollment" title="Enrollment" icon={FileText}>
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
        ) : null}

        {application.personal_details ? (
          <Section value="personal" title="Personal" icon={User2}>
            <FieldsGrid>
              <Field
                label="Given Name"
                value={application.personal_details.given_name}
                icon={User2}
              />
              <Field
                label="Middle Name"
                value={application.personal_details.middle_name}
                icon={User2}
              />
              <Field
                label="Family Name"
                value={application.personal_details.family_name}
                icon={User2}
              />
              <Field
                label="Email"
                value={application.personal_details.email}
                icon={Contact2}
              />
              <Field
                label="Phone"
                value={application.personal_details.phone}
                icon={Contact2}
                mono
              />
              <Field
                label="Date of Birth"
                value={application.personal_details.date_of_birth}
                icon={CalendarDays}
                format={formatMaybeDate}
              />
              <Field
                label="Gender"
                value={application.personal_details.gender}
                icon={User2}
              />
              <Field
                label="Street Address"
                value={application.personal_details.street_name}
                icon={MapPin}
              />
              <Field
                label="Suburb"
                value={application.personal_details.suburb}
                icon={MapPin}
              />
              <Field
                label="State"
                value={application.personal_details.state}
                icon={MapPin}
              />
              <Field
                label="Postcode"
                value={application.personal_details.postcode}
                icon={MapPin}
                mono
              />
              <Field
                label="Country"
                value={application.personal_details.country}
                icon={MapPin}
              />
              <Field
                label="Nationality"
                value={application.personal_details.nationality}
                icon={Shield}
              />
              <Field
                label="Country of Birth"
                value={application.personal_details.country_of_birth}
                icon={MapPin}
              />
              <Field
                label="Passport Number"
                value={application.personal_details.passport_number}
                icon={Shield}
                mono
              />
              <Field
                label="Passport Expiry"
                value={application.personal_details.passport_expiry}
                icon={CalendarDays}
                format={formatMaybeDate}
              />
            </FieldsGrid>
          </Section>
        ) : null}

        {emergencyContacts.length ? (
          <Section
            value="emergency-contacts"
            title="Emergency Contacts"
            icon={Contact2}
            badge={
              <Badge variant="secondary" className="text-[11px]">
                {emergencyContacts.length}
              </Badge>
            }
          >
            <Group>
              <CompactTable
                headers={["Name", "Relationship", "Phone", "Email", "Primary"]}
                rows={emergencyContacts.map((contact: any) => [
                  contact.name,
                  contact.relationship,
                  contact.phone,
                  contact.email,
                  contact.is_primary ? (
                    <Badge
                      key="primary"
                      variant="secondary"
                      className="text-[11px]"
                    >
                      Primary
                    </Badge>
                  ) : (
                    ""
                  ),
                ])}
              />
            </Group>
          </Section>
        ) : null}

        {application.health_cover_policy ? (
          <Section value="health-cover" title="Health Cover" icon={HeartPulse}>
            <FieldsGrid>
              <Field
                label="Arrange OSHC"
                value={application.health_cover_policy.arrange_OSHC}
                icon={Shield}
              />
            </FieldsGrid>

            {application.health_cover_policy.arrange_OSHC ? (
              <FieldsGrid>
                <Field
                  label="Provider"
                  value={application.health_cover_policy.OSHC_provider}
                  icon={HeartPulse}
                />
                <Field
                  label="Coverage Type"
                  value={application.health_cover_policy.OSHC_type}
                  icon={FileText}
                />
                <Field
                  label="Start Date"
                  value={application.health_cover_policy.OSHC_start_date}
                  icon={CalendarDays}
                  format={formatMaybeDate}
                />
                <Field
                  label="End Date"
                  value={application.health_cover_policy.OSHC_end_date}
                  icon={CalendarDays}
                  format={formatMaybeDate}
                />
                <Field
                  label="Duration"
                  value={application.health_cover_policy.OSHC_duration}
                  icon={CalendarDays}
                />
                <Field
                  label="Fee"
                  value={application.health_cover_policy.OSHC_fee}
                  icon={FileText}
                  format={formatMoney}
                />
              </FieldsGrid>
            ) : (
              <EmptyNote>OSHC will not be arranged.</EmptyNote>
            )}
          </Section>
        ) : null}

        {application.language_cultural_data ? (
          <Section
            value="language-cultural"
            title="Language & Cultural"
            icon={Languages}
          >
            <FieldsGrid>
              <Field
                label="First Language"
                value={application.language_cultural_data.first_language}
                icon={Languages}
              />
              <Field
                label="Other Languages"
                value={
                  application.language_cultural_data.other_languages?.length
                    ? application.language_cultural_data.other_languages.join(
                        ", "
                      )
                    : null
                }
                icon={Languages}
              />
              <Field
                label="Indigenous Status"
                value={application.language_cultural_data.indigenous_status}
                icon={Shield}
              />
              <Field
                label="Country of Birth"
                value={application.language_cultural_data.country_of_birth}
                icon={MapPin}
              />
              <Field
                label="Citizenship Status"
                value={application.language_cultural_data.citizenship_status}
                icon={Shield}
              />
            </FieldsGrid>

            {!application.language_cultural_data.first_language &&
              (!application.language_cultural_data.other_languages ||
                application.language_cultural_data.other_languages.length ===
                  0) &&
              !application.language_cultural_data.indigenous_status &&
              !application.language_cultural_data.country_of_birth &&
              !application.language_cultural_data.citizenship_status && (
                <EmptyNote>
                  No language or cultural information provided.
                </EmptyNote>
              )}
          </Section>
        ) : null}

        {application.disability_support ? (
          <Section
            value="disability-support"
            title="Disability Support"
            icon={Shield}
          >
            <FieldsGrid>
              <Field
                label="Has Disability"
                value={application.disability_support.has_disability}
                icon={Shield}
              />
            </FieldsGrid>
            {application.disability_support.has_disability ? (
              <FieldsGrid>
                <Field
                  label="Details"
                  value={application.disability_support.disability_details}
                  icon={FileText}
                />
                <Field
                  label="Support Required"
                  value={application.disability_support.support_required}
                  icon={FileText}
                />
                <Field
                  label="Documentation"
                  value={application.disability_support.documentation_status}
                  icon={FileText}
                />
              </FieldsGrid>
            ) : null}
          </Section>
        ) : null}

        {application.schooling_history ? (
          <Section value="schooling" title="Schooling" icon={GraduationCap}>
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
        ) : null}

        {qualificationsArray.length ? (
          <Section
            value="qualifications"
            title="Qualifications"
            icon={GraduationCap}
            badge={
              <Badge variant="secondary" className="text-[11px]">
                {qualificationsArray.length}
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
                rows={qualificationsArray.map((qual: any) => [
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
        ) : null}

        {employmentArray.length || employmentStatus ? (
          <Section
            value="employment"
            title="Employment"
            icon={Briefcase}
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
        ) : null}

        {application.usi ? (
          <Section value="usi" title="USI" icon={Shield}>
            <FieldsGrid>
              <Field
                label="USI Number"
                value={application.usi}
                icon={Shield}
                mono
              />
              <Field
                label="Verified"
                value={application.usi_verified}
                icon={CheckCircle2}
              />
              <Field
                label="Verified At"
                value={application.usi_verified_at}
                icon={CalendarDays}
                format={formatMaybeDateTime}
              />
            </FieldsGrid>
          </Section>
        ) : null}

        {application.additional_services &&
        ((Array.isArray(application.additional_services) &&
          application.additional_services.length > 0) ||
          (typeof application.additional_services === "object" &&
            "services" in application.additional_services &&
            Array.isArray((application.additional_services as any).services) &&
            (application.additional_services as any).services.length > 0)) ? (
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
        ) : null}

        {application.survey_responses?.length ? (
          <Section
            value="survey"
            title="Survey"
            icon={FileText}
            badge={
              <Badge variant="secondary" className="text-[11px]">
                {application.survey_responses.length}
              </Badge>
            }
          >
            <Group>
              {application.survey_responses.map((resp: any, index: number) => (
                <div key={index} className="col-span-full space-y-1">
                  <Badge variant="outline" className="text-[11px]">
                    Response {index + 1}
                  </Badge>
                  <CompactTable
                    headers={["Field", "Value"]}
                    rows={Object.entries(resp).map(([key, value]) => [
                      key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()),
                      String(value),
                    ])}
                  />
                </div>
              ))}
            </Group>
          </Section>
        ) : null}
      </Accordion>

      {showDetails ? (
        <ApplicationStepHeader className="mt-4">
          <Button
            onClick={() => {
              if (applicationId) submitApplication.mutate();
            }}
            disabled={
              submitApplication.isPending || !applicationId || isLoading
            }
            size="lg"
            className="h-10"
          >
            {submitApplication.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </ApplicationStepHeader>
      ) : null}
    </div>
  );
};

export default ReviewForm;
