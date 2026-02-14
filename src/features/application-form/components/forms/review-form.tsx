/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from "@/components/ui-kit/states";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteRoutes } from "@/shared/constants/site-routes";
import ApplicationStepHeader from "@/features/application-form/components/application-step-header";
import { APPLICATION_STAGE, USER_ROLE } from "@/shared/constants/types";
import {
  useApplicationGetQuery,
  useApplicationSubmitMutation,
} from "@/shared/hooks/use-applications";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useGalaxySyncDocumentsMutation } from "../../hooks/galaxy-sync.hook";
import { Section } from "../sync-review/section";
import { SyncActionButton } from "../sync-review/sync-action-button";
import SyncAllToGalaxyButton, {
  isSyncMetadataComplete,
  SyncSectionAvailability,
} from "../sync/sync-all-to-galaxy";
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
} from "../review-sections";

const ReviewForm = ({
  applicationId,
  showDetails = false,
  showSync = false,
}: {
  applicationId: string;
  showDetails: boolean;
  showSync?: boolean;
  onNavigateToDocuments?: () => void;
}) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const {
    data: response,
    isLoading,
    isError,
  } = useApplicationGetQuery(applicationId);
  const submitApplication = useApplicationSubmitMutation(applicationId);
  const syncDocuments = useGalaxySyncDocumentsMutation(applicationId);

  const application = response?.data;
  const isStaffOrAdmin =
    session?.user.role === USER_ROLE.STAFF || !!session?.user.staff_admin;
  const syncMetadata = application?.sync_metadata ?? null;

  const isSyncComplete = useMemo(
    () =>
      isSyncMetadataComplete(syncMetadata, {
        ignoredKeys: [
          "additional_services",
          "survey_responses",
          "declaration",
          "employment_history",
          "enrollment_data",
          "usi",
        ],
      }),
    [syncMetadata],
  );

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

  const enrollmentData: any = application?.enrollment_data;
  const emergencyContacts = application?.emergency_contacts || [];
  const qualificationsData = Array.isArray(application?.qualifications)
    ? { qualifications: application.qualifications, has_qualifications: null }
    : ((application?.qualifications as any) ?? null);
  const qualificationsArray = Array.isArray(qualificationsData?.qualifications)
    ? qualificationsData.qualifications
    : [];
  const hasQualificationsAnswer =
    qualificationsData?.has_qualifications ?? null;
  const hasQualificationsSection =
    qualificationsArray.length > 0 || !!hasQualificationsAnswer;
  const hasEmploymentHistory = Array.isArray(application?.employment_history)
    ? application?.employment_history.length > 0
    : !!application?.employment_history;
  const hasAdditionalServices =
    !!application?.additional_services &&
    ((Array.isArray(application?.additional_services) &&
      application?.additional_services.length > 0) ||
      (typeof application?.additional_services === "object" &&
        application?.additional_services !== null &&
        "services" in application.additional_services &&
        Array.isArray((application.additional_services as any).services) &&
        (application.additional_services as any).services.length > 0));

  const syncAvailability = useMemo<SyncSectionAvailability>(() => {
    return {
      enrollment: !!enrollmentData,
      personalDetails: !!application?.personal_details,
      emergencyContacts: emergencyContacts.length > 0,
      healthCover: !!application?.health_cover_policy,
      language: !!application?.language_cultural_data,
      disability: !!application?.disability_support,
      schooling: !!application?.schooling_history,
      qualifications: hasQualificationsSection,
      employment: hasEmploymentHistory,
      usi: false,
      survey: (application?.survey_responses?.length ?? 0) > 0,
      documents: true,
    };
  }, [
    application?.disability_support,
    application?.health_cover_policy,
    application?.language_cultural_data,
    application?.personal_details,
    application?.schooling_history,
    application?.survey_responses,
    emergencyContacts.length,
    hasEmploymentHistory,
    enrollmentData,
    hasQualificationsSection,
  ]);

  const sections = useMemo(() => {
    const values: string[] = [];
    if (enrollmentData) values.push("enrollment");
    if (application?.personal_details) values.push("personal");
    if (emergencyContacts.length) values.push("emergency-contacts");
    if (application?.health_cover_policy) values.push("health-cover");
    if (application?.language_cultural_data) values.push("language-cultural");
    if (application?.disability_support) values.push("disability-support");
    if (application?.schooling_history) values.push("schooling");
    if (hasQualificationsSection) values.push("qualifications");
    if (hasEmploymentHistory) values.push("employment");
    if (application?.usi) values.push("usi");
    if (hasAdditionalServices) values.push("additional-services");
    if (application?.survey_responses?.length) values.push("survey");
    return values;
  }, [
    application?.disability_support,
    application?.health_cover_policy,
    application?.language_cultural_data,
    application?.personal_details,
    application?.schooling_history,
    application?.survey_responses,
    application?.usi,
    emergencyContacts.length,
    hasEmploymentHistory,
    hasAdditionalServices,
    enrollmentData,
    hasQualificationsSection,
  ]);

  const defaultOpenValues = useMemo(() => {
    const values: string[] = [];
    if (sections.includes("enrollment")) values.push("enrollment");
    if (sections.includes("personal")) values.push("personal");
    if (!values.length && sections.length) values.push(sections[0]);
    return values.length ? values : undefined;
  }, [sections]);

  const handleFormSubmit = () => {
    if (applicationId) {
      toast.success("Submisison updated successfully!");
      submitApplication.mutate();
      redirect(siteRoutes.dashboard.application.id.root(applicationId));
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  if (!application) return <NotFoundState />;

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

      {/* <pre>{JSON.stringify(application.sync_metadata, null, 2)}</pre> */}

      {application.current_stage !== APPLICATION_STAGE.DRAFT &&
        isStaffOrAdmin && (
          <>
            {showSync && !isSyncComplete && (
              <div className="flex items-center justify-end gap-2">
                <SyncAllToGalaxyButton
                  applicationId={applicationId}
                  syncMetadata={syncMetadata}
                  availability={syncAvailability}
                />
              </div>
            )}
          </>
        )}

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
          syncMeta={syncMetadata?.enrollment_data}
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
          hasQualifications={hasQualificationsAnswer}
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

        <Section
          value="Documents"
          title="Documents"
          icon={FileText}
          action={
            <SyncActionButton
              showSync={showSync}
              isStaffOrAdmin={isStaffOrAdmin}
              onClick={() =>
                syncDocuments.mutate(undefined, {
                  onSettled: () => {
                    queryClient.invalidateQueries({
                      queryKey: ["application-get", applicationId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["application-list"],
                    });
                  },
                })
              }
              isPending={syncDocuments.isPending}
              syncMeta={application?.sync_metadata?.documents}
            />
          }
        >
          {!showDetails && (
            <>
              Please visit the{" "}
              <Link
                href={siteRoutes.dashboard.application.id.documents(
                  applicationId,
                )}
                className="text-primary"
              >
                documents tab
              </Link>{" "}
              to view documents.
            </>
          )}
        </Section>
      </Accordion>

      {showDetails ? (
        <ApplicationStepHeader className="mt-4">
          <Button
            onClick={handleFormSubmit}
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
