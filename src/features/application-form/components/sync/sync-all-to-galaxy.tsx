"use client";

import { Button } from "@/components/ui/button";
import { ApplicationSyncMetadata } from "@/service/application.service";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGalaxySyncDeclarationMutation,
  useGalaxySyncDisabilityMutation,
  useGalaxySyncDocumentsMutation,
  useGalaxySyncEmergencyContactMutation,
  useGalaxySyncEmploymentMutation,
  useGalaxySyncLanguageMutation,
  useGalaxySyncOshcMutation,
  useGalaxySyncPersonalDetailsMutation,
  useGalaxySyncQualificationsMutation,
  useGalaxySyncSchoolingMutation,
  useGalaxySyncUsiMutation,
  useGalaxySyncEnrollmentMutation,
} from "../../hooks/galaxy-sync.hook";

export type SyncSectionAvailability = {
  enrollment?: boolean;
  personalDetails?: boolean;
  emergencyContacts?: boolean;
  healthCover?: boolean;
  language?: boolean;
  disability?: boolean;
  schooling?: boolean;
  qualifications?: boolean;
  employment?: boolean;
  usi?: boolean;
  documents?: boolean;
  survey?: boolean;
};

interface SyncTaskConfig {
  label: string;
  metaKey: keyof ApplicationSyncMetadata;
  enabled: boolean;
  run: () => Promise<unknown>;
  upToDate: boolean;
}

export const isSyncMetadataComplete = (
  syncMetadata: ApplicationSyncMetadata | null,
  options?: {
    ignoredKeys?: (keyof ApplicationSyncMetadata)[];
    requireNoErrors?: boolean;
  },
) => {
  if (!syncMetadata) return false;

  const entries = Object.entries(syncMetadata).filter(
    ([key]) =>
      !options?.ignoredKeys?.includes(key as keyof ApplicationSyncMetadata),
  );

  if (!entries.length) return false;

  const values = entries.map(([, value]) => value).filter(Boolean);
  if (!values.length) return false;

  return values.every((entry) => {
    if (!entry) return false;
    if (options?.requireNoErrors && entry.last_error) return false;
    return entry.uptodate === true && !!entry.last_synced_at;
  });
};

export interface SyncToGalaxyButtonProps {
  applicationId: string;
  syncMetadata: ApplicationSyncMetadata | null;
  availability?: SyncSectionAvailability;
}

const SYNC_TOAST_ID = "sync-application";

const SyncToGalaxyButton = ({
  applicationId,
  syncMetadata,
  availability,
}: SyncToGalaxyButtonProps) => {
  const queryClient = useQueryClient();
  const syncPersonalDetails =
    useGalaxySyncPersonalDetailsMutation(applicationId);
  const syncEmergencyContacts =
    useGalaxySyncEmergencyContactMutation(applicationId);
  const syncOshc = useGalaxySyncOshcMutation(applicationId);
  const syncLanguage = useGalaxySyncLanguageMutation(applicationId);
  const syncDisability = useGalaxySyncDisabilityMutation(applicationId);
  const syncSchooling = useGalaxySyncSchoolingMutation(applicationId);
  const syncQualifications = useGalaxySyncQualificationsMutation(applicationId);
  const syncEmployment = useGalaxySyncEmploymentMutation(applicationId);
  const syncUsi = useGalaxySyncUsiMutation(applicationId);
  const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
  const syncDocuments = useGalaxySyncDocumentsMutation(applicationId);
  const syncEnrollment = useGalaxySyncEnrollmentMutation(applicationId);

  const {
    enrollment,
    personalDetails,
    emergencyContacts,
    healthCover,
    language,
    disability,
    schooling,
    qualifications,
    employment,
    usi,
    documents,
    survey,
  } = availability ?? {};

  const tasks: SyncTaskConfig[] = [
    {
      label: "Enrollment",
      metaKey: "enrollment_data",
      enabled: enrollment === true,
      upToDate: syncMetadata?.enrollment_data?.uptodate === true,
      run: () => syncEnrollment.mutateAsync(),
    },
    {
      label: "Personal details",
      metaKey: "personal_details",
      enabled: personalDetails === true,
      upToDate: syncMetadata?.personal_details?.uptodate === true,
      run: () => syncPersonalDetails.mutateAsync(),
    },
    {
      label: "Emergency contacts",
      metaKey: "emergency_contacts",
      enabled: emergencyContacts === true,
      upToDate: syncMetadata?.emergency_contacts?.uptodate === true,
      run: () => syncEmergencyContacts.mutateAsync(),
    },
    {
      label: "Health cover",
      metaKey: "health_cover_policy",
      enabled: healthCover === true,
      upToDate: syncMetadata?.health_cover_policy?.uptodate === true,
      run: () => syncOshc.mutateAsync(),
    },
    {
      label: "Language & cultural",
      metaKey: "language_cultural_data",
      enabled: language === true,
      upToDate: syncMetadata?.language_cultural_data?.uptodate === true,
      run: () => syncLanguage.mutateAsync(),
    },
    {
      label: "Disability support",
      metaKey: "disability_support",
      enabled: disability === true,
      upToDate: syncMetadata?.disability_support?.uptodate === true,
      run: () => syncDisability.mutateAsync(),
    },
    {
      label: "Schooling history",
      metaKey: "schooling_history",
      enabled: schooling === true,
      upToDate: syncMetadata?.schooling_history?.uptodate === true,
      run: () => syncSchooling.mutateAsync(),
    },
    {
      label: "Qualifications",
      metaKey: "qualifications",
      enabled: qualifications === true,
      upToDate: syncMetadata?.qualifications?.uptodate === true,
      run: () => syncQualifications.mutateAsync(),
    },
    {
      label: "Employment",
      metaKey: "employment_history",
      enabled: employment === true,
      upToDate: syncMetadata?.employment_history?.uptodate === true,
      run: () => syncEmployment.mutateAsync(),
    },
    {
      label: "USI",
      metaKey: "usi",
      enabled: usi === true,
      upToDate: syncMetadata?.usi?.uptodate === true,
      run: () => syncUsi.mutateAsync(),
    },
    {
      label: "Documents",
      metaKey: "documents",
      enabled: documents !== false,
      upToDate: syncMetadata?.documents?.uptodate === true,
      run: () => syncDocuments.mutateAsync(),
    },
    {
      label: "Survey/Declaration",
      metaKey: "survey_responses",
      enabled: survey === true,
      upToDate: syncMetadata?.survey_responses?.uptodate === true,
      run: () => syncDeclaration.mutateAsync(),
    },
  ];

  const runnable = tasks.filter((task) => task.enabled && !task.upToDate);

  const isSyncing =
    syncPersonalDetails.isPending ||
    syncEmergencyContacts.isPending ||
    syncOshc.isPending ||
    syncLanguage.isPending ||
    syncDisability.isPending ||
    syncSchooling.isPending ||
    syncQualifications.isPending ||
    syncEnrollment.isPending ||
    syncEmployment.isPending ||
    syncDocuments.isPending ||
    syncUsi.isPending ||
    syncDeclaration.isPending;

  const handleSync = async () => {
    try {
      if (!runnable.length) {
        toast("Everything is already synced.", { id: SYNC_TOAST_ID });
        return;
      }

      toast.loading("Syncing sections to Galaxy...", { id: SYNC_TOAST_ID });

      const results = await Promise.allSettled(
        runnable.map(async (task) => {
          await task.run();
          return task.label;
        }),
      );

      const failures = results.filter((result) => result.status === "rejected");

      if (failures.length) {
        toast.error(
          `Failed to sync ${failures.length} section${failures.length === 1 ? "" : "s"}.`,
          { id: SYNC_TOAST_ID },
        );
        return;
      }

      toast.success("All sections synced to Galaxy.", { id: SYNC_TOAST_ID });
    } finally {
      queryClient.invalidateQueries({
        queryKey: ["application-get", applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["application-list"] });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1 px-2 text-xs"
      onClick={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      Sync All To Galaxy
    </Button>
  );
};

export default SyncToGalaxyButton;
