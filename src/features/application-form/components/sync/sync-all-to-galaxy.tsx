"use client";

import { Button } from "@/components/ui/button";
import { ApplicationSyncMetadata } from "@/service/application.service";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGalaxySyncDisabilityMutation,
  useGalaxySyncDocumentsMutation,
  useGalaxySyncEmergencyContactMutation,
  useGalaxySyncEmploymentMutation,
  useGalaxySyncEnrollmentMutation,
  useGalaxySyncLanguageMutation,
  useGalaxySyncOshcMutation,
  useGalaxySyncPersonalDetailsMutation,
  useGalaxySyncQualificationsMutation,
  useGalaxySyncSchoolingMutation,
  useGalaxySyncUsiMutation,
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

const SYNC_METADATA_LABELS: Record<string, string> = {
  enrollment_data: "Enrollment",
  personal_details: "Personal details",
  emergency_contacts: "Emergency contacts",
  health_cover_policy: "Health cover",
  language_cultural_data: "Language & cultural",
  disability_support: "Disability support",
  schooling_history: "Schooling history",
  qualifications: "Qualifications",
  employment_history: "Employment",
  usi: "USI",
  documents: "Documents",
  additional_services: "Additional services",
  survey_responses: "Survey/Declaration",
  declaration: "Declaration",
};

let lastSyncMetadataIncompleteLogSignature: string | null = null;

export const isSyncMetadataComplete = (
  syncMetadata: ApplicationSyncMetadata | null,
  options?: {
    ignoredKeys?: (keyof ApplicationSyncMetadata)[];
    allowNullKeys?: (keyof ApplicationSyncMetadata)[];
    requireNoErrors?: boolean;
  },
) => {
  if (!syncMetadata) return false;

  const entries = Object.entries(syncMetadata).filter(
    ([key]) =>
      !options?.ignoredKeys?.includes(key as keyof ApplicationSyncMetadata),
  );

  if (!entries.length) return false;

  const valuesWithKeys = entries
    .map(([key, value]) => ({ key, value }))
    .filter(
      ({ key, value }) =>
        Boolean(value) ||
        (value == null &&
          options?.allowNullKeys?.includes(
            key as keyof ApplicationSyncMetadata,
          )),
    );

  if (!valuesWithKeys.length) return false;

  const incomplete = valuesWithKeys.flatMap(({ key, value }) => {
    const label = SYNC_METADATA_LABELS[key] ?? key;
    if (
      value == null &&
      options?.allowNullKeys?.includes(key as keyof ApplicationSyncMetadata)
    ) {
      return [];
    }
    if (!value) return [{ key, label, reasons: ["missing"] }];

    const reasons: string[] = [];
    if (options?.requireNoErrors && value.last_error) reasons.push("has_error");
    if (value.uptodate !== true) reasons.push("not_uptodate");
    if (!value.last_synced_at) reasons.push("never_synced");

    return reasons.length ? [{ key, label, reasons }] : [];
  });

  const complete = incomplete.length === 0;

  if (!complete) {
    const signature = JSON.stringify({
      ignoredKeys: options?.ignoredKeys ?? [],
      requireNoErrors: options?.requireNoErrors ?? false,
      incomplete,
    });

    if (signature !== lastSyncMetadataIncompleteLogSignature) {
      lastSyncMetadataIncompleteLogSignature = signature;
      console.warn("[isSyncMetadataComplete] Incomplete sync sections:", {
        incomplete,
      });
    }
  }

  return complete;
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
  // const syncDeclaration = useGalaxySyncDeclarationMutation(applicationId);
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
    syncUsi.isPending;

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
