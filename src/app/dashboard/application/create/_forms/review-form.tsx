/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

function KV({
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
    <div className="flex items-start gap-2 rounded-md border bg-background px-2.5 py-2">
      {Icon ? (
        <div className="mt-0.5 shrink-0 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      ) : null}
      <div className="min-w-0">
        <div className="text-[11px] leading-4 text-muted-foreground">
          {label}
        </div>
        <div
          className={[
            "text-sm leading-5 text-foreground break-words",
            mono ? "font-mono text-[12.5px]" : "",
          ].join(" ")}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  badge,
  children,
}: {
  title: string;
  icon?: any;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon ? (
              <div className="grid h-7 w-7 place-items-center rounded-md border bg-muted/30">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : null}
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {badge ? <div className="ml-1">{badge}</div> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="col-span-full">
      <div className="flex items-center gap-2 py-1.5">
        <div className="text-xs font-semibold text-primary">{title}</div>
        <Separator className="flex-1" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {children}
      </div>
    </div>
  );
}

const ReviewForm = ({
  applicationId,
  showDetails = true,
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

  return (
    <div className="space-y-3">
      {showDetails ? (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold leading-6">
                Review application
              </h3>
              {stageBadge}
            </div>
            <p className="text-xs text-muted-foreground">
              Verify details before submission.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {!!application.enrollment_data ? (
          <SectionCard title="Enrollment" icon={FileText}>
            <KV
              label="Campus"
              value={(application.enrollment_data as any).campus}
              icon={MapPin}
            />
            <KV
              label="Course Type"
              value={(application.enrollment_data as any).courseType}
              icon={GraduationCap}
            />
            <KV
              label="Intake Year"
              value={(application.enrollment_data as any).intakeYear}
              icon={CalendarDays}
            />

            {((application.enrollment_data as any).enrollments || []).length ? (
              <Group title="Courses">
                {((application.enrollment_data as any).enrollments || []).map(
                  (enr: any, idx: number) => (
                    <div key={enr.id ?? idx} className="col-span-full">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-[11px]">
                          Course {idx + 1}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        <KV
                          label="Course"
                          value={enr.course}
                          icon={GraduationCap}
                        />
                        <KV
                          label="Intake Date"
                          value={enr.intakeDate}
                          icon={CalendarDays}
                          format={formatMaybeDate}
                        />
                        <KV label="Campus" value={enr.campus} icon={MapPin} />
                      </div>
                    </div>
                  )
                )}
              </Group>
            ) : null}
          </SectionCard>
        ) : null}

        {application.personal_details ? (
          <SectionCard title="Personal" icon={User2}>
            <KV
              label="Given Name"
              value={application.personal_details.given_name}
              icon={User2}
            />
            <KV
              label="Middle Name"
              value={application.personal_details.middle_name}
              icon={User2}
            />
            <KV
              label="Family Name"
              value={application.personal_details.family_name}
              icon={User2}
            />
            <KV
              label="Email"
              value={application.personal_details.email}
              icon={Contact2}
            />
            <KV
              label="Phone"
              value={application.personal_details.phone}
              icon={Contact2}
              mono
            />
            <KV
              label="Date of Birth"
              value={application.personal_details.date_of_birth}
              icon={CalendarDays}
              format={formatMaybeDate}
            />
            <KV
              label="Gender"
              value={application.personal_details.gender}
              icon={User2}
            />

            <KV
              label="Street Address"
              value={application.personal_details.street_name}
              icon={MapPin}
            />
            <KV
              label="Suburb"
              value={application.personal_details.suburb}
              icon={MapPin}
            />
            <KV
              label="State"
              value={application.personal_details.state}
              icon={MapPin}
            />
            <KV
              label="Postcode"
              value={application.personal_details.postcode}
              icon={MapPin}
              mono
            />
            <KV
              label="Country"
              value={application.personal_details.country}
              icon={MapPin}
            />
            <KV
              label="Nationality"
              value={application.personal_details.nationality}
              icon={Shield}
            />
            <KV
              label="Country of Birth"
              value={application.personal_details.country_of_birth}
              icon={MapPin}
            />

            <KV
              label="Passport Number"
              value={application.personal_details.passport_number}
              icon={Shield}
              mono
            />
            <KV
              label="Passport Expiry"
              value={application.personal_details.passport_expiry}
              icon={CalendarDays}
              format={formatMaybeDate}
            />
          </SectionCard>
        ) : null}

        {application.emergency_contacts?.length ? (
          <SectionCard
            title="Emergency Contacts"
            icon={Contact2}
            badge={
              <Badge variant="secondary" className="text-[11px]">
                {application.emergency_contacts.length}
              </Badge>
            }
          >
            {application.emergency_contacts.map(
              (contact: any, index: number) => (
                <div key={index} className="col-span-full">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px]">
                      Contact {index + 1}
                    </Badge>
                    {contact.is_primary ? (
                      <Badge variant="secondary" className="text-[11px]">
                        Primary
                      </Badge>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    <KV label="Name" value={contact.name} icon={User2} />
                    <KV
                      label="Relationship"
                      value={contact.relationship}
                      icon={Contact2}
                    />
                    <KV
                      label="Phone"
                      value={contact.phone}
                      icon={Contact2}
                      mono
                    />
                    <KV label="Email" value={contact.email} icon={Contact2} />
                  </div>
                </div>
              )
            )}
          </SectionCard>
        ) : null}

        {application.health_cover_policy && (
          <SectionCard title="Health Cover" icon={HeartPulse}>
            <KV
              label="Arrange OSHC"
              value={application.health_cover_policy.arrange_OSHC}
              icon={Shield}
            />

            {application.health_cover_policy.arrange_OSHC ? (
              <>
                <KV
                  label="Provider"
                  value={application.health_cover_policy.OSHC_provider}
                  icon={HeartPulse}
                />

                <KV
                  label="Coverage Type"
                  value={application.health_cover_policy.OSHC_type}
                  icon={FileText}
                />

                <KV
                  label="Start Date"
                  value={application.health_cover_policy.OSHC_start_date}
                  icon={CalendarDays}
                  format={formatMaybeDate}
                />

                <KV
                  label="End Date"
                  value={application.health_cover_policy.OSHC_end_date}
                  icon={CalendarDays}
                  format={formatMaybeDate}
                />

                <KV
                  label="Duration"
                  value={application.health_cover_policy.OSHC_duration}
                  icon={CalendarDays}
                />

                <KV
                  label="Fee"
                  value={application.health_cover_policy.OSHC_fee}
                  icon={FileText}
                  format={(v) => {
                    if (v === null || v === undefined) return "";
                    const n = Number(v);
                    if (!Number.isNaN(n)) return `$${n.toFixed(2)}`;
                    return String(v);
                  }}
                />
              </>
            ) : (
              <div className="col-span-full rounded-md border bg-muted/30 p-3">
                <div className="text-sm text-muted-foreground">
                  OSHC will not be arranged.
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {application.language_cultural_data && (
          <SectionCard title="Language & Cultural" icon={Languages}>
            <KV
              label="First Language"
              value={application.language_cultural_data.first_language}
              icon={Languages}
            />

            <KV
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

            <KV
              label="Indigenous Status"
              value={application.language_cultural_data.indigenous_status}
              icon={Shield}
            />

            <KV
              label="Country of Birth"
              value={application.language_cultural_data.country_of_birth}
              icon={MapPin}
            />

            <KV
              label="Citizenship Status"
              value={application.language_cultural_data.citizenship_status}
              icon={Shield}
            />

            {!application.language_cultural_data.first_language &&
              (!application.language_cultural_data.other_languages ||
                application.language_cultural_data.other_languages.length ===
                  0) &&
              !application.language_cultural_data.indigenous_status &&
              !application.language_cultural_data.country_of_birth &&
              !application.language_cultural_data.citizenship_status && (
                <div className="col-span-full rounded-md border bg-muted/30 p-3">
                  <div className="text-sm text-muted-foreground">
                    No language or cultural information provided.
                  </div>
                </div>
              )}
          </SectionCard>
        )}

        {application.disability_support ? (
          <SectionCard title="Disability Support" icon={Shield}>
            <KV
              label="Has Disability"
              value={application.disability_support.has_disability}
              icon={Shield}
            />
            {application.disability_support.has_disability ? (
              <>
                <KV
                  label="Details"
                  value={application.disability_support.disability_details}
                  icon={FileText}
                />
                <KV
                  label="Support Required"
                  value={application.disability_support.support_required}
                  icon={FileText}
                />
                <KV
                  label="Documentation"
                  value={application.disability_support.documentation_status}
                  icon={FileText}
                />
              </>
            ) : null}
          </SectionCard>
        ) : null}

        {application.schooling_history ? (
          <SectionCard title="Schooling" icon={GraduationCap}>
            {(() => {
              const schoolingData: any = application.schooling_history;

              const renderSchool = (school: any, index: number) => (
                <div key={index} className="col-span-full">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-[11px]">
                      School {index + 1}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    <KV
                      label="Institution"
                      value={school.institution}
                      icon={GraduationCap}
                    />
                    <KV label="Country" value={school.country} icon={MapPin} />
                    <KV
                      label="Field"
                      value={school.field_of_study}
                      icon={FileText}
                    />
                    <KV
                      label="Level"
                      value={school.qualification_level}
                      icon={GraduationCap}
                    />
                    <KV
                      label="Start"
                      value={school.start_year}
                      icon={CalendarDays}
                    />
                    <KV
                      label="End"
                      value={school.end_year}
                      icon={CalendarDays}
                    />
                    <KV
                      label="Result"
                      value={school.result}
                      icon={CheckCircle2}
                    />
                    <KV
                      label="Currently Attending"
                      value={school.currently_attending}
                      icon={CheckCircle2}
                    />
                  </div>
                </div>
              );

              if (
                schoolingData?.entries &&
                Array.isArray(schoolingData.entries) &&
                schoolingData.entries.length
              ) {
                return schoolingData.entries.map(renderSchool);
              }

              if (Array.isArray(schoolingData) && schoolingData.length) {
                return schoolingData.map(renderSchool);
              }

              if (typeof schoolingData === "object" && schoolingData !== null) {
                return Object.entries(schoolingData).map(([key, value]) => (
                  <KV
                    key={key}
                    label={key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    value={String(value)}
                    icon={FileText}
                  />
                ));
              }

              return (
                <div className="col-span-full text-sm text-muted-foreground">
                  No schooling history available
                </div>
              );
            })()}
          </SectionCard>
        ) : null}

        {application.qualifications &&
        ((Array.isArray(application.qualifications) &&
          application.qualifications.length > 0) ||
          (typeof application.qualifications === "object" &&
            "qualifications" in application.qualifications &&
            Array.isArray((application.qualifications as any).qualifications) &&
            (application.qualifications as any).qualifications.length > 0)) ? (
          <SectionCard
            title="Qualifications"
            icon={GraduationCap}
            badge={
              <Badge variant="secondary" className="text-[11px]">
                {Array.isArray(application.qualifications)
                  ? application.qualifications.length
                  : ((application.qualifications as any)?.qualifications || [])
                      .length}
              </Badge>
            }
          >
            {(() => {
              const qualificationsArray = Array.isArray(
                application.qualifications
              )
                ? application.qualifications
                : (application.qualifications as any)?.qualifications || [];

              return qualificationsArray.map((qual: any, index: number) => (
                <div key={index} className="col-span-full">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-[11px]">
                      Qualification {index + 1}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    <KV
                      label="Name"
                      value={qual.qualification_name}
                      icon={GraduationCap}
                    />
                    <KV
                      label="Institution"
                      value={qual.institution}
                      icon={GraduationCap}
                    />
                    <KV
                      label="Field"
                      value={qual.field_of_study}
                      icon={FileText}
                    />
                    <KV
                      label="Completion"
                      value={qual.completion_date}
                      icon={CalendarDays}
                      format={formatMaybeDate}
                    />
                    <KV label="Grade" value={qual.grade} icon={CheckCircle2} />
                    <KV
                      label="Certificate No."
                      value={qual.certificate_number}
                      icon={Shield}
                      mono
                    />
                  </div>
                </div>
              ));
            })()}
          </SectionCard>
        ) : null}

        {application.employment_history &&
        ((Array.isArray(application.employment_history) &&
          application.employment_history.length > 0) ||
          (typeof application.employment_history === "object" &&
            "entries" in application.employment_history &&
            Array.isArray((application.employment_history as any).entries) &&
            (application.employment_history as any).entries.length > 0)) ? (
          <SectionCard
            title="Employment"
            icon={Briefcase}
            badge={
              <Badge variant="secondary" className="text-[11px]">
                {Array.isArray(application.employment_history)
                  ? application.employment_history.length
                  : ((application.employment_history as any)?.entries || [])
                      .length}
              </Badge>
            }
          >
            {(() => {
              const employmentArray = Array.isArray(
                application.employment_history
              )
                ? application.employment_history
                : (application.employment_history as any)?.entries || [];

              const status =
                typeof application.employment_history === "object" &&
                "employment_status" in application.employment_history
                  ? (application.employment_history as any).employment_status
                  : null;

              return (
                <>
                  {status ? (
                    <div className="col-span-full">
                      <KV
                        label="Employment Status"
                        value={status}
                        icon={Briefcase}
                      />
                    </div>
                  ) : null}

                  {employmentArray.map((employment: any, index: number) => (
                    <div key={index} className="col-span-full">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-[11px]">
                          Job {index + 1}
                        </Badge>
                        {employment.is_current ? (
                          <Badge variant="secondary" className="text-[11px]">
                            Current
                          </Badge>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        <KV
                          label="Employer"
                          value={employment.employer}
                          icon={Briefcase}
                        />
                        <KV
                          label="Role"
                          value={employment.role}
                          icon={Briefcase}
                        />
                        <KV
                          label="Industry"
                          value={employment.industry}
                          icon={FileText}
                        />
                        <KV
                          label="Start"
                          value={employment.start_date}
                          icon={CalendarDays}
                          format={formatMaybeDate}
                        />
                        <KV
                          label="End"
                          value={employment.end_date}
                          icon={CalendarDays}
                          format={formatMaybeDate}
                        />
                        <KV
                          label="Responsibilities"
                          value={employment.responsibilities}
                          icon={FileText}
                        />
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </SectionCard>
        ) : null}

        {application.usi ? (
          <SectionCard title="USI" icon={Shield}>
            <KV label="USI Number" value={application.usi} icon={Shield} mono />
            <KV
              label="Verified"
              value={application.usi_verified}
              icon={CheckCircle2}
            />
            <KV
              label="Verified At"
              value={application.usi_verified_at}
              icon={CalendarDays}
              format={formatMaybeDateTime}
            />
          </SectionCard>
        ) : null}

        {/* Additional Services (fixed for null items + selected filter) */}
        {application.additional_services &&
          ((Array.isArray(application.additional_services) &&
            application.additional_services.length > 0) ||
            (typeof application.additional_services === "object" &&
              "services" in application.additional_services &&
              Array.isArray(
                (application.additional_services as any).services
              ) &&
              (application.additional_services as any).services.length >
                0)) && (
            <SectionCard title="Additional Services" icon={FileText}>
              {(() => {
                const raw = Array.isArray(application.additional_services)
                  ? application.additional_services
                  : (application.additional_services as any)?.services || [];

                // keep only selected + meaningful rows (has at least one displayable field)
                const services = (raw || [])
                  .filter(
                    (s: any) =>
                      s && (s.selected === true || s.selected === undefined)
                  )
                  .filter(
                    (s: any) =>
                      !!toText(s?.name) ||
                      !!toText(s?.service_id) ||
                      !!toText(s?.description) ||
                      s?.fee != null
                  );

                const total =
                  (application.additional_services as any)
                    ?.total_additional_fees?.parsedValue ??
                  (application.additional_services as any)
                    ?.total_additional_fees?.source ??
                  null;

                const requested =
                  (application.additional_services as any)
                    ?.request_additional_services ?? null;

                return (
                  <>
                    <KV
                      label="Requested"
                      value={requested}
                      icon={CheckCircle2}
                    />

                    <KV
                      label="Total Additional Fees"
                      value={total}
                      icon={FileText}
                      format={(v) => {
                        const s = toText(v);
                        if (!s) return "";
                        const n = Number(s);
                        if (!Number.isNaN(n)) return `$${n.toFixed(2)}`;
                        return s;
                      }}
                    />

                    {services.length === 0 ? (
                      <div className="col-span-full rounded-md border bg-muted/30 p-3">
                        <div className="text-sm text-muted-foreground">
                          No additional services selected.
                        </div>
                      </div>
                    ) : (
                      <Group title="Selected Services">
                        {services.map((service: any, index: number) => (
                          <div
                            key={service.service_id ?? index}
                            className="col-span-full"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <Badge variant="outline" className="text-[11px]">
                                Service {index + 1}
                              </Badge>
                              {service.selected ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[11px]"
                                >
                                  Selected
                                </Badge>
                              ) : null}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                              <KV
                                label="Name"
                                value={service.name}
                                icon={FileText}
                              />
                              <KV
                                label="Service ID"
                                value={service.service_id}
                                icon={Shield}
                                mono
                              />
                              <KV
                                label="Description"
                                value={service.description}
                                icon={FileText}
                              />
                              <KV
                                label="Fee"
                                value={service.fee}
                                icon={FileText}
                                format={(v) => {
                                  if (v === null || v === undefined || v === "")
                                    return "";
                                  const n = Number(v);
                                  if (!Number.isNaN(n))
                                    return `$${n.toFixed(2)}`;
                                  return String(v);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </Group>
                    )}
                  </>
                );
              })()}
            </SectionCard>
          )}

        {application.survey_responses?.length ? (
          <SectionCard
            title="Survey"
            icon={FileText}
            badge={
              <Badge variant="secondary" className="text-[11px]">
                {application.survey_responses.length}
              </Badge>
            }
          >
            {application.survey_responses.map((resp: any, index: number) => (
              <div key={index} className="col-span-full">
                <div className="mb-2">
                  <Badge variant="outline" className="text-[11px]">
                    Response {index + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {Object.entries(resp).map(([key, value]) => (
                    <KV
                      key={key}
                      label={key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      value={String(value)}
                      icon={FileText}
                    />
                  ))}
                </div>
              </div>
            ))}
          </SectionCard>
        ) : null}

        {application.form_metadata ? (
          <SectionCard title="Application Meta" icon={FileText}>
            <KV
              label="Form Version"
              value={application.form_metadata.version}
              icon={FileText}
            />
            <KV
              label="Last Saved"
              value={application.form_metadata.last_saved_at}
              icon={CalendarDays}
              format={formatMaybeDateTime}
            />
            <KV
              label="Last Edited"
              value={application.form_metadata.last_edited_section}
              icon={FileText}
            />
            <KV
              label="Auto Saves"
              value={application.form_metadata.auto_save_count}
              icon={FileText}
            />

            {application.form_metadata.completed_sections?.length ? (
              <div className="col-span-full">
                <div className="flex items-center gap-2 py-1.5">
                  <div className="text-xs font-semibold text-primary">
                    Completed Sections
                  </div>
                  <Separator className="flex-1" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {application.form_metadata.completed_sections.map(
                    (section: string) => (
                      <Badge
                        key={section}
                        variant="outline"
                        className="text-[11px]"
                      >
                        {section.replace(/_/g, " ")}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            ) : null}
          </SectionCard>
        ) : null}
      </div>

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