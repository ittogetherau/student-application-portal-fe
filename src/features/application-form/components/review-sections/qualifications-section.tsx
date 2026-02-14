/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { CompactTable } from "@/features/application-form/components/sync-review/compact-table";
import {
  Field,
  FieldsGrid,
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
import { useGalaxySyncQualificationsMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, GraduationCap } from "lucide-react";

export function QualificationsSection({
  applicationId,
  qualifications,
  hasQualifications,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  qualifications: any[];
  hasQualifications?: string | null;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncQualifications = useGalaxySyncQualificationsMutation(applicationId);
  if (!qualifications.length && !hasQualifications) return null;
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
        syncQualifications.mutate(undefined, {
          onSettled: invalidateApplication,
        })
      }
      isPending={syncQualifications.isPending}
      syncMeta={syncMeta}
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
      footer={syncNote}
    >
      {hasQualifications ? (
        <FieldsGrid>
          <Field
            label="Has Previous Qualifications"
            value={hasQualifications}
            icon={CheckCircle2}
          />
        </FieldsGrid>
      ) : null}

      {!qualifications.length && hasQualifications === "No" ? (
        <EmptyNote>No previous qualifications added.</EmptyNote>
      ) : null}

      {qualifications.length ? (
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
              qual.completion_date
                ? formatUtcToFriendlyLocal(String(qual.completion_date))
                : "",
              qual.grade,
              qual.certificate_number,
            ])}
          />
        </Group>
      ) : null}
    </Section>
  );
}
