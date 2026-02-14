/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { CompactTable } from "@/features/application-form/components/sync-review/compact-table";
import {
  Field,
  FieldsGrid,
  toText,
} from "@/features/application-form/components/sync-review/field";
import {
  Group,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import { useGalaxySyncEmploymentMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";

export function EmploymentSection({
  applicationId,
  employmentHistory,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  employmentHistory: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncEmployment = useGalaxySyncEmploymentMutation(applicationId);
  const invalidateApplication = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-get", applicationId],
    });
    queryClient.invalidateQueries({ queryKey: ["application-list"] });
  };
  const employmentArray = Array.isArray(employmentHistory)
    ? employmentHistory
    : employmentHistory?.entries || [];
  const employmentStatus =
    typeof employmentHistory === "object" &&
    employmentHistory &&
    "employment_status" in employmentHistory
      ? (employmentHistory as any).employment_status
      : null;

  if (!employmentArray.length && !employmentStatus) return null;
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
        syncEmployment.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncEmployment.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="employment"
      title="Employment"
      icon={Briefcase}
      action={action}
      badge={
        <Badge variant="secondary" className="text-[11px]">
          {employmentArray.length}
        </Badge>
      }
      footer={syncNote}
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
              employment.start_date
                ? formatUtcToFriendlyLocal(String(employment.start_date))
                : "",
              employment.end_date
                ? formatUtcToFriendlyLocal(String(employment.end_date))
                : "",
              employment.responsibilities,
              toText(employment.is_current),
            ])}
          />
        </Group>
      ) : null}
    </Section>
  );
}
