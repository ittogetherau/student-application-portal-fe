/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CompactTable } from "@/features/application-form/components/sync-review/compact-table";
import {
  Field,
  FieldsGrid,
  toText,
} from "@/features/application-form/components/sync-review/field";
import { getUnhandledReviewEntries } from "@/features/application-form/components/review-sections/review-utils";
import {
  EmptyNote,
  Group,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import { useGalaxySyncSchoolingMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, GraduationCap } from "lucide-react";

export function SchoolingSection({
  applicationId,
  schoolingData,
  showSync,
  isStaffOrAdmin,
  syncMeta,
  showRequestChange,
}: {
  applicationId: string;
  schoolingData: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
  showRequestChange?: boolean;
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
      applicationId={applicationId}
      syncMeta={syncMeta}
      showSync={showSync}
      isStaffOrAdmin={isStaffOrAdmin}
      showRequestChange={showRequestChange}
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
  const extraEntries = getUnhandledReviewEntries(
    typeof schoolingData === "object" && schoolingData !== null
      ? schoolingData
      : null,
    ["entries"],
    {
      defaultIcon: GraduationCap,
    },
  );

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
      ) : extraEntries.length ? (
        <FieldsGrid>
          {extraEntries.map((entry) => (
            <Field
              key={entry.key}
              label={entry.label}
              value={entry.value}
              icon={entry.icon ?? FileText}
              format={entry.format}
              mono={entry.mono}
            />
          ))}
        </FieldsGrid>
      ) : (
        <EmptyNote>No schooling history available.</EmptyNote>
      )}

      {schoolingEntries?.length && extraEntries.length ? (
        <FieldsGrid>
          {extraEntries.map((entry) => (
            <Field
              key={entry.key}
              label={entry.label}
              value={entry.value}
              icon={entry.icon ?? FileText}
              format={entry.format}
              mono={entry.mono}
            />
          ))}
        </FieldsGrid>
      ) : null}
    </Section>
  );
}
