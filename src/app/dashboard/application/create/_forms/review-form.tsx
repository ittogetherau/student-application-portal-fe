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
import { Loader2 } from "lucide-react";

// Helper component to display key-value pairs
function DataField({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1.5">
      <dt className="font-medium text-muted-foreground text-sm">{label}:</dt>
      <dd className="md:col-span-2 text-foreground text-sm">{String(value)}</dd>
    </div>
  );
}

// Helper component for section cards
function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-0">{children}</dl>
      </CardContent>
    </Card>
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

  console.log(application?.employment_history);

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
    <div className="space-y-4">
      {showDetails && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Review your application</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please review all information before submitting
            </p>
          </div>
          <Badge
            variant={
              application.current_stage === "draft" ? "secondary" : "default"
            }
          >
            {application.current_stage}
          </Badge>
        </div>
      )}

      <div className="space-y-3">
        {/* Enrollment Details */}
        {!!application.enrollment_data && (
          <ReviewSection title="Enrollment Details">
            <DataField
              label="Campus"
              value={(application.enrollment_data as any).campus}
            />
            <DataField
              label="Course Type"
              value={(application.enrollment_data as any).courseType}
            />
            <DataField
              label="Intake Year"
              value={(application.enrollment_data as any).intakeYear}
            />
            {((application.enrollment_data as any).enrollments || []).map(
              (enr: any, idx: number) => (
                <div
                  key={enr.id}
                  className="mt-2 pt-2 border-t first:mt-0 first:pt-0 first:border-0"
                >
                  <p className="text-xs font-semibold text-primary mb-1">
                    Course {idx + 1}
                  </p>
                  <DataField label="Course" value={enr.course} />
                  <DataField label="Intake Date" value={enr.intakeDate} />
                  <DataField label="Campus" value={enr.campus} />
                </div>
              )
            )}
          </ReviewSection>
        )}

        {/* Personal Details */}
        {application.personal_details && (
          <ReviewSection title="Personal Details">
            <DataField
              label="Given Name"
              value={application.personal_details.given_name}
            />
            <DataField
              label="Middle Name"
              value={application.personal_details.middle_name}
            />
            <DataField
              label="Family Name"
              value={application.personal_details.family_name}
            />
            <DataField
              label="Email"
              value={application.personal_details.email}
            />
            <DataField
              label="Phone"
              value={application.personal_details.phone}
            />
            <DataField
              label="Date of Birth"
              value={application.personal_details.date_of_birth}
            />
            <DataField
              label="Gender"
              value={application.personal_details.gender}
            />
            <DataField
              label="Street Address"
              value={application.personal_details.street_name}
            />
            <DataField
              label="Suburb"
              value={application.personal_details.suburb}
            />
            <DataField
              label="State"
              value={application.personal_details.state}
            />
            <DataField
              label="Postcode"
              value={application.personal_details.postcode}
            />
            <DataField
              label="Country"
              value={application.personal_details.country}
            />
            <DataField
              label="Nationality"
              value={application.personal_details.nationality}
            />
            <DataField
              label="Country of Birth"
              value={application.personal_details.country_of_birth}
            />
            <DataField
              label="Passport Number"
              value={application.personal_details.passport_number}
            />
            <DataField
              label="Passport Expiry"
              value={application.personal_details.passport_expiry}
            />
          </ReviewSection>
        )}

        {/* Emergency Contacts */}
        {application.emergency_contacts &&
          application.emergency_contacts.length > 0 && (
            <ReviewSection title="Emergency Contacts">
              {application.emergency_contacts.map(
                (contact: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-0">
                      {contact.is_primary && (
                        <Badge variant="outline" className="mb-2 text-xs">
                          Primary Contact
                        </Badge>
                      )}
                      <DataField label="Name" value={contact.name} />
                      <DataField
                        label="Relationship"
                        value={contact.relationship}
                      />
                      <DataField label="Phone" value={contact.phone} />
                      <DataField label="Email" value={contact.email} />
                    </div>
                  </div>
                )
              )}
            </ReviewSection>
          )}

        {/* Health Cover Policy */}
        {application.health_cover_policy && (
          <ReviewSection title="Health Cover Policy">
            <DataField
              label="Provider"
              value={application.health_cover_policy.OSHC_provider}
            />
            <DataField
              label="Policy Number"
              value={application.health_cover_policy.OSHC_type}
            />
            <DataField
              label="Coverage Type"
              value={application.health_cover_policy.OSHC_start_date}
            />
            <DataField
              label="Start Date"
              value={application.health_cover_policy.OSHC_end_date}
            />
            <DataField
              label="End Date"
              value={application.health_cover_policy.OSHC_duration}
            />
            <DataField
              label="End Date"
              value={application.health_cover_policy.OSHC_fee}
            />
          </ReviewSection>
        )}

        {/* Language & Cultural Data */}
        {application.language_cultural_data && (
          <ReviewSection title="Language & Cultural Information">
            <DataField
              label="First Language"
              value={application.language_cultural_data.first_language}
            />
            <DataField
              label="Other Languages"
              value={application.language_cultural_data.other_languages?.join(
                ", "
              )}
            />
            <DataField
              label="Indigenous Status"
              value={application.language_cultural_data.indigenous_status}
            />
            <DataField
              label="Country of Birth"
              value={application.language_cultural_data.country_of_birth}
            />
            <DataField
              label="Citizenship Status"
              value={application.language_cultural_data.citizenship_status}
            />
            <DataField
              label="English Test Type"
              value={application.language_cultural_data.english_test_type}
            />
            <DataField
              label="English Test Score"
              value={application.language_cultural_data.english_test_score}
            />
            <DataField
              label="English Test Date"
              value={application.language_cultural_data.english_test_date}
            />
          </ReviewSection>
        )}

        {/* Disability Support */}
        {application.disability_support && (
          <ReviewSection title="Disability Support">
            <DataField
              label="Has Disability"
              value={
                application.disability_support.has_disability ? "Yes" : "No"
              }
            />
            {application.disability_support.has_disability && (
              <>
                <DataField
                  label="Disability Details"
                  value={application.disability_support.disability_details}
                />
                <DataField
                  label="Support Required"
                  value={application.disability_support.support_required}
                />
                <DataField
                  label="Documentation Status"
                  value={application.disability_support.documentation_status}
                />
              </>
            )}
          </ReviewSection>
        )}

        {/* Schooling History */}
        {application.schooling_history && (
          <ReviewSection title="Schooling History">
            {(() => {
              // Handle different possible structures of schooling_history
              const schoolingData: any = application.schooling_history;

              // If it has an entries array property
              if (
                schoolingData.entries &&
                Array.isArray(schoolingData.entries) &&
                schoolingData.entries.length > 0
              ) {
                return schoolingData.entries.map(
                  (school: any, index: number) => (
                    <div key={index} className="mb-3 last:mb-0">
                      {index > 0 && <Separator className="my-3" />}
                      <div className="space-y-0">
                        <DataField
                          label="Institution"
                          value={school.institution}
                        />
                        <DataField label="Country" value={school.country} />
                        <DataField
                          label="Field of Study"
                          value={school.field_of_study}
                        />
                        <DataField
                          label="Qualification Level"
                          value={school.qualification_level}
                        />
                        <DataField
                          label="Start Year"
                          value={school.start_year}
                        />
                        <DataField label="End Year" value={school.end_year} />
                        <DataField label="Result" value={school.result} />
                        <DataField
                          label="Currently Attending"
                          value={school.currently_attending ? "Yes" : "No"}
                        />
                      </div>
                    </div>
                  )
                );
              }

              // If schooling_history is an array itself
              if (Array.isArray(schoolingData)) {
                return schoolingData.map((school: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-0">
                      <DataField
                        label="Institution"
                        value={school.institution}
                      />
                      <DataField label="Country" value={school.country} />
                      <DataField
                        label="Field of Study"
                        value={school.field_of_study}
                      />
                      <DataField
                        label="Qualification Level"
                        value={school.qualification_level}
                      />
                      <DataField label="Start Year" value={school.start_year} />
                      <DataField label="End Year" value={school.end_year} />
                      <DataField label="Result" value={school.result} />
                      <DataField
                        label="Currently Attending"
                        value={school.currently_attending ? "Yes" : "No"}
                      />
                    </div>
                  </div>
                ));
              }

              // If it's an object with key-value pairs, display them
              if (typeof schoolingData === "object" && schoolingData !== null) {
                return Object.entries(schoolingData).map(([key, value]) => (
                  <DataField
                    key={key}
                    label={key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    value={String(value)}
                  />
                ));
              }

              return (
                <p className="text-sm text-muted-foreground">
                  No schooling history available
                </p>
              );
            })()}
          </ReviewSection>
        )}

        {/* Qualifications */}
        {application.qualifications &&
          ((Array.isArray(application.qualifications) &&
            application.qualifications.length > 0) ||
            (typeof application.qualifications === "object" &&
              "qualifications" in application.qualifications &&
              Array.isArray(application.qualifications.qualifications) &&
              application.qualifications.qualifications.length > 0)) && (
            <ReviewSection title="Previous Qualifications">
              {(() => {
                // Handle both API response format (direct array) and form format (object with qualifications array)
                const qualificationsArray = Array.isArray(
                  application.qualifications
                )
                  ? application.qualifications
                  : (application.qualifications as any)?.qualifications || [];

                return qualificationsArray.map((qual: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-0">
                      <DataField
                        label="Qualification Name"
                        value={qual.qualification_name}
                      />
                      <DataField label="Institution" value={qual.institution} />
                      <DataField
                        label="Field of Study"
                        value={qual.field_of_study}
                      />
                      <DataField
                        label="Completion Date"
                        value={qual.completion_date}
                      />
                      <DataField label="Grade" value={qual.grade} />
                      <DataField
                        label="Certificate Number"
                        value={qual.certificate_number}
                      />
                    </div>
                  </div>
                ));
              })()}
            </ReviewSection>
          )}

        {/* Employment History */}
        {application.employment_history &&
          ((Array.isArray(application.employment_history) &&
            application.employment_history.length > 0) ||
            (typeof application.employment_history === "object" &&
              "entries" in application.employment_history &&
              Array.isArray(application.employment_history.entries) &&
              application.employment_history.entries.length > 0)) && (
            <ReviewSection title="Employment History">
              {(() => {
                // Handle both API response format (object with entries) and form format (direct array)
                const employmentArray = Array.isArray(
                  application.employment_history
                )
                  ? application.employment_history
                  : (application.employment_history as any)?.entries || [];

                return (
                  <>
                    {/* Show employment status if available */}
                    {typeof application.employment_history === "object" &&
                      "employment_status" in application.employment_history &&
                      application.employment_history.employment_status && (
                        <div className="mb-3 pb-3 border-b">
                          <DataField
                            label="Employment Status"
                            value={
                              application.employment_history
                                .employment_status as string
                            }
                          />
                        </div>
                      )}

                    {employmentArray.map((employment: any, index: number) => (
                      <div key={index} className="mb-3 last:mb-0">
                        {index > 0 && <Separator className="my-3" />}
                        <div className="space-y-0">
                          {employment.is_current && (
                            <Badge variant="outline" className="mb-2 text-xs">
                              Current Employment
                            </Badge>
                          )}
                          <DataField
                            label="Employer"
                            value={employment.employer}
                          />
                          <DataField label="Role" value={employment.role} />
                          <DataField
                            label="Industry"
                            value={employment.industry}
                          />
                          <DataField
                            label="Start Date"
                            value={employment.start_date}
                          />
                          <DataField
                            label="End Date"
                            value={employment.end_date}
                          />
                          <DataField
                            label="Responsibilities"
                            value={employment.responsibilities}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </ReviewSection>
          )}

        {/* USI */}
        {application.usi && (
          <ReviewSection title="USI (Unique Student Identifier)">
            <DataField label="USI Number" value={application.usi} />
            <DataField
              label="USI Verified"
              value={application.usi_verified ? "Yes" : "No"}
            />
            {application.usi_verified_at && (
              <DataField
                label="Verified At"
                value={new Date(application.usi_verified_at).toLocaleString()}
              />
            )}
          </ReviewSection>
        )}

        {/* Additional Services */}
        {application.additional_services &&
          ((Array.isArray(application.additional_services) &&
            application.additional_services.length > 0) ||
            (typeof application.additional_services === "object" &&
              "services" in application.additional_services &&
              Array.isArray(application.additional_services.services) &&
              application.additional_services.services.length > 0)) && (
            <ReviewSection title="Additional Services">
              {(() => {
                const services = Array.isArray(application.additional_services)
                  ? application.additional_services
                  : (application.additional_services as any)?.services || [];
                return services.map((service: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-0">
                      <DataField label="Service Name" value={service.name} />
                      <DataField
                        label="Service ID"
                        value={service.service_id}
                      />
                      <DataField
                        label="Fee"
                        value={service.fee ? `$${service.fee}` : null}
                      />
                    </div>
                  </div>
                ));
              })()}
            </ReviewSection>
          )}

        {/* Survey Responses */}
        {application.survey_responses &&
          application.survey_responses.length > 0 && (
            <ReviewSection title="Survey Responses">
              {application.survey_responses.map(
                (response: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-0">
                      {Object.entries(response).map(([key, value]) => (
                        <DataField
                          key={key}
                          label={key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          value={String(value)}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </ReviewSection>
          )}

        {/* Form Metadata */}
        {application.form_metadata && (
          <ReviewSection title="Application Information">
            <DataField
              label="Form Version"
              value={application.form_metadata.version}
            />
            <DataField
              label="Last Saved"
              value={
                application.form_metadata.last_saved_at
                  ? new Date(
                      application.form_metadata.last_saved_at
                    ).toLocaleString()
                  : null
              }
            />
            <DataField
              label="Last Edited Section"
              value={application.form_metadata.last_edited_section}
            />
            <DataField
              label="Auto Save Count"
              value={application.form_metadata.auto_save_count}
            />
            {application.form_metadata.completed_sections && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1.5">
                <dt className="font-medium text-muted-foreground text-sm">
                  Completed Sections:
                </dt>
                <dd className="md:col-span-2">
                  <div className="flex flex-wrap gap-1.5">
                    {application.form_metadata.completed_sections.map(
                      (section: string) => (
                        <Badge
                          key={section}
                          variant="outline"
                          className="text-xs"
                        >
                          {section.replace(/_/g, " ")}
                        </Badge>
                      )
                    )}
                  </div>
                </dd>
              </div>
            )}
          </ReviewSection>
        )}
      </div>

      {showDetails && (
        <ApplicationStepHeader className="mt-6">
          <Button
            onClick={() => {
              if (applicationId) {
                submitApplication.mutate();
              }
            }}
            disabled={
              submitApplication.isPending || !applicationId || isLoading
            }
            size="lg"
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
      )}
    </div>
  );
};

export default ReviewForm;
