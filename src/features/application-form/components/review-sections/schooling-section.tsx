/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CompactTable } from "@/features/application-form/components/sync-review/compact-table";
import {
  Field,
  FieldsGrid,
  toText,
} from "@/features/application-form/components/sync-review/field";
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
