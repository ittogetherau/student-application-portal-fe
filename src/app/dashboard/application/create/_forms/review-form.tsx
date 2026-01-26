/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ApplicationStepHeader from "@/app/dashboard/application/create/_components/application-step-header";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/constants/types";
import {
  useApplicationGetQuery,
  useApplicationSubmitMutation,
} from "@/hooks/useApplication.hook";
import { FileText, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import {
  AdditionalServicesSection,
  DisabilitySupportSection,
  EmergencyContactsSection,
  EmploymentSection,
  EnrollmentSection,
  HealthCoverSection,
  LanguageCulturalSection,
  PersonalDetailsSection,
  QualificationsSection,
  SchoolingSection,
  SurveySection,
  UsiSection,
} from "./review-form-sections";

const ReviewForm = ({
  applicationId,
  showDetails = false,
  showSync = false,
  onNavigateToDocuments,
}: {
  applicationId: string;
  showDetails: boolean;
  showSync?: boolean;
  onNavigateToDocuments?: () => void;
}) => {
  const { data: session } = useSession();
  const {
    data: response,
    isLoading,
    isError,
  } = useApplicationGetQuery(applicationId);
  const submitApplication = useApplicationSubmitMutation(applicationId);

  const application = response?.data;
  const isStaffOrAdmin =
    session?.user.role === USER_ROLE.STAFF || !!session?.user.staff_admin;
  const syncMetadata = application?.sync_metadata ?? null;

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
  const emergencyContacts = application.emergency_contacts || [];
  const qualificationsArray = Array.isArray(application.qualifications)
    ? application.qualifications
    : (application.qualifications as any)?.qualifications || [];
  const hasEmploymentHistory = Array.isArray(application.employment_history)
    ? application.employment_history.length > 0
    : !!application.employment_history;
  const hasAdditionalServices =
    !!application.additional_services &&
    ((Array.isArray(application.additional_services) &&
      application.additional_services.length > 0) ||
      (typeof application.additional_services === "object" &&
        "services" in application.additional_services &&
        Array.isArray((application.additional_services as any).services) &&
        (application.additional_services as any).services.length > 0));

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
    if (hasEmploymentHistory) values.push("employment");
    if (application.usi) values.push("usi");
    if (hasAdditionalServices) values.push("additional-services");
    if (application.survey_responses?.length) values.push("survey");
    return values;
  }, [
    application.disability_support,
    application.health_cover_policy,
    application.language_cultural_data,
    application.personal_details,
    application.schooling_history,
    application.survey_responses,
    application.usi,
    emergencyContacts.length,
    hasEmploymentHistory,
    hasAdditionalServices,
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
        <EnrollmentSection
          applicationId={applicationId}
          enrollmentData={enrollmentData}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
        />
        <PersonalDetailsSection
          applicationId={applicationId}
          personalDetails={application.personal_details}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.personal_details}
        />
        <EmergencyContactsSection
          applicationId={applicationId}
          contacts={emergencyContacts}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.emergency_contacts}
        />
        <HealthCoverSection
          applicationId={applicationId}
          policy={application.health_cover_policy}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.health_cover_policy}
        />
        <LanguageCulturalSection
          applicationId={applicationId}
          data={application.language_cultural_data}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.language_cultural_data}
        />
        <DisabilitySupportSection
          applicationId={applicationId}
          data={application.disability_support}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.disability_support}
        />
        <SchoolingSection
          applicationId={applicationId}
          schoolingData={application.schooling_history}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.schooling_history}
        />
        <QualificationsSection
          applicationId={applicationId}
          qualifications={qualificationsArray}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.qualifications}
        />
        <EmploymentSection
          applicationId={applicationId}
          employmentHistory={application.employment_history}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.employment_history}
        />
        <UsiSection
          applicationId={applicationId}
          usi={application.usi}
          verified={application.usi_verified}
          verifiedAt={application.usi_verified_at}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.usi}
        />
        <AdditionalServicesSection
          applicationId={applicationId}
          additionalServicesData={application.additional_services}
        />
        <SurveySection
          applicationId={applicationId}
          responses={application.survey_responses || []}
          showSync={showSync}
          isStaffOrAdmin={isStaffOrAdmin}
          syncMeta={syncMetadata?.survey_responses}
        />
      </Accordion>
      {showSync ? (
        <div
          className="flex items-center justify-between rounded-md border bg-card px-3 py-2 transition hover:bg-muted/20"
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToDocuments?.()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onNavigateToDocuments?.();
            }
          }}
        >
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md border bg-muted/30">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm font-semibold">Documents</span>
          </div>
          <span className="text-xs text-muted-foreground">
            View documents
          </span>
        </div>
      ) : null}

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
