/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldsGrid,
  formatMoney,
} from "@/features/application-form/components/sync-review/field";
import {
  EmptyNote,
  Section,
} from "@/features/application-form/components/sync-review/section";
import { SyncActionButton } from "@/features/application-form/components/sync-review/sync-action-button";
import {
  SyncMetadataNote,
  type SyncMetadataItem,
} from "@/features/application-form/components/sync-review/sync-metadata-note";
import { useGalaxySyncOshcMutation } from "@/features/application-form/hooks/galaxy-sync.hook";
import { formatUtcToFriendlyLocal } from "@/shared/lib/format-utc-to-local";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FileText, HeartPulse, Shield } from "lucide-react";

export function HealthCoverSection({
  applicationId,
  policy,
  showSync,
  isStaffOrAdmin,
  syncMeta,
}: {
  applicationId: string;
  policy: any;
  showSync: boolean;
  isStaffOrAdmin: boolean;
  syncMeta?: SyncMetadataItem | null;
}) {
  const queryClient = useQueryClient();
  const syncOshc = useGalaxySyncOshcMutation(applicationId);
  if (!policy) return null;
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
        syncOshc.mutate(undefined, { onSettled: invalidateApplication })
      }
      isPending={syncOshc.isPending}
      syncMeta={syncMeta}
    />
  );

  return (
    <Section
      value="health-cover"
      title="Health Cover"
      icon={HeartPulse}
      action={action}
      footer={syncNote}
    >
      <FieldsGrid>
        <Field label="Arrange OSHC" value={policy.arrange_OSHC} icon={Shield} />
      </FieldsGrid>

      {policy.arrange_OSHC ? (
        <FieldsGrid>
          <Field
            label="Provider"
            value={policy.OSHC_provider}
            icon={HeartPulse}
          />
          <Field
            label="Coverage Type"
            value={policy.OSHC_type}
            icon={FileText}
          />
          <Field
            label="Start Date"
            value={
              policy.OSHC_start_date
                ? formatUtcToFriendlyLocal(policy.OSHC_start_date)
                : null
            }
            icon={CalendarDays}
          />
          <Field
            label="End Date"
            value={
              policy.OSHC_end_date
                ? formatUtcToFriendlyLocal(policy.OSHC_end_date)
                : null
            }
            icon={CalendarDays}
          />
          <Field
            label="Duration"
            value={policy.OSHC_duration}
            icon={CalendarDays}
          />
          <Field
            label="Fee"
            value={policy.OSHC_fee}
            icon={FileText}
            format={formatMoney}
          />
        </FieldsGrid>
      ) : (
        <EmptyNote>OSHC will not be arranged.</EmptyNote>
      )}
    </Section>
  );
}
